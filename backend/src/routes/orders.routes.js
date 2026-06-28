const router = require('express').Router()
const { getOrders, getOrderById, createOrder, cancelOrder, rateOrder } = require('../controllers/orders.controller')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/', createOrder)
router.put('/:id/cancel', cancelOrder)
router.put('/:id/rate', rateOrder)

module.exports = router
