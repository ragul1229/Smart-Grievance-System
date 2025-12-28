const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const { embedText, detectDuplicate, analyzeSentiment, suggestOfficerForCategory, classifyComplaint } = require('../utils/classifier')

// POST /api/ml/suggest
router.post('/suggest', asyncHandler(async (req, res) => {
  const { title, description } = req.body
  if (!title && !description) return res.status(400).json({ message: 'Missing title or description' })
  const text = `${title || ''} ${description || ''}`.trim()
  const embedding = await embedText(text)
  const classification = classifyComplaint(title || '', description || '')
  const dup = await detectDuplicate(embedding, 0.86)
  const officerPick = await suggestOfficerForCategory(classification.category)
  res.json({
    classification,
    duplicate: dup ? { id: dup.grievance._id, score: dup.score, grievanceId: dup.grievance.grievanceId, title: dup.grievance.title } : null,
    suggestedOfficer: officerPick ? { officerId: officerPick.officer._id, officerName: officerPick.officer.name, departmentId: officerPick.department?._id } : null
  })
}))

// POST /api/ml/sentiment
router.post('/sentiment', asyncHandler(async (req, res) => {
  const { text } = req.body
  const s = analyzeSentiment(text || '')
  res.json(s)
}))

module.exports = router
