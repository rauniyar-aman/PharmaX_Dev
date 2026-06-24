const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const { ok, created, fail, unauthorized, serverError } = require('../utils/response')

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

// POST /api/auth/register
const register = async (req, res) => {
  const { fullName, email, phone, password } = req.body
  if (!fullName || !email || !password) return fail(res, 'fullName, email, and password are required')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return fail(res, 'An account with this email already exists', 409)

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { fullName, email, phone, passwordHash },
    select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true },
  })

  created(res, { token: signToken(user), user }, 'Account created successfully')
}

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return fail(res, 'Email and password are required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return unauthorized(res, 'Invalid email or password')

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return unauthorized(res, 'Invalid email or password')

  const { passwordHash, ...safeUser } = user
  ok(res, { token: signToken(user), user: safeUser }, 'Login successful')
}

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, fullName: true, email: true, phone: true, role: true, dob: true, gender: true, bloodGroup: true, allergies: true, createdAt: true },
  })
  if (!user) return fail(res, 'User not found', 404)
  ok(res, { user })
}

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) return fail(res, 'Email is required')

  const user = await prisma.user.findUnique({ where: { email } })
  // Always respond with success to avoid email enumeration
  ok(res, {}, 'If that email exists, a reset code has been sent')
}

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) return fail(res, 'email, otp, and newPassword are required')

  // OTP verification is mocked — integrate an email/SMS service here
  if (otp !== '123456') return fail(res, 'Invalid or expired OTP', 400)

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { email }, data: { passwordHash } })
  ok(res, {}, 'Password reset successfully')
}

module.exports = { register, login, getMe, forgotPassword, resetPassword }
