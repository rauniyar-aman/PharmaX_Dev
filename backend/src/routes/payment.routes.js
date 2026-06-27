const router = require('express').Router()
const { initiateEsewa, esewaSuccess, esewaFailure, placeCodOrder } = require('../controllers/payment.controller')
const { protect } = require('../middleware/auth')

// eSewa — success/failure are public (browser redirect from eSewa, no JWT)
router.post('/esewa/initiate', protect, initiateEsewa)
router.get('/esewa/success',   esewaSuccess)
router.get('/esewa/failure',   esewaFailure)

// Cash on Delivery
router.post('/cod/place', protect, placeCodOrder)

module.exports = router
