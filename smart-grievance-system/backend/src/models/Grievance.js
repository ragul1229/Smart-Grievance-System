const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected', 'escalated'], default: 'submitted' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  grievanceId: { type: String, unique: true },
  slaHours: { type: Number, default: 72 },
  expectedResolutionAt: { type: Date },
  escalated: { type: Boolean, default: false },
  escalationCount: { type: Number, default: 0 },
  feedback: { type: String },
  closedByCitizen: { type: Boolean, default: false },
  images: [{ type: String }],
  lastNote: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

// Generate a simple grievanceId and expectedResolutionAt before saving
grievanceSchema.pre('save', function (next) {
  if (!this.grievanceId) {
    this.grievanceId = `G-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`
  }
  if (!this.expectedResolutionAt && this.slaHours) {
    this.expectedResolutionAt = new Date(Date.now() + this.slaHours * 60 * 60 * 1000)
  }
  next()
})

module.exports = mongoose.model('Grievance', grievanceSchema);
