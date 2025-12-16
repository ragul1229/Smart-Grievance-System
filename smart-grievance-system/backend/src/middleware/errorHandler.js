function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  res.status(status)
  res.json({
    message: err.message || 'Server Error',
    // include stack only in development
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  })
}

module.exports = errorHandler
