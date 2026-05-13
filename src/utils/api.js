const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * POST /analyze/upload — send a CSV File object, get recommendations back
 */
export async function analyzeUpload(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE_URL}/analyze/upload`, {
    method: 'POST',
    body: form,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || `Upload failed (${res.status})`)
  return json
}

/**
 * POST /analyze/sample — run built-in sample data through Gemini
 */
export async function analyzeSample() {
  const res = await fetch(`${BASE_URL}/analyze/sample`, { method: 'POST' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || `Sample analysis failed (${res.status})`)
  return json
}

/**
 * GET /history — paginated list of past analyses
 */
export async function getHistory(limit = 20, skip = 0) {
  const res = await fetch(`${BASE_URL}/history?limit=${limit}&skip=${skip}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || `Failed to load history (${res.status})`)
  return json
}

/**
 * GET /history/{id} — single analysis
 */
export async function getAnalysis(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || `Analysis not found (${res.status})`)
  return json
}

/**
 * DELETE /history/{id}
 */
export async function deleteAnalysis(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`, { method: 'DELETE' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || `Delete failed (${res.status})`)
  return json
}
