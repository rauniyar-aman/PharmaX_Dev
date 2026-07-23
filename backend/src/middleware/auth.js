const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const { unauthorized } = require('../utils/response')

const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Access token required')
  }

  const token = header.split(' ')[1]
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return unauthorized(res, 'Invalid or expired token')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, isActive: true, isDeleted: true, role: true },
  })

  if (!user || user.isDeleted) return unauthorized(res, 'Account not found')
  if (!user.isActive) return unauthorized(res, 'Your account has been suspended. Please contact support.')

  req.user = decoded
  next()
}

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

module.exports = { protect, adminOnly }
