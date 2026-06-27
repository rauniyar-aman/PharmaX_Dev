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

// GET /api/admin/orders
const getAdminOrders = async (req, res) => {
  const { status, payment, search, page = 1, limit = 15 } = req.query
  const where = {}
  if (status) where.status = status
  if (payment) where.paymentStatus = payment
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        address: true,
        items: { include: { medicine: { select: { id: true, name: true, brand: true, type: true, imageUrl: true } } } },
        prescription: { select: { id: true, status: true, fileName: true } },
      },
    }),
  ])
  ok(res, { orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } })
}

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body
  const validStatuses = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    const { fail } = require('../utils/response')
    return fail(res, 'Invalid status')
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      address: true,
      items: { include: { medicine: { select: { id: true, name: true, brand: true, type: true, imageUrl: true } } } },
      prescription: { select: { id: true, status: true } },
    },
  })
  ok(res, { order }, 'Order status updated')
}

// GET /api/admin/prescriptions
const getAdminPrescriptions = async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query
  const where = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { email:    { contains: search, mode: 'insensitive' } } },
      { fileName: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, prescriptions] = await Promise.all([
    prisma.prescription.count({ where }),
    prisma.prescription.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        orderItems: { select: { orderId: true }, take: 1 },
      },
    }),
  ])
  ok(res, { prescriptions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } })
}

// PUT /api/admin/prescriptions/:id
const updatePrescriptionStatus = async (req, res) => {
  const { status, rejectionReason } = req.body
  const { fail } = require('../utils/response')
  if (!['VERIFIED', 'REJECTED'].includes(status)) return fail(res, 'Status must be VERIFIED or REJECTED')
  if (status === 'REJECTED' && !rejectionReason) return fail(res, 'Rejection reason is required')

  const prescription = await prisma.prescription.update({
    where: { id: req.params.id },
    data: { status, rejectionReason: status === 'REJECTED' ? rejectionReason : null },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      orderItems: { select: { orderId: true }, take: 1 },
    },
  })
  ok(res, { prescription }, `Prescription ${status === 'VERIFIED' ? 'approved' : 'rejected'}`)
}

// GET /api/admin/customers
const getCustomers = async (req, res) => {
  const { search, status, page = 1, limit = 15 } = req.query
  const where = { role: 'CUSTOMER', isDeleted: false }
  if (status === 'active')  where.isActive = true
  if (status === 'blocked') where.isActive = false
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email:    { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      select: {
        id: true, fullName: true, email: true, phone: true,
        avatarUrl: true, isActive: true, createdAt: true,
        _count: { select: { orders: true, prescriptions: true } },
        orders: { select: { totalAmount: true, paymentStatus: true } },
      },
    }),
  ])

  const result = customers.map(c => ({
    ...c,
    totalSpent: c.orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((s, o) => s + parseFloat(o.totalAmount), 0),
    orders: undefined,
  }))

  ok(res, { customers: result, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } })
}

// GET /api/admin/customers/:id
const getCustomerById = async (req, res) => {
  const { notFound } = require('../utils/response')
  const customer = await prisma.user.findFirst({
    where: { id: req.params.id, role: 'CUSTOMER', isDeleted: false },
    select: {
      id: true, fullName: true, email: true, phone: true,
      avatarUrl: true, isActive: true, createdAt: true,
      dob: true, gender: true, allergies: true,
      _count: { select: { orders: true, prescriptions: true, wishlist: true } },
      orders: {
        orderBy: { placedAt: 'desc' }, take: 6,
        select: { id: true, totalAmount: true, status: true, paymentStatus: true, placedAt: true },
      },
      prescriptions: {
        orderBy: { uploadedAt: 'desc' }, take: 3,
        select: { id: true, fileName: true, status: true, uploadedAt: true },
      },
      addresses: { take: 1 },
    },
  })
  if (!customer) return notFound(res, 'Customer not found')

  const totalSpent = await prisma.order.aggregate({
    where: { userId: req.params.id, paymentStatus: 'PAID' },
    _sum: { totalAmount: true },
  })

  ok(res, { customer: { ...customer, totalSpent: parseFloat(totalSpent._sum.totalAmount || 0) } })
}

// PUT /api/admin/customers/:id/block
const toggleBlockCustomer = async (req, res) => {
  const { notFound } = require('../utils/response')
  const existing = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' } })
  if (!existing) return notFound(res, 'Customer not found')
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !existing.isActive },
    select: { id: true, fullName: true, isActive: true },
  })
  ok(res, { customer: updated }, updated.isActive ? 'Customer unblocked' : 'Customer blocked')
}

// GET /api/admin/reports
const getReports = async (req, res) => {
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  const [
    totalRevenue, monthlyRevenue, totalOrders, totalCustomers, pendingPrescriptions,
    orderStatusCounts, paymentMethodCounts, topMedicines,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID', placedAt: { gte: startOfMonth } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.order.groupBy({ by: ['paymentMethod'], _count: true, where: { paymentMethod: { not: null } } }),
    prisma.orderItem.groupBy({
      by: ['medicineId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    }),
  ])

  // Enrich top medicines with names
  const medicineIds = topMedicines.map(m => m.medicineId)
  const medicines   = await prisma.medicine.findMany({ where: { id: { in: medicineIds } }, select: { id: true, name: true, brand: true, price: true } })
  const medMap      = Object.fromEntries(medicines.map(m => [m.id, m]))

  const topMedicinesEnriched = topMedicines.map(m => ({
    medicine: medMap[m.medicineId] || { name: 'Unknown' },
    totalQty: m._sum.quantity,
    revenue: (m._sum.quantity || 0) * parseFloat(medMap[m.medicineId]?.price || 0),
  }))

  // Monthly orders for last 6 months
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0,0,0,0)
  const recentOrders = await prisma.order.findMany({
    where: { placedAt: { gte: sixMonthsAgo } },
    select: { placedAt: true, totalAmount: true, paymentStatus: true },
  })

  // Group by month
  const monthlyMap = {}
  recentOrders.forEach(o => {
    const key = `${o.placedAt.getFullYear()}-${String(o.placedAt.getMonth()+1).padStart(2,'0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { orders: 0, revenue: 0 }
    monthlyMap[key].orders++
    if (o.paymentStatus === 'PAID') monthlyMap[key].revenue += parseFloat(o.totalAmount)
  })
  const monthlyTrend = Object.entries(monthlyMap).sort(([a],[b]) => a.localeCompare(b)).map(([month, data]) => ({ month, ...data }))

  ok(res, {
    totalRevenue: parseFloat(totalRevenue._sum.totalAmount || 0),
    monthlyRevenue: parseFloat(monthlyRevenue._sum.totalAmount || 0),
    totalOrders,
    totalCustomers,
    pendingPrescriptions,
    orderStatusCounts,
    paymentMethodCounts,
    topMedicines: topMedicinesEnriched,
    monthlyTrend,
  })
}

module.exports = { getStats, getAdminOrders, updateOrderStatus, getAdminPrescriptions, updatePrescriptionStatus, getCustomers, getCustomerById, toggleBlockCustomer, getReports }
