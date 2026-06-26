const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const { ok, created, fail, unauthorized, serverError } = require('../utils/response')
const { sendOtpEmail, sendVerificationEmail } = require('../utils/email')

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// POST /api/auth/register
const register = async (req, res) => {
  const { fullName, email, phone, password } = req.body
  if (!fullName || !email || !password) return fail(res, 'fullName, email, and password are required')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && !existing.otpCode) return fail(res, 'An account with this email already exists', 409)

  if (phone) {
    const phoneUser = await prisma.user.findUnique({ where: { phone } })
    if (phoneUser && phoneUser.email !== email) {
      return fail(res, 'This phone number is already registered', 409)
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const otp = generateOtp()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, otpCode: otp, otpExpiresAt },
    })
  } else {
    await prisma.user.create({
      data: { fullName, email, phone, passwordHash, otpCode: otp, otpExpiresAt },
    })
  }

  let emailSent = true
  try {
    await sendVerificationEmail(email, fullName, otp)
  } catch (err) {
    emailSent = false
    console.error('Failed to send verification email:', err.message)
  }

  console.log(`\n📧 OTP for ${email}: ${otp}\n`)

  const devData = (!emailSent && process.env.NODE_ENV !== 'production') ? { email, otp } : { email }
  created(res, devData, emailSent
    ? 'Account created. Please check your email for the verification code.'
    : `Account created but email delivery failed. Your OTP is: ${otp}`
  )
}

// POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  const { email } = req.body
  if (!email) return fail(res, 'Email is required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return fail(res, 'No account found with this email.', 404)
  if (!user.otpCode && user.otpExpiresAt === null) {
    return fail(res, 'This account is already verified.', 400)
  }

  const otp = generateOtp()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await prisma.user.update({ where: { email }, data: { otpCode: otp, otpExpiresAt } })

  let emailSent = true
  try {
    await sendVerificationEmail(email, user.fullName, otp)
  } catch (err) {
    emailSent = false
    console.error('Failed to resend OTP email:', err.message)
  }

  console.log(`\n📧 Resent OTP for ${email}: ${otp}\n`)

  const devData = (!emailSent && process.env.NODE_ENV !== 'production') ? { otp } : {}
  ok(res, devData, emailSent
    ? 'A new verification code has been sent to your email.'
    : `Email delivery failed. Your OTP is: ${otp}`
  )
}

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return fail(res, 'Email and OTP are required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.otpCode) return fail(res, 'Invalid or expired OTP', 400)
  if (user.otpCode !== otp) return fail(res, 'Invalid OTP. Please check and try again.', 400)
  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return fail(res, 'OTP has expired. Please register again.', 400)
  }

  await prisma.user.update({
    where: { email },
    data: { otpCode: null, otpExpiresAt: null },
  })

  const safeUser = {
    id: user.id, fullName: user.fullName, email: user.email,
    phone: user.phone, role: user.role, createdAt: user.createdAt,
  }

  ok(res, { token: signToken(user), user: safeUser }, 'Email verified successfully. Welcome to PharmaX!')
}

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return fail(res, 'Email and password are required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return unauthorized(res, 'Invalid email or password')

  if (user.otpCode) return fail(res, 'Please verify your email before signing in.', 403)

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return unauthorized(res, 'Invalid email or password')

  const { passwordHash, otpCode, otpExpiresAt, ...safeUser } = user
  ok(res, { token: signToken(user), user: safeUser }, 'Login successful')
}

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, fullName: true, email: true, phone: true,
      role: true, dob: true, gender: true, bloodGroup: true,
      allergies: true, createdAt: true,
    },
  })
  if (!user) return fail(res, 'User not found', 404)
  ok(res, { user })
}

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) return fail(res, 'Email is required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return fail(res, 'No account found with this email address.', 404)

  const otp = generateOtp()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.user.update({ where: { email }, data: { otpCode: otp, otpExpiresAt } })

  let emailSent = true
  try {
    await sendOtpEmail(email, user.fullName, otp)
  } catch (err) {
    emailSent = false
    console.error('Failed to send OTP email:', err.message)
  }

  console.log(`\n🔑 Password reset OTP for ${email}: ${otp}\n`)

  const devMsg = !emailSent
    ? `Email delivery failed. Your OTP is: ${otp}`
    : 'Reset code sent to your email'
  ok(res, (!emailSent && process.env.NODE_ENV !== 'production') ? { otp } : {}, devMsg)
}

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) return fail(res, 'email, otp, and newPassword are required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.otpCode) return fail(res, 'Invalid or expired OTP', 400)
  if (user.otpCode !== otp) return fail(res, 'Invalid OTP. Please check and try again.', 400)
  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return fail(res, 'OTP has expired. Please request a new one.', 400)
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash)
  if (isSamePassword) return fail(res, 'New password cannot be the same as your previous password.', 400)

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { email },
    data: { passwordHash, otpCode: null, otpExpiresAt: null },
  })

  ok(res, {}, 'Password reset successfully')
}

module.exports = { register, resendOtp, verifyEmail, login, getMe, forgotPassword, resetPassword }
