const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized')
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      res.status(401)
      throw new Error('Not authorized')
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401)
    throw new Error('Token invalid or expired')
  }
})

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401)
      return next(new Error('Not authorized'))
    }
    if (!roles.includes(req.user.role)) {
      res.status(403)
      return next(new Error('Forbidden: insufficient role'))
    }
    next()
  }
}

module.exports = { protect, requireRole }
