const prisma = require('../config/db')
const { ok, notFound, fail } = require('../utils/response')

const getWishlist = async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: { medicine: { include: { category: { select: { name: true } } } } },
    orderBy: { addedAt: 'desc' },
  })
  ok(res, { items })
}

const addToWishlist = async (req, res) => {
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.medicineId } })
  if (!medicine) return notFound(res, 'Medicine not found')

  const item = await prisma.wishlistItem.upsert({
    where: { userId_medicineId: { userId: req.user.id, medicineId: req.params.medicineId } },
    update: {},
    create: { userId: req.user.id, medicineId: req.params.medicineId },
    include: { medicine: true },
  })
  ok(res, { item }, 'Added to wishlist')
}

const removeFromWishlist = async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user.id, medicineId: req.params.medicineId },
  })
  ok(res, {}, 'Removed from wishlist')
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist }
