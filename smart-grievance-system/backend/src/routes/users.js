const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const { protect, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const Department = require('../models/Department')

// GET /api/users?role=officer  - admin only
router.get('/', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const role = req.query.role || null
  const filter = {}
  if (role) filter.role = role
  const users = await User.find(filter).select('-password').populate('department', 'name')
  res.json({ users })
}))

// POST /api/users - create user (admin only) - for prototype, admin can create officers
router.post('/', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body
  if (!name || !email || !password || !role) {
    res.status(400)
    throw new Error('Missing fields')
  }
  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }
  const bcrypt = require('bcryptjs')
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  const user = await User.create({ name, email, password: hash, role, department })
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } })
}))

// PATCH /api/users/:id - update user (admin only)
router.patch('/:id', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  user.name = req.body.name || user.name
  user.email = req.body.email || user.email
  if (req.body.department) {
    const dep = await Department.findById(req.body.department)
    if (!dep) {
      res.status(404)
      throw new Error('Department not found')
    }
    user.department = req.body.department
  }
  await user.save()
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } })
}))

// DELETE /api/users/:id - admin only
router.delete('/:id', protect, requireRole(['admin']), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  await user.remove()
  res.json({ message: 'User removed' })
}))

module.exports = router
