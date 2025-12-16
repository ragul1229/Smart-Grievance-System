const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  // categoryAssignments allows mapping a category -> list of officer user ids
  categoryAssignments: [
    {
      category: { type: String },
      officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Department', departmentSchema)
