const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const API_URL      = 'https://api.anthropic.com/v1/messages'

/**
 * Build the system + user prompt for billing analysis.
 * @param {Array<{name:string, cost:number, usage:number}>} rows
 * @returns {string}
 */
function buildPrompt(rows) {
  const table = rows
    .map((r) => `- ${r.name}: $${r.cost} spend, ${r.usage}% utilisation`)
    .join('\n')

  return `You are a cloud cost optimisation expert. Analyse the following AWS billing data and identify cost-saving opportunities.

BILLING DATA:
${table}

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.
Each element must have exactly these fields:
  "service"  – the AWS service name (string)
  "issue"    – a concise description of the problem (string, ≤ 15 words)
  "action"   – the recommended remediation step (string, ≤ 20 words)
  "saving"   – estimated monthly saving in USD as a number (number)
  "severity" – one of: "critical" | "high" | "medium" | "low"
  "category" – one of: "rightsizing" | "reserved" | "idle" | "storage" | "network" | "architecture"

Produce one entry per service that has a meaningful optimisation opportunity.
Sort by saving descending.`
}

/**
 * Call Claude and return parsed recommendations array.
 * Throws on network error, non-200 status, or JSON parse failure.
 *
 * @param {Array}  rows      – parsed billing rows
 * @param {string} apiKey    – Anthropic API key
 * @returns {Promise<Array>}
 */
export async function analyseWithClaude(rows, apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid API key. Anthropic keys start with "sk-ant-".')
  }

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: buildPrompt(rows),
      },
    ],
  }

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-api-key':               apiKey,
        'anthropic-version':       '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    })
  } catch (networkErr) {
    throw new Error(`Network error: ${networkErr.message}`)
  }

  if (!response.ok) {
    let detail = ''
    try {
      const errBody = await response.json()
      detail = errBody?.error?.message || JSON.stringify(errBody)
    } catch (_) {
      detail = await response.text()
    }
    throw new Error(`Claude API error ${response.status}: ${detail}`)
  }

  const payload = await response.json()

  // Extract text content from the response
  const rawText = payload?.content?.[0]?.text ?? ''

  // Strip any accidental markdown fences Claude might add
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  let recommendations
  try {
    recommendations = JSON.parse(cleaned)
  } catch (parseErr) {
    throw new Error(
      `Failed to parse Claude response as JSON.\n\nRaw response:\n${rawText.slice(0, 400)}`
    )
  }

  if (!Array.isArray(recommendations)) {
    throw new Error('Claude returned a non-array response. Expected a JSON array.')
  }

  // Normalise fields — coerce types defensively
  return recommendations.map((r) => ({
    service:  String(r.service  ?? ''),
    issue:    String(r.issue    ?? ''),
    action:   String(r.action   ?? ''),
    saving:   Number(r.saving   ?? 0),
    severity: ['critical','high','medium','low'].includes(r.severity) ? r.severity : 'medium',
    category: ['rightsizing','reserved','idle','storage','network','architecture'].includes(r.category)
                ? r.category : 'architecture',
  }))
}
