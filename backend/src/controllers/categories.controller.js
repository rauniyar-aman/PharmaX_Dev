const prisma = require('../config/db')
const { ok } = require('../utils/response')

// GET /api/categories
const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { medicines: true } } },
  })
  ok(res, { categories })
}

module.exports = { getCategories }
