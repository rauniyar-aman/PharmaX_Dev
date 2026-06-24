const router = require('express').Router()
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cart.controller')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/', getCart)
router.post('/items', addItem)
router.put('/items/:medicineId', updateItem)
router.delete('/items/:medicineId', removeItem)
router.delete('/', clearCart)

module.exports = router
