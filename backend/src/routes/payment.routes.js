const router = require('express').Router()
const { initiateEsewa, esewaSuccess, esewaFailure, placeCodOrder, initiateKhalti, khaltiVerify } = require('../controllers/payment.controller')
const { protect } = require('../middleware/auth')

router.post('/esewa/initiate', protect, initiateEsewa)
router.get('/esewa/success',   esewaSuccess)
router.get('/esewa/failure',   esewaFailure)

router.post('/khalti/initiate', protect, initiateKhalti)
router.get('/khalti/verify',    khaltiVerify)

router.post('/cod/place', protect, placeCodOrder)

module.exports = router
