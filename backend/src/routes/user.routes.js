const router = require('express').Router()
const { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/user.controller')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/addresses', getAddresses)
router.post('/addresses', addAddress)
router.put('/addresses/:id', updateAddress)
router.delete('/addresses/:id', deleteAddress)

module.exports = router
