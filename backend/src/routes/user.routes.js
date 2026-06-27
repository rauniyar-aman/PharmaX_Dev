const router = require('express').Router()
const { getProfile, updateProfile, getAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress, uploadAvatarHandler, removeAvatarHandler } = require('../controllers/user.controller')
const { protect } = require('../middleware/auth')
const { uploadAvatar } = require('../middleware/upload')

router.use(protect)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.post('/avatar', uploadAvatar, uploadAvatarHandler)
router.delete('/avatar', removeAvatarHandler)
router.get('/addresses', getAddresses)
router.post('/addresses', addAddress)
router.put('/addresses/:id', updateAddress)
router.put('/addresses/:id/default', setDefaultAddress)
router.delete('/addresses/:id', deleteAddress)

module.exports = router
