const router = require('express').Router()
const { initiateEsewa, esewaSuccess, esewaFailure, placeCodOrder, initiateKhalti, khaltiVerify } = require('../controllers/payment.controller')
const { protect } = require('../middleware/auth')

// eSewa — success/failure are public (browser redirect from eSewa, no JWT)
router.post('/esewa/initiate', protect, initiateEsewa)
router.get('/esewa/success',   esewaSuccess)
router.get('/esewa/failure',   esewaFailure)

// Khalti — verify is public (browser redirect from Khalti, no JWT)
router.post('/khalti/initiate', protect, initiateKhalti)
router.get('/khalti/verify',    khaltiVerify)

// Cash on Delivery
router.post('/cod/place', protect, placeCodOrder)

module.exports = router
