const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(cors());
// Allow larger JSON bodies to accommodate small image uploads (base64) in prototype
app.use(express.json({ limit: '5mb' }));

// Connect to DB
connectDB();

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
// ML endpoints (suggestions, sentiment)
app.use('/api/ml', require('./routes/ml'));


// SLA worker (start)
require('./workers/slaWorker')

// Initialize embedding model (optional for servers with enough resources)
const embedder = require('./utils/embedder')
embedder.init().catch(err => console.warn('Embedding model init failed:', err.message))

// Error handler (must come after routes)
const errorHandler = require('./middleware/errorHandler')
app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Warn if important env vars missing
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Authentication will fail without a secret. Copy `.env.example` to `.env` and set JWT_SECRET.')
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown', err)
})
