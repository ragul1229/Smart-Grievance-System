const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const { protect, requireRole } = require('../middleware/auth')
const Grievance = require('../models/Grievance')

// Admin metrics: counts and average resolution time
router.get('/', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const counts = await Grievance.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])
  const resolved = await Grievance.find({ status: 'resolved', resolvedAt: { $exists: true } })
  const avgResolutionMs = resolved.length ? resolved.reduce((acc, r) => acc + (r.resolvedAt - r.createdAt), 0) / resolved.length : 0

  // counts by category
  const byCategory = await Grievance.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ])

  // SLA violations
  const now = new Date()
  const slaViolations = await Grievance.countDocuments({ status: { $nin: ['resolved','rejected'] }, expectedResolutionAt: { $lt: now } })

  // high priority count
  const highPriority = await Grievance.countDocuments({ priority: 'high' })

  // repeated issues (by title)
  const repeated = await Grievance.aggregate([
    { $group: { _id: '$title', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])

  // complaints by officer
  const byOfficer = await Grievance.aggregate([
    { $match: { assignedOfficer: { $exists: true, $ne: null } } },
    { $group: { _id: '$assignedOfficer', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'officer' } },
    { $unwind: { path: '$officer', preserveNullAndEmptyArrays: true } },
    { $project: { officerId: '$_id', officerName: '$officer.name', total: 1, resolved: 1 } }
  ])

  res.json({ counts, avgResolutionHours: avgResolutionMs / (1000 * 60 * 60), byCategory, slaViolations, byOfficer, highPriority, repeated })
}))

module.exports = router