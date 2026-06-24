const router = require('express').Router()
const { getMedicines, getMedicineById, getMedicineReviews, addReview, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicines.controller')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/', getMedicines)
router.get('/:id', getMedicineById)
router.get('/:id/reviews', getMedicineReviews)
router.post('/:id/reviews', protect, addReview)
router.post('/', protect, adminOnly, createMedicine)
router.put('/:id', protect, adminOnly, updateMedicine)
router.delete('/:id', protect, adminOnly, deleteMedicine)

module.exports = router
