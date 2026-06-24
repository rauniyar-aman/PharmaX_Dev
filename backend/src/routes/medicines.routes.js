const router = require('express').Router()
const { getMedicines, getMedicineById, getMedicineReviews, addReview } = require('../controllers/medicines.controller')
const { protect } = require('../middleware/auth')

router.get('/', getMedicines)
router.get('/:id', getMedicineById)
router.get('/:id/reviews', getMedicineReviews)
router.post('/:id/reviews', protect, addReview)

module.exports = router
