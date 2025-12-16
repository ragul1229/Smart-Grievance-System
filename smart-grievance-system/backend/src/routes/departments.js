const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const { protect, requireRole } = require('../middleware/auth')
const Department = require('../models/Department')

// List departments (any authenticated user) - populate officer details for assignments
router.get('/', protect, asyncHandler(async (req, res) => {
  const deps = await Department.find({}).populate('categoryAssignments.officers', 'name email role')
  res.json({ departments: deps })
}))

// Admin: set category assignments for a department
router.patch('/:id/categories', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { category, officerIds } = req.body
  if (!category || !Array.isArray(officerIds)) {
    res.status(400)
    throw new Error('Missing category or officerIds (array)')
  }
  const dep = await Department.findById(req.params.id)
  if (!dep) {
    res.status(404)
    throw new Error('Department not found')
  }
  const idx = dep.categoryAssignments.findIndex(a => a.category === category)
  if (idx >= 0) {
    dep.categoryAssignments[idx].officers = officerIds
  } else {
    dep.categoryAssignments.push({ category, officers: officerIds })
  }
  await dep.save()
  const populated = await Department.findById(dep._id).populate('categoryAssignments.officers', 'name email role')
  res.json({ department: populated })
}))

// Admin: create department
router.post('/', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { name, description } = req.body
  if (!name) {
    res.status(400)
    throw new Error('Missing name')
  }
  const dep = await Department.create({ name, description })
  res.status(201).json({ department: dep })
}))

// Admin: update
router.patch('/:id', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const dep = await Department.findById(req.params.id)
  if (!dep) {
    res.status(404)
    throw new Error('Department not found')
  }
  dep.name = req.body.name || dep.name
  dep.description = req.body.description || dep.description
  await dep.save()
  res.json({ department: dep })
}))

// Admin: delete
router.delete('/:id', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const dep = await Department.findById(req.params.id)
  if (!dep) {
    res.status(404)
    throw new Error('Department not found')
  }
  await dep.remove()
  res.json({ message: 'Deleted' })
}))

module.exports = router
