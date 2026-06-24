const prisma = require('../config/db')
const { ok } = require('../utils/response')

const getStats = async (req, res) => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [totalMedicines, totalOrders, totalCustomers, pendingPrescriptions, outOfStock, revenueAgg, monthlyRevenueAgg] = await Promise.all([
    prisma.medicine.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.medicine.count({ where: { inStock: false } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID', placedAt: { gte: startOfMonth } } }),
  ])

  ok(res, {
    totalMedicines,
    totalOrders,
    totalCustomers,
    pendingPrescriptions,
    outOfStock,
    totalRevenue: revenueAgg._sum.totalAmount || 0,
    monthlyRevenue: monthlyRevenueAgg._sum.totalAmount || 0,
  })
}

module.exports = { getStats }
