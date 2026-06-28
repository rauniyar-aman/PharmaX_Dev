const router = require('express').Router()
const {
  getStats, getAdminOrders, updateOrderStatus, updatePaymentStatus,
  getAdminPrescriptions, updatePrescriptionStatus,
  getCustomers, getCustomerById, toggleBlockCustomer,
  getReports, getSettings, updateSettings,
} = require('../controllers/admin.controller')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

router.get('/stats', getStats)

router.get('/orders', getAdminOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.put('/orders/:id/payment', updatePaymentStatus)

router.get('/prescriptions', getAdminPrescriptions)
router.put('/prescriptions/:id', updatePrescriptionStatus)

router.get('/customers', getCustomers)
router.get('/customers/:id', getCustomerById)
router.put('/customers/:id/block', toggleBlockCustomer)

router.get('/reports', getReports)

router.get('/settings', getSettings)
router.put('/settings', updateSettings)

module.exports = router
