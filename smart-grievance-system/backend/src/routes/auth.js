const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Missing fields')
  }
  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  const user = await User.create({ name, email, password: hash, role: role || 'citizen' })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
}))

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.status(400)
    throw new Error('Invalid credentials')
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    res.status(400)
    throw new Error('Invalid credentials')
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
}))

module.exports = router
