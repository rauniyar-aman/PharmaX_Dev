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
  if (!fullName || !email || !phone || !password) return fail(res, 'fullName, email, phone, and password are required')

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing?.isDeleted) {
    return res.status(409).json({
      success: false,
      code: 'ACCOUNT_DELETED',
      message: 'An account with this email was previously deleted.',
      data: { email },
    })
  }

  if (existing && !existing.otpCode) return fail(res, 'An account with this email already exists', 409)

  const phoneUser = await prisma.user.findUnique({ where: { phone } })
  if (phoneUser && phoneUser.email !== email) {
    return fail(res, 'This phone number is already registered', 409)
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

  // Cooldown: if an OTP was sent less than 60 seconds ago, don't send another
  if (user.otpCode && user.otpExpiresAt) {
    const secondsRemaining = (user.otpExpiresAt - Date.now()) / 1000
    if (secondsRemaining > 9 * 60) {
      return ok(res, {}, 'A code was already sent recently. Please check your email.')
    }
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

  if (user.isDeleted) {
    return res.status(410).json({
      success: false,
      code: 'ACCOUNT_DELETED',
      message: 'This account has been deleted.',
      data: { email },
    })
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_DEACTIVATED',
      message: 'This account is deactivated.',
      data: { email },
    })
  }

  if (user.otpCode) return fail(res, 'Please verify your email before signing in.', 403)

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return unauthorized(res, 'Invalid email or password')

  const { passwordHash, otpCode, otpExpiresAt, isDeleted, deletedAt, isActive, ...safeUser } = user
  ok(res, { token: signToken(user), user: safeUser }, 'Login successful')
}

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, fullName: true, email: true, phone: true,
      role: true, dob: true, gender: true, bloodGroup: true,
      allergies: true, avatarUrl: true, createdAt: true,
    },
  })
  if (!user) return fail(res, 'User not found', 404)
  ok(res, { user })
}

// PUT /api/auth/me
const updateProfile = async (req, res) => {
  const { fullName, phone, dob, gender, bloodGroup, allergies } = req.body
  if (!fullName) return fail(res, 'Full name is required')

  if (phone) {
    const phoneUser = await prisma.user.findUnique({ where: { phone } })
    if (phoneUser && phoneUser.id !== req.user.id) {
      return fail(res, 'This phone number is already registered', 409)
    }
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      fullName,
      phone: phone || null,
      dob: dob ? new Date(dob) : null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      allergies: allergies || null,
    },
    select: {
      id: true, fullName: true, email: true, phone: true,
      role: true, dob: true, gender: true, bloodGroup: true,
      allergies: true, avatarUrl: true, createdAt: true,
    },
  })

  ok(res, { user: updated }, 'Profile updated successfully')
}

// POST /api/auth/avatar
const uploadAvatar = async (req, res) => {
  if (!req.file) return fail(res, 'No file uploaded')
  const avatarUrl = `/uploads/avatars/${req.file.filename}`
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl },
    select: {
      id: true, fullName: true, email: true, phone: true,
      role: true, dob: true, gender: true, bloodGroup: true,
      allergies: true, avatarUrl: true, createdAt: true,
    },
  })
  ok(res, { user: updated }, 'Profile picture updated')
}

// POST /api/auth/request-password-change
// Step 1: verify current password, send OTP to email
const requestPasswordChange = async (req, res) => {
  const { currentPassword } = req.body
  if (!currentPassword) return fail(res, 'Current password is required')

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  const match = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!match) return fail(res, 'Current password is incorrect', 401)

  const otp = generateOtp()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await prisma.user.update({ where: { id: req.user.id }, data: { otpCode: otp, otpExpiresAt } })

  let emailSent = true
  try {
    await sendOtpEmail(user.email, user.fullName, otp)
  } catch (err) {
    emailSent = false
    console.error('Failed to send OTP email:', err.message)
  }

  console.log(`\n🔑 Password change OTP for ${user.email}: ${otp}\n`)

  const devData = (!emailSent && process.env.NODE_ENV !== 'production') ? { otp } : {}
  const msg = emailSent ? `OTP sent to ${user.email}` : `Email delivery failed. OTP: ${otp}`
  ok(res, devData, msg)
}

