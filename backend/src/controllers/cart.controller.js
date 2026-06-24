const prisma = require('../config/db')
const { ok, notFound, fail } = require('../utils/response')

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { medicine: { include: { category: { select: { name: true } } } } } } },
  })
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { medicine: { include: { category: { select: { name: true } } } } } } },
    })
  }
  return cart
}

// GET /api/cart
const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  ok(res, { cart })
}

// POST /api/cart/items
const addItem = async (req, res) => {
  const { medicineId, quantity = 1 } = req.body
  if (!medicineId) return fail(res, 'medicineId is required')

  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } })
  if (!medicine) return notFound(res, 'Medicine not found')
  if (!medicine.inStock) return fail(res, 'Medicine is out of stock')

  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } })

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_medicineId: { cartId: cart.id, medicineId } },
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { cartId_medicineId: { cartId: cart.id, medicineId } },
      data: { quantity: existing.quantity + parseInt(quantity) },
    })
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, medicineId, quantity: parseInt(quantity) } })
  }

  const updatedCart = await getOrCreateCart(req.user.id)
  ok(res, { cart: updatedCart }, 'Item added to cart')
}

// PUT /api/cart/items/:medicineId
const updateItem = async (req, res) => {
  const { quantity } = req.body
  if (!quantity || quantity < 1) return fail(res, 'quantity must be at least 1')

  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (!cart) return notFound(res, 'Cart not found')

  const item = await prisma.cartItem.findUnique({
    where: { cartId_medicineId: { cartId: cart.id, medicineId: req.params.medicineId } },
  })
  if (!item) return notFound(res, 'Item not in cart')

  await prisma.cartItem.update({
    where: { cartId_medicineId: { cartId: cart.id, medicineId: req.params.medicineId } },
    data: { quantity: parseInt(quantity) },
  })

  const updatedCart = await getOrCreateCart(req.user.id)
  ok(res, { cart: updatedCart }, 'Cart updated')
}

// DELETE /api/cart/items/:medicineId
const removeItem = async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (!cart) return notFound(res, 'Cart not found')

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, medicineId: req.params.medicineId },
  })

  const updatedCart = await getOrCreateCart(req.user.id)
  ok(res, { cart: updatedCart }, 'Item removed from cart')
}

// DELETE /api/cart
const clearCart = async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  ok(res, {}, 'Cart cleared')
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart }
