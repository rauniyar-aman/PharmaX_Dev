const prisma = require('../config/db')
const { ok, notFound, fail } = require('../utils/response')

// GET /api/medicines
const getMedicines = async (req, res) => {
  const { search, category, type, inStock, minPrice, maxPrice, sortBy = 'totalReviews', page = 1, limit = 12 } = req.query

  const where = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = { name: { equals: category, mode: 'insensitive' } }
  if (type) where.type = type
  if (inStock === 'true') where.inStock = true
  if (inStock === 'false') where.inStock = false
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  const orderBy = {
    popular: { totalReviews: 'desc' },
    'price-asc': { price: 'asc' },
    'price-desc': { price: 'desc' },
    newest: { createdAt: 'desc' },
    rating: { rating: 'desc' },
  }[sortBy] || { totalReviews: 'desc' }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const take = parseInt(limit)

  const [total, medicines] = await Promise.all([
    prisma.medicine.count({ where }),
    prisma.medicine.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: { select: { id: true, name: true, icon: true } } },
    }),
  ])

  ok(res, {
    medicines,
    pagination: { total, page: parseInt(page), limit: take, pages: Math.ceil(total / take) },
  })
}

// GET /api/medicines/:id
const getMedicineById = async (req, res) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: req.params.id },
    include: {
      category: { select: { id: true, name: true } },
      reviews: {
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!medicine) return notFound(res, 'Medicine not found')
  ok(res, { medicine })
}

// GET /api/medicines/:id/reviews
const getMedicineReviews = async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { medicineId: req.params.id },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  ok(res, { reviews })
}

// POST /api/medicines/:id/reviews
const addReview = async (req, res) => {
  const { rating, comment } = req.body
  if (!rating || rating < 1 || rating > 5) return fail(res, 'Rating must be between 1 and 5')

  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } })
  if (!medicine) return notFound(res, 'Medicine not found')

  const review = await prisma.review.upsert({
    where: { userId_medicineId: { userId: req.user.id, medicineId: req.params.id } },
    update: { rating: parseInt(rating), comment },
    create: { userId: req.user.id, medicineId: req.params.id, rating: parseInt(rating), comment },
  })

  const agg = await prisma.review.aggregate({
    where: { medicineId: req.params.id },
    _avg: { rating: true },
    _count: true,
  })

  await prisma.medicine.update({
    where: { id: req.params.id },
    data: { rating: agg._avg.rating || 0, totalReviews: agg._count },
  })

  ok(res, { review }, 'Review submitted')
}

module.exports = { getMedicines, getMedicineById, getMedicineReviews, addReview }
