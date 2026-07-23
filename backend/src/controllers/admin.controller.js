const prisma = require('../config/db')
const { ok, fail } = require('../utils/response')
const { createNotification, notifyAdmins } = require('../utils/notify')

const getStats = async (req, res) => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const activeOrderFilter = {
    NOT: { status: 'CANCELLED' },
    OR: [
      { paymentMethod: 'cod' },
      { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
      { paymentMethod: 'khalti', paymentStatus: 'PAID' },
    ],
  }

  const prescriptionBaseWhere = {
    OR: [
      { checkoutDraft: false },
      {
        checkoutDraft: true,
        orderItems: {
          some: {
            order: {
              OR: [
                { paymentMethod: 'cod',    status: { not: 'CANCELLED' } },
                { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
                { paymentMethod: 'khalti', paymentStatus: 'PAID' },
              ],
            },
          },
        },
      },
    ],
  }

  const thresholdSetting = await prisma.systemSetting.findUnique({ where: { key: 'lowStockThreshold' } })
  const lowStockThreshold = parseInt(thresholdSetting?.value || '10')

  const [totalMedicines, totalOrders, totalCustomers, pendingPrescriptions, lowStockCount, outOfStock, revenueAgg, monthlyRevenueAgg, monthlyOrders, newCustomers, orderStatusCounts] = await Promise.all([
    prisma.medicine.count(),
    prisma.order.count({ where: activeOrderFilter }),
    prisma.user.count({ where: { role: 'CUSTOMER', isDeleted: false } }),
    prisma.prescription.count({ where: { status: 'PENDING', ...prescriptionBaseWhere } }),
    prisma.medicine.count({ where: { OR: [{ inStock: false }, { stockQuantity: { lte: lowStockThreshold } }] } }),
    prisma.medicine.count({ where: { inStock: false } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID', placedAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { ...activeOrderFilter, placedAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', isDeleted: false, createdAt: { gte: startOfMonth } } }),
    prisma.order.groupBy({ by: ['status'], _count: true, where: activeOrderFilter }),
  ])

  const statusMap = Object.fromEntries(orderStatusCounts.map(s => [s.status, s._count]))

  ok(res, {
    totalMedicines,
    totalOrders,
    totalCustomers,
    pendingPrescriptions,
    lowStockCount,
    outOfStock,
    totalRevenue: revenueAgg._sum.totalAmount || 0,
    monthlyRevenue: monthlyRevenueAgg._sum.totalAmount || 0,
    monthlyOrders,
    newCustomers,
    ordersByStatus: statusMap,
  })
}

const getAdminOrders = async (req, res) => {
  const { status, payment, search, page = 1, limit = 15 } = req.query
  const where = {
    NOT: { status: 'CANCELLED' },
    OR: [
      { paymentMethod: 'cod' },
      { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
      { paymentMethod: 'khalti', paymentStatus: 'PAID' },
    ],
  }
  if (status) where.status = status
  if (payment) where.paymentStatus = payment
  if (search) {
    where.AND = [
      {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      },
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
        items: {
          include: {
            medicine: { select: { id: true, name: true, brand: true, type: true, imageUrl: true } },
            prescription: { select: { id: true, status: true, fileName: true } },
          },
        },
        prescription: { select: { id: true, status: true, fileName: true } },
      },
    }),
  ])
  ok(res, { orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } })
}

const updatePaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body
  const { fail } = require('../utils/response')
  if (!['PAID', 'PENDING', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
    return fail(res, 'Invalid payment status')
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { paymentStatus },
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      address: true,
      items: {
        include: {
          medicine: { select: { id: true, name: true, brand: true, type: true, imageUrl: true } },
          prescription: { select: { id: true, status: true, fileName: true } },
        },
      },
      prescription: { select: { id: true, status: true, fileName: true } },
    },
  })
  const shortId = order.id.slice(0, 8).toUpperCase()
  createNotification({ userId: order.user.id, type: 'PAYMENT_UPDATE', title: 'Payment Confirmed', message: `Payment for order #${shortId} has been marked as received.`, link: `/dashboard/orders/${order.id}` })
  ok(res, { order }, 'Payment status updated')
}

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
      user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      address: true,
      items: {
        include: {
          medicine: { select: { id: true, name: true, brand: true, type: true, imageUrl: true } },
          prescription: { select: { id: true, status: true, fileName: true } },
        },
      },
      prescription: { select: { id: true, status: true, fileName: true } },
    },
  })
  const STATUS_MESSAGES = {
    CONFIRMED:        'Your order has been confirmed and is being prepared.',
    PROCESSING:       'Your order is now being processed by our pharmacy.',
    SHIPPED:          'Your order has been shipped and is on the way.',
    OUT_FOR_DELIVERY: 'Your order is out for delivery — expect it soon!',
    DELIVERED:        'Your order has been delivered successfully.',
    CANCELLED:        'Your order has been cancelled.',
  }
  const msg = STATUS_MESSAGES[status]
  if (msg) {
    const shortId = order.id.slice(0, 8).toUpperCase()
    createNotification({ userId: order.user.id, type: 'ORDER_UPDATE', title: `Order ${status.charAt(0) + status.slice(1).toLowerCase()}`, message: `Order #${shortId}: ${msg}`, link: `/dashboard/orders/${order.id}` })
  }
  ok(res, { order }, 'Order status updated')
}

