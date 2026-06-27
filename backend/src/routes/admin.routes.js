const router = require('express').Router()
const {
  getStats, getAdminOrders, updateOrderStatus,
  getAdminPrescriptions, updatePrescriptionStatus,
  getCustomers, getCustomerById, toggleBlockCustomer,
  getReports,
} = require('../controllers/admin.controller')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

router.get('/stats', getStats)

router.get('/orders', getAdminOrders)
router.put('/orders/:id/status', updateOrderStatus)

router.get('/prescriptions', getAdminPrescriptions)
router.put('/prescriptions/:id', updatePrescriptionStatus)

router.get('/customers', getCustomers)
router.get('/customers/:id', getCustomerById)
router.put('/customers/:id/block', toggleBlockCustomer)

router.get('/reports', getReports)

module.exports = router
