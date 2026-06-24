const jwt = require('jsonwebtoken')
const { unauthorized } = require('../utils/response')

const protect = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Access token required')
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    unauthorized(res, 'Invalid or expired token')
  }
}

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

module.exports = { protect, adminOnly }
