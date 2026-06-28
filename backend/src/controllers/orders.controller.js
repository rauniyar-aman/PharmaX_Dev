const prisma = require('../config/db')
const { ok, created, notFound, fail } = require('../utils/response')
const { createNotification, notifyAdmins } = require('../utils/notify')

// GET /api/orders
const getOrders = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const where = {
    userId: req.user.id,
    NOT: { status: 'CANCELLED' },
    OR: [
      { paymentMethod: 'cod' },
      { paymentMethod: 'esewa',  paymentStatus: 'PAID' },
      { paymentMethod: 'khalti', paymentStatus: 'PAID' },
    ],
  }
  if (status) where.status = status

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        items: { include: { medicine: { select: { id: true, name: true, brand: true, imageUrl: true } } } },
        address: true,
      },
    }),
  ])

  ok(res, { orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } })
}

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      items: {
        include: {
          medicine: {
            include: {
              category: { select: { name: true } },
              reviews: {
                where: { userId: req.user.id },
                select: { id: true, rating: true, comment: true, createdAt: true },
              },
            },
          },
        },
      },
      address: true,
      prescription: true,
    },
  })
  if (!order) return notFound(res, 'Order not found')
  ok(res, { order })
}

// POST /api/orders
const createOrder = async (req, res) => {
  const { addressId, prescriptionId, paymentMethod, items } = req.body

  if (!items || items.length === 0) return fail(res, 'Order must have at least one item')
  if (!addressId) return fail(res, 'Delivery address is required')

  const medicineIds = items.map(i => i.medicineId)
  const medicines = await prisma.medicine.findMany({ where: { id: { in: medicineIds } } })

  if (medicines.length !== items.length) return fail(res, 'One or more medicines not found')

  const priceMap = Object.fromEntries(medicines.map(m => [m.id, m.price]))
  const subtotal = items.reduce((sum, i) => sum + parseFloat(priceMap[i.medicineId]) * i.quantity, 0)
  const deliveryCharge = subtotal >= 500 ? 0 : 80
  const totalAmount = subtotal + deliveryCharge

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      addressId,
      prescriptionId: prescriptionId || null,
      paymentMethod,
      totalAmount,
      deliveryCharge,
      items: {
        create: items.map(i => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          unitPrice: priceMap[i.medicineId],
        })),
      },
    },
    include: {
      items: { include: { medicine: true } },
      address: true,
    },
  })

  // Clear the cart after successful order
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  // Notify customer + admins
  const shortId = order.id.slice(0, 8).toUpperCase()
  await Promise.all([
    createNotification({ userId: req.user.id, type: 'ORDER_PLACED', title: 'Order Placed', message: `Your order #${shortId} has been placed successfully.`, link: `/dashboard/orders/${order.id}` }),
    notifyAdmins({ type: 'NEW_ORDER', title: 'New Order Received', message: `A new order #${shortId} was placed (NPR ${Math.round(totalAmount)}).`, link: `/admin/orders` }),
  ])

  created(res, { order }, 'Order placed successfully')
}

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!order) return notFound(res, 'Order not found')
  if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
    return fail(res, 'Order cannot be cancelled at this stage')
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  })
  ok(res, { order: updated }, 'Order cancelled')
}

const rateOrder = async (req, res) => {
  const { orderRating, orderComment } = req.body
  if (!orderRating || orderRating < 1 || orderRating > 5) return fail(res, 'Rating must be between 1 and 5')

  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id, status: 'DELIVERED' },
  })
  if (!order) return notFound(res, 'Delivered order not found')

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { orderRating: parseInt(orderRating), orderComment: orderComment || null },
  })
  ok(res, { order: updated }, 'Order rated')
}

module.exports = { getOrders, getOrderById, createOrder, cancelOrder, rateOrder }
