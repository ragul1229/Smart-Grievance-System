// Explainable keyword fallback + embedding helpers + sentiment
const CATEGORY_KEYWORDS = {
  sanitation: ['garbage', 'trash', 'sewage', 'drain'],
  roads: ['pothole', 'road', 'street', 'traffic'],
  water: ['water', 'tap', 'supply', 'leak'],
  electricity: ['power', 'electricity', 'light', 'outage'],
  general: []
}

const PRIORITY_KEYWORDS = {
  high: ['accident', 'injury', 'danger', 'flood', 'fire', 'hospital'],
  medium: ['leak', 'block', 'breakdown'],
  low: ['delay', 'noise', 'minor']
}

const embedder = require('./embedder')
let sentiment
try {
  const Sentiment = require('sentiment')
  sentiment = new Sentiment()
} catch (err) {
  console.warn('`sentiment` package not installed. Sentiment analysis will be disabled.')
  sentiment = { analyze: (text) => ({ score: 0, tokens: text ? text.split(/\s+/) : [] }) }
}
const Grievance = require('../models/Grievance')
const User = require('../models/User')
const Department = require('../models/Department')

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

async function embedText(text) {
  const arr = await embedder.embedTexts([text])
  return arr[0]
}

function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

// Detect if a given embedding is very similar to existing grievances
// Returns best match {grievance, score} or null
async function detectDuplicate(embedding, threshold = 0.85) {
  // fetch recent grievances with embeddings (limit 200)
  const candidates = await Grievance.find({ embedding: { $exists: true, $ne: [] } }).sort({ createdAt: -1 }).limit(200)
  let best = null
  for (const g of candidates) {
    if (!g.embedding || !g.embedding.length) continue
    const score = cosineSim(embedding, g.embedding)
    if (!best || score > best.score) best = { grievance: g, score }
  }
  if (best && best.score >= threshold) return best
  return null
}

// Analyze sentiment of feedback text
function analyzeSentiment(text) {
  if (!text) return { sentiment: null, score: 0 }
  const r = sentiment.analyze(text)
  const score = r.score
  let sentimentLabel = 'neutral'
  if (score > 1) sentimentLabel = 'positive'
  else if (score < -1) sentimentLabel = 'negative'
  return { sentiment: sentimentLabel, score, tokens: r.tokens }
}

// Suggest an officer for a category (best-effort): prefer officers assigned to category with least open work
async function suggestOfficerForCategory(category) {
  // find departments that handle this category
  const deps = await Department.find({ 'categoryAssignments.category': category }).populate('categoryAssignments.officers')
  if (deps && deps.length) {
    // Flatten all officers for the category
    const officers = []
    for (const d of deps) {
      const entry = d.categoryAssignments.find(a => a.category === category)
      if (!entry) continue
      for (const o of entry.officers) officers.push({ officer: o, department: d })
    }
    if (officers.length) {
      // pick the officer with least assigned open grievances
      let best = null
      for (const o of officers) {
        const count = await Grievance.countDocuments({ assignedOfficer: o.officer._id, status: { $in: ['assigned', 'in_progress'] } })
        if (!best || count < best.count) best = { officer: o.officer, department: o.department, count }
      }
      return best
    }
  }
  // fallback: pick any officer with least load
  const pool = await User.find({ role: 'officer' })
  if (!pool || pool.length === 0) return null
  let best = null
  for (const p of pool) {
    const count = await Grievance.countDocuments({ assignedOfficer: p._id, status: { $in: ['assigned', 'in_progress'] } })
    if (!best || count < best.count) best = { officer: p, count }
  }
  return best
}

module.exports = {
  classifyComplaint,
  embedText,
  cosineSim,
  detectDuplicate,
  analyzeSentiment,
  suggestOfficerForCategory
}

