const prisma = require('../config/db')
const { ok } = require('../utils/response')

const getStats = async (req, res) => {
  const [totalMedicines, totalOrders, totalCustomers, pendingPrescriptions, outOfStock, revenueAgg] = await Promise.all([
    prisma.medicine.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.medicine.count({ where: { inStock: false } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
  ])

  ok(res, {
    totalMedicines,
    totalOrders,
    totalCustomers,
    pendingPrescriptions,
    outOfStock,
    totalRevenue: revenueAgg._sum.totalAmount || 0,
  })
}

module.exports = { getStats }
