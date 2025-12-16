const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const { protect, requireRole } = require('../middleware/auth')
const Grievance = require('../models/Grievance')
const User = require('../models/User')
const Department = require('../models/Department')
const { classifyComplaint } = require('../utils/classifier')

// Submit a grievance (Citizen)
router.post('/', protect, requireRole(['citizen']), asyncHandler(async (req, res) => {
  const { title, description } = req.body
  const images = req.body.images || []
  if (!title || !description) {
    res.status(400)
    throw new Error('Missing title or description')
  }
  // Classify complaint
  const { category, priority, explanation } = classifyComplaint(title, description)
  // Determine default SLA based on priority (hours)
  const slaByPriority = { high: 48, medium: 72, low: 168 }
  const slaHours = slaByPriority[priority] || 72

  // Try to assign based on category assignments (admin-configured)
  let assignedOfficerId = undefined
  let assignedDepartment = undefined
  const depsWithCategory = await Department.find({ 'categoryAssignments.category': category }).populate('categoryAssignments.officers')
  if (depsWithCategory && depsWithCategory.length) {
    // pick a department randomly among matches
    const dep = depsWithCategory[Math.floor(Math.random() * depsWithCategory.length)]
    // find the assignment entry
    const entry = dep.categoryAssignments.find(a => a.category === category)
    const officersForCat = entry?.officers || []
    if (officersForCat.length) {
      const chosen = officersForCat[Math.floor(Math.random() * officersForCat.length)]
      assignedOfficerId = chosen._id || chosen
      assignedDepartment = dep._id
    }
  }

  // fallback: random officer if no category-based assignment found
  if (!assignedOfficerId) {
    const officer = await User.aggregate([{ $match: { role: 'officer' } }, { $sample: { size: 1 } }])
    assignedOfficerId = officer[0]?._id
    assignedDepartment = officer[0]?.department
  }

  const grievance = await Grievance.create({
    title,
    description,
    citizen: req.user._id,
    category,
    priority,
    slaHours,
    assignedOfficer: assignedOfficerId,
    department: assignedDepartment,
    images,
    status: assignedOfficerId ? 'assigned' : 'submitted'
  })

  res.status(201).json({ message: 'Grievance submitted', grievanceId: grievance.grievanceId, classification: { category, priority, explanation } })
}))

// List grievances (role-aware)
router.get('/', protect, asyncHandler(async (req, res) => {
  const q = req.query || {}
  const { status, priority, category } = q
  const filter = {}
  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (category) filter.category = category

  // Role-based visibility
  if (req.user.role === 'citizen') filter.citizen = req.user._id
  if (req.user.role === 'officer') {
    // officers can see grievances assigned to them OR assigned to their department
    filter.$or = [
      { assignedOfficer: req.user._id },
      { department: req.user.department },
    ]
  }
  // admin sees all

  const grievances = await Grievance.find(filter).populate('citizen assignedOfficer department', 'name email role name')
  res.json({ grievances })
}))

// Officer updates status and adds note
router.patch('/:id/status', protect, requireRole(['officer']), asyncHandler(async (req, res) => {
  const { status, note } = req.body
  const grievance = await Grievance.findById(req.params.id)
  if (!grievance) {
    res.status(404)
    throw new Error('Grievance not found')
  }
  // Only assigned officer can update
  if (!grievance.assignedOfficer || grievance.assignedOfficer.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not assigned to you')
  }
  grievance.status = status || grievance.status
  if (note) grievance.lastNote = note
  if (status === 'resolved') grievance.resolvedAt = new Date()
  await grievance.save()
  res.json({ message: 'Status updated', grievance })
}))

// Admin can assign/reassign an officer
router.patch('/:id/assign', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { officerId, departmentId } = req.body
  const grievance = await Grievance.findById(req.params.id)
  if (!grievance) {
    res.status(404)
    throw new Error('Grievance not found')
  }
  if (officerId) {
    // assign to an officer and their department
    const officer = await User.findById(officerId)
    if (!officer) {
      res.status(404)
      throw new Error('Officer not found')
    }
    grievance.assignedOfficer = officerId
    grievance.department = officer.department
    grievance.status = 'assigned'
  } else if (departmentId) {
    // assign to department only (no specific officer)
    const dep = await Department.findById(departmentId)
    if (!dep) {
      res.status(404)
      throw new Error('Department not found')
    }
    grievance.department = departmentId
    grievance.assignedOfficer = undefined
    grievance.status = 'assigned'
  }
  await grievance.save()
  res.json({ message: 'Assigned', grievance })
}))

// Citizen closes with feedback
router.patch('/:id/feedback', protect, requireRole(['citizen']), asyncHandler(async (req, res) => {
  const { feedback, closed } = req.body
  const grievance = await Grievance.findById(req.params.id)
  if (!grievance) {
    res.status(404)
    throw new Error('Grievance not found')
  }
  if (grievance.citizen.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not your grievance')
  }
  if (feedback) grievance.feedback = feedback
  if (closed) grievance.closedByCitizen = true
  await grievance.save()
  res.json({ message: 'Feedback updated', grievance })
}))

module.exports = router
