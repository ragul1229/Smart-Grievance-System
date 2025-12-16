const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../src/models/User')

dotenv.config()

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  const users = await User.find().select('-password')
  console.log(users)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
