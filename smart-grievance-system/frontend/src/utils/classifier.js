// Small client-side suggestor using same keywords as backend
const CATEGORY_KEYWORDS = {
  sanitation: ['garbage', 'trash', 'sewage', 'drain'],
  roads: ['pothole', 'road', 'street', 'traffic'],
  water: ['water', 'tap', 'supply', 'leak'],
  electricity: ['power', 'electricity', 'light', 'outage'],
  general: []
}

const PRIORITY_KEYWORDS = {
  high: ['accident', 'injury', 'danger', 'flood', 'fire'],
  medium: ['leak', 'block', 'breakdown'],
  low: ['delay', 'noise', 'minor']
}

export function suggestCategoryPriority(title, description) {
  const text = `${title} ${description}`.toLowerCase()
  let category = 'general'
  let matchedCategory = null
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const k of kws) if (text.includes(k)) { category = cat; matchedCategory = k; break }
    if (matchedCategory) break
  }

  let priority = 'medium'
  let matchedPriority = null
  for (const [p, kws] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const k of kws) if (text.includes(k)) { priority = p; matchedPriority = k; break }
    if (matchedPriority) break
  }
  return { category, priority, explanation: { matchedCategory, matchedPriority } }
}

export const CATEGORIES = Object.keys(CATEGORY_KEYWORDS)
