/**
 * Simple seeder to create one admin, one officer, and one citizen
 * Run: node scripts/seed.js (ensure MONGO_URI is set in env)
 */
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../src/models/User')

dotenv.config()

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
  { name: 'Officer User', email: 'officer@example.com', password: 'password123', role: 'officer' },
  { name: 'Citizen User', email: 'citizen@example.com', password: 'password123', role: 'citizen' }
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected')
  await User.deleteMany({})
  // create some departments
  const Department = require('../src/models/Department')
  await Department.deleteMany({})
  const deps = await Promise.all([
    Department.create({ name: 'Public Works', description: 'Roads, utilities, maintenance' }),
    Department.create({ name: 'Health', description: 'Health and sanitation' })
  ])

  for (const u of users) {
    // Use the model to hash password through pre-save? simple hash here
    const bcrypt = require('bcryptjs')
    const salt = await bcrypt.genSalt(10)
    u.password = await bcrypt.hash(u.password, salt)
    // give the officer a department
    if (u.role === 'officer') u.department = deps[0]._id
    await User.create(u)
    console.log('Created', u.email)
  }
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
