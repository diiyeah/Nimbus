const REQUIRED_COLUMNS = ['service', 'spend', 'usage']

/**
 * Parse a CSV string into an array of objects.
 * Returns { data, error } — one will always be null.
 *
 * Expected columns (case-insensitive): service, spend, usage
 */
export function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return { data: null, error: 'File appears to be empty or has no data rows.' }
  }

  // Parse header row
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

  // Validate required columns
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col))
  if (missing.length > 0) {
    return {
      data: null,
      error: `Missing required column${missing.length > 1 ? 's' : ''}: ${missing
        .map((c) => `"${c}"`)
        .join(', ')}. Expected: service, spend, usage.`,
    }
  }

  const serviceIdx = headers.indexOf('service')
  const spendIdx   = headers.indexOf('spend')
  const usageIdx   = headers.indexOf('usage')

  const rows = []
  const parseErrors = []

  lines.slice(1).forEach((line, i) => {
    const cols = line.split(',').map((c) => c.trim())

    const service = cols[serviceIdx] || ''
    const rawSpend = cols[spendIdx] || ''
    const rawUsage = cols[usageIdx] || ''

    // Strip currency symbols / % signs
    const spend = parseFloat(rawSpend.replace(/[^0-9.-]/g, ''))
    const usage = parseFloat(rawUsage.replace(/[^0-9.-]/g, ''))

    if (!service) {
      parseErrors.push(`Row ${i + 2}: missing service name.`)
      return
    }
    if (isNaN(spend)) {
      parseErrors.push(`Row ${i + 2}: invalid spend value "${rawSpend}".`)
      return
    }
    if (isNaN(usage)) {
      parseErrors.push(`Row ${i + 2}: invalid usage value "${rawUsage}".`)
      return
    }

    rows.push({ name: service, cost: spend, usage })
  })

  if (rows.length === 0) {
    return {
      data: null,
      error:
        parseErrors.length > 0
          ? `No valid rows found. Issues:\n${parseErrors.join('\n')}`
          : 'No valid data rows found in the file.',
    }
  }

  return { data: rows, error: null, warnings: parseErrors }
}
