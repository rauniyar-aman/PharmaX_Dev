const router = require('express').Router()
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/', getWishlist)
router.post('/:medicineId', addToWishlist)
router.delete('/:medicineId', removeFromWishlist)

module.exports = router
