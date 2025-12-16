// Very simple explainable classifier based on keywords
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

function classifyComplaint(title, description) {
  const text = `${title} ${description}`.toLowerCase()
  let category = 'general'
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const k of kws) {
      if (text.includes(k)) {
        category = cat
        break
      }
    }
    if (category !== 'general' && category === cat) break
  }

  let priority = 'medium'
  for (const [p, kws] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const k of kws) {
      if (text.includes(k)) {
        priority = p
        break
      }
    }
    if (priority !== 'medium' && Object.keys(PRIORITY_KEYWORDS).includes(priority)) break
  }

  // Explainability: show which keywords matched
  const matchedCategory = Object.entries(CATEGORY_KEYWORDS).flatMap(([cat, kws]) => kws.filter(k => text.includes(k)).map(k => ({ type: 'category', cat, kw: k })))
  const matchedPriority = Object.entries(PRIORITY_KEYWORDS).flatMap(([p, kws]) => kws.filter(k => text.includes(k)).map(k => ({ type: 'priority', p, kw: k })))

  return { category, priority, explanation: { matchedCategory, matchedPriority } }
}

module.exports = { classifyComplaint }
