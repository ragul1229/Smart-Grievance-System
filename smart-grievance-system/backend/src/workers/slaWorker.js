const cron = require('node-cron')
const Grievance = require('../models/Grievance')

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date()
    const overdue = await Grievance.find({ status: { $nin: ['resolved', 'rejected'] }, expectedResolutionAt: { $lt: now } })
    for (const g of overdue) {
      g.escalationCount = (g.escalationCount || 0) + 1
      g.escalated = true
      // Simple escalation: mark escalated and push status to 'escalated'
      g.status = 'escalated'
      await g.save()
      console.log(`Escalated grievance ${g.grievanceId} (count=${g.escalationCount})`)
      // TODO: integrate notification/email in a real system
    }
  } catch (err) {
    console.error('SLA worker error', err)
  }
})

module.exports = cron
