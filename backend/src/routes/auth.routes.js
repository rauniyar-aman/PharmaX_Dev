const router = require('express').Router()
const {
  register, resendOtp, verifyEmail, login, getMe, updateProfile, uploadAvatar,
  changePassword, softDeleteAccount, deactivateAccount,
  restoreRequest, restoreConfirm,
  getNotifications, updateNotifications,
  forgotPassword, resetPassword,
} = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth')
const { uploadAvatar: avatarUploadMiddleware } = require('../middleware/upload')

router.post('/register', register)
router.post('/resend-otp', resendOtp)
router.post('/verify-email', verifyEmail)
router.post('/login', login)
router.post('/restore-request', restoreRequest)
router.post('/restore-confirm', restoreConfirm)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.get('/me', protect, getMe)
router.put('/me', protect, updateProfile)
router.post('/change-password', protect, changePassword)
router.delete('/me', protect, softDeleteAccount)
router.post('/deactivate', protect, deactivateAccount)
router.get('/notifications', protect, getNotifications)
router.put('/notifications', protect, updateNotifications)

router.post('/avatar', protect, (req, res, next) => {
  avatarUploadMiddleware(req, res, err => {
    if (err) return res.status(400).json({ success: false, message: err.message })
    next()
  })
}, uploadAvatar)

module.exports = router