const getAdminPrescriptions = async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query
  const where = {
    OR: [
      { checkoutDraft: false },
      {
        checkoutDraft: true,
        orderItems: {
          some: {
            order: {
              OR: [
                { paymentMethod: 'cod',    status: { not: 'CANCELLED' } },
                { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
                { paymentMethod: 'khalti', paymentStatus: 'PAID' },
              ],
            },
          },
        },
      },
    ],
  }
  if (status) where.status = status
  if (search) {
    where.AND = [
      {
        OR: [
          { id:       { contains: search, mode: 'insensitive' } },
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
          { user: { email:    { contains: search, mode: 'insensitive' } } },
          { fileName: { contains: search, mode: 'insensitive' } },
        ],
      },
    ]
  }

  const baseWhere = {
    OR: [
      { checkoutDraft: false },
      {
        checkoutDraft: true,
        orderItems: {
          some: {
            order: {
              OR: [
                { paymentMethod: 'cod',    status: { not: 'CANCELLED' } },
                { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
                { paymentMethod: 'khalti', paymentStatus: 'PAID' },
              ],
            },
          },
        },
      },
    ],
  }
  if (search) {
    baseWhere.AND = where.AND
  }

  const [total, prescriptions, statusGroups] = await Promise.all([
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
    prisma.prescription.groupBy({ by: ['status'], _count: true, where: baseWhere }),
  ])

  const statusCounts = Object.fromEntries(statusGroups.map(g => [g.status, g._count]))
  ok(res, { prescriptions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }, statusCounts })
}

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
  const shortId = prescription.id.slice(0, 8).toUpperCase()
  if (status === 'VERIFIED') {
    createNotification({ userId: prescription.user.id, type: 'PRESCRIPTION_VERIFIED', title: 'Prescription Approved', message: `Your prescription #${shortId} has been verified. You can now proceed with your order.`, link: '/dashboard/prescriptions' })
  } else {
    createNotification({ userId: prescription.user.id, type: 'PRESCRIPTION_REJECTED', title: 'Prescription Rejected', message: `Your prescription #${shortId} was rejected: ${rejectionReason}`, link: '/dashboard/prescriptions' })
  }
  ok(res, { prescription }, `Prescription ${status === 'VERIFIED' ? 'approved' : 'rejected'}`)
}

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

const getReports = async (req, res) => {
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  const activeFilter = {
    NOT: { status: 'CANCELLED' },
    OR: [
      { paymentMethod: 'cod' },
      { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
      { paymentMethod: 'khalti', paymentStatus: 'PAID' },
    ],
  }

  const [
    totalRevenueAgg, monthlyRevenueAgg, totalOrders, paidOrderCount,
    totalCustomers, pendingPrescriptions,
    orderStatusCounts, paymentMethodCounts, topMedicines,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID', placedAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: activeFilter }),
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.order.groupBy({ by: ['status'], _count: true, where: activeFilter }),
    prisma.order.groupBy({ by: ['paymentMethod'], _count: true, where: { ...activeFilter, paymentMethod: { not: null } } }),
    prisma.orderItem.groupBy({
      by: ['medicineId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
      where: { order: activeFilter },
    }),
  ])

  const medicineIds = topMedicines.map(m => m.medicineId)
  const medicines   = await prisma.medicine.findMany({ where: { id: { in: medicineIds } }, select: { id: true, name: true, brand: true, price: true } })
  const medMap      = Object.fromEntries(medicines.map(m => [m.id, m]))

  const topMedicinesEnriched = topMedicines.map(m => ({
    medicine: medMap[m.medicineId] || { name: 'Unknown' },
    totalQty: m._sum.quantity,
    revenue: (m._sum.quantity || 0) * parseFloat(medMap[m.medicineId]?.price || 0),
  }))

  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0,0,0,0)
  const recentOrders = await prisma.order.findMany({
    where: { ...activeFilter, placedAt: { gte: sixMonthsAgo } },
    select: { placedAt: true, totalAmount: true, paymentStatus: true },
  })

  const monthlyMap = {}
  recentOrders.forEach(o => {
    const key = `${o.placedAt.getFullYear()}-${String(o.placedAt.getMonth()+1).padStart(2,'0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { orders: 0, revenue: 0 }
    monthlyMap[key].orders++
    if (o.paymentStatus === 'PAID') monthlyMap[key].revenue += parseFloat(o.totalAmount)
  })
  const monthlyTrend = Object.entries(monthlyMap).sort(([a],[b]) => a.localeCompare(b)).map(([month, data]) => ({ month, ...data }))

  const cancelledCount = await prisma.order.count({ where: { status: 'CANCELLED' } })
  const allOrderCount  = totalOrders + cancelledCount

  ok(res, {
    totalRevenue: parseFloat(totalRevenueAgg._sum.totalAmount || 0),
    monthlyRevenue: parseFloat(monthlyRevenueAgg._sum.totalAmount || 0),
    totalOrders,
    paidOrderCount,
    cancelledCount,
    allOrderCount,
    totalCustomers,
    pendingPrescriptions,
    orderStatusCounts,
    paymentMethodCounts,
    topMedicines: topMedicinesEnriched,
    monthlyTrend,
  })
}

const getSettings = async (req, res) => {
  const rows = await prisma.systemSetting.findMany()
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]))
  ok(res, { settings })
}

const updateSettings = async (req, res) => {
  const entries = Object.entries(req.body)
  if (!entries.length) return fail(res, 'No settings provided')

  await Promise.all(entries.map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  ))

  const rows = await prisma.systemSetting.findMany()
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]))
  ok(res, { settings }, 'Settings saved')
}

module.exports = { getStats, getAdminOrders, updateOrderStatus, updatePaymentStatus, getAdminPrescriptions, updatePrescriptionStatus, getCustomers, getCustomerById, toggleBlockCustomer, getReports, getSettings, updateSettings }
