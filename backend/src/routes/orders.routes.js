const router = require('express').Router()
const { getOrders, getOrderById, createOrder, cancelOrder } = require('../controllers/orders.controller')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/', createOrder)
router.put('/:id/cancel', cancelOrder)

module.exports = router