// POST /api/auth/change-password
// Supports two modes:
//   OTP mode (admin):  { otp, newPassword }          — requires prior requestPasswordChange call
//   Direct mode (user): { currentPassword, newPassword } — verifies current password directly
const changePassword = async (req, res) => {
  const { otp, currentPassword, newPassword } = req.body
  if (!newPassword) return fail(res, 'newPassword is required')
  if (newPassword.length < 6) return fail(res, 'New password must be at least 6 characters')

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })

  if (otp) {
    // OTP mode
    if (!user.otpCode) return fail(res, 'No OTP request found. Please start over.', 400)
    if (user.otpCode !== otp) return fail(res, 'Incorrect OTP. Please try again.', 400)
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      await prisma.user.update({ where: { id: req.user.id }, data: { otpCode: null, otpExpiresAt: null } })
      return fail(res, 'OTP has expired. Please request a new one.', 400)
    }
  } else if (currentPassword) {
    // Direct mode
    const match = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!match) return fail(res, 'Current password is incorrect', 401)
  } else {
    return fail(res, 'Either otp or currentPassword is required')
  }

  const isSame = await bcrypt.compare(newPassword, user.passwordHash)
  if (isSame) return fail(res, 'New password cannot be the same as your current password', 400)

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash, otpCode: null, otpExpiresAt: null } })

  ok(res, {}, 'Password changed successfully')
}

// DELETE /api/auth/me — soft delete account
const softDeleteAccount = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { isDeleted: true, deletedAt: new Date(), isActive: false },
  })
  ok(res, {}, 'Account deleted. Your data is retained and can be restored later.')
}

// POST /api/auth/deactivate — temporarily deactivate
const deactivateAccount = async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { isActive: false } })
  ok(res, {}, 'Account deactivated.')
}

// POST /api/auth/restore-request — send OTP to restore deleted/deactivated account
const restoreRequest = async (req, res) => {
  const { email } = req.body
  if (!email) return fail(res, 'Email is required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return fail(res, 'No account found with this email.', 404)
  if (user.isActive && !user.isDeleted) return fail(res, 'This account is already active.', 400)

  // Cooldown: if an OTP was sent less than 60 seconds ago, don't send another
  if (user.otpCode && user.otpExpiresAt) {
    const secondsRemaining = (user.otpExpiresAt - Date.now()) / 1000
    if (secondsRemaining > 9 * 60) {
      return ok(res, {}, 'A code was already sent recently. Please check your email.')
    }
  }

  const otp = generateOtp()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await prisma.user.update({ where: { email }, data: { otpCode: otp, otpExpiresAt } })

  let emailSent = true
  try {
    await sendVerificationEmail(email, user.fullName, otp)
  } catch (err) {
    emailSent = false
    console.error('Failed to send restore OTP:', err.message)
  }
  console.log(`\n🔄 Restore OTP for ${email}: ${otp}\n`)

  const devData = (!emailSent && process.env.NODE_ENV !== 'production') ? { otp } : {}
  ok(res, devData, emailSent
    ? 'Verification code sent to your email.'
    : `Email delivery failed. Your OTP is: ${otp}`)
}

// POST /api/auth/restore-confirm — verify OTP and restore account
const restoreConfirm = async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return fail(res, 'Email and OTP are required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.otpCode) return fail(res, 'Invalid or expired code.', 400)
  if (user.otpCode !== otp) return fail(res, 'Invalid code. Please check and try again.', 400)
  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) return fail(res, 'Code has expired. Request a new one.', 400)

  const restored = await prisma.user.update({
    where: { email },
    data: { isDeleted: false, deletedAt: null, isActive: true, otpCode: null, otpExpiresAt: null },
    select: {
      id: true, fullName: true, email: true, phone: true,
      role: true, avatarUrl: true, createdAt: true,
    },
  })

  ok(res, { token: signToken(restored), user: restored }, 'Account restored! Welcome back.')
}

// GET /api/auth/notifications
const getNotifications = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { notifOrderUpdates: true, notifPrescriptionAlerts: true, notifPromotions: true },
  })
  ok(res, { notifs: user })
}

// PUT /api/auth/notifications
const updateNotifications = async (req, res) => {
  const { notifOrderUpdates, notifPrescriptionAlerts, notifPromotions } = req.body
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      notifOrderUpdates: !!notifOrderUpdates,
      notifPrescriptionAlerts: !!notifPrescriptionAlerts,
      notifPromotions: !!notifPromotions,
    },
  })
  ok(res, {}, 'Notification preferences saved.')
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

module.exports = {
  register, resendOtp, verifyEmail, login, getMe, updateProfile, uploadAvatar,
  requestPasswordChange, changePassword, softDeleteAccount, deactivateAccount,
  restoreRequest, restoreConfirm,
  getNotifications, updateNotifications,
  forgotPassword, resetPassword,
}
