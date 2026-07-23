const prisma = require('../config/db')
const { ok, created, notFound, fail } = require('../utils/response')

const getMedicines = async (req, res) => {
  const { search, category, type, inStock, lowStock, minPrice, maxPrice, sortBy = 'totalReviews', page = 1, limit = 12 } = req.query

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
  if (lowStock === 'true') where.OR = [{ inStock: false }, { stockQuantity: { lte: 10 } }]
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

const getMedicineReviews = async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { medicineId: req.params.id },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  ok(res, { reviews })
}

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

const updateReview = async (req, res) => {
  const { rating, comment } = req.body
  if (!rating || rating < 1 || rating > 5) return fail(res, 'Rating must be between 1 and 5')

  const existing = await prisma.review.findUnique({
    where: { userId_medicineId: { userId: req.user.id, medicineId: req.params.id } },
  })
  if (!existing) return notFound(res, 'Review not found')

  const review = await prisma.review.update({
    where: { id: existing.id },
    data: { rating: parseInt(rating), comment },
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
  ok(res, { review }, 'Review updated')
}

const deleteReview = async (req, res) => {
  const existing = await prisma.review.findUnique({
    where: { userId_medicineId: { userId: req.user.id, medicineId: req.params.id } },
  })
  if (!existing) return notFound(res, 'Review not found')

  await prisma.review.delete({ where: { id: existing.id } })

  const agg = await prisma.review.aggregate({
    where: { medicineId: req.params.id },
    _avg: { rating: true },
    _count: true,
  })
  await prisma.medicine.update({
    where: { id: req.params.id },
    data: { rating: agg._avg.rating || 0, totalReviews: agg._count },
  })
  ok(res, {}, 'Review deleted')
}

const getMyReviews = async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      medicine: { select: { id: true, name: true, brand: true, imageUrl: true } },
    },
  })
  ok(res, { reviews })
}

const createMedicine = async (req, res) => {
  const { name, brand, description, dosage, usage, sideEffects, price, originalPrice, type, inStock, stockQuantity, packageSize, manufacturer, imageUrl, categoryId, expiryDate } = req.body
  if (!name || !brand || !price || !type || !categoryId) {
    return fail(res, 'name, brand, price, type, and categoryId are required')
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) return notFound(res, 'Category not found')

  const medicine = await prisma.medicine.create({
    data: {
      name, brand, description, dosage, usage, sideEffects,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice || price),
      type,
      inStock: inStock !== false && inStock !== 'false',
      stockQuantity: parseInt(stockQuantity || 0),
      packageSize, manufacturer, imageUrl, categoryId,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
    include: { category: { select: { id: true, name: true } } },
  })

  created(res, { medicine }, 'Medicine added successfully')
}

const updateMedicine = async (req, res) => {
  const existing = await prisma.medicine.findUnique({ where: { id: req.params.id } })
  if (!existing) return notFound(res, 'Medicine not found')

  const { name, brand, description, dosage, usage, sideEffects, price, originalPrice, type, inStock, stockQuantity, packageSize, manufacturer, imageUrl, categoryId, expiryDate } = req.body

  const medicine = await prisma.medicine.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(brand !== undefined && { brand }),
      ...(description !== undefined && { description }),
      ...(dosage !== undefined && { dosage }),
      ...(usage !== undefined && { usage }),
      ...(sideEffects !== undefined && { sideEffects }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
      ...(type !== undefined && { type }),
      ...(inStock !== undefined && { inStock: inStock !== false && inStock !== 'false' }),
      ...(stockQuantity !== undefined && { stockQuantity: parseInt(stockQuantity) }),
      ...(packageSize !== undefined && { packageSize }),
      ...(manufacturer !== undefined && { manufacturer }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(categoryId !== undefined && { categoryId }),
      ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
    },
    include: { category: { select: { id: true, name: true } } },
  })

  ok(res, { medicine }, 'Medicine updated successfully')
}

const deleteMedicine = async (req, res) => {
  const existing = await prisma.medicine.findUnique({ where: { id: req.params.id } })
  if (!existing) return notFound(res, 'Medicine not found')

  await prisma.medicine.delete({ where: { id: req.params.id } })
  ok(res, {}, 'Medicine deleted successfully')
}

module.exports = { getMedicines, getMedicineById, getMedicineReviews, addReview, updateReview, deleteReview, getMyReviews, createMedicine, updateMedicine, deleteMedicine }
