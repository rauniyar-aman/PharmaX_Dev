const prisma = require('../config/db')
const { ok, created, notFound, fail } = require('../utils/response')

const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { medicines: true } } },
  })
  ok(res, { categories })
}

const getCategory = async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: {
      medicines: {
        select: { id: true, name: true, brand: true, price: true, stockQuantity: true, inStock: true, type: true, imageUrl: true },
        orderBy: { name: 'asc' },
      },
      _count: { select: { medicines: true } },
    },
  })
  if (!category) return notFound(res, 'Category not found')
  ok(res, { category })
}

const createCategory = async (req, res) => {
  const { name, icon, description, isActive } = req.body
  if (!name) return fail(res, 'Category name is required')
  try {
    const category = await prisma.category.create({
      data: { name, icon, description, isActive: isActive !== false && isActive !== 'false' },
      include: { _count: { select: { medicines: true } } },
    })
    created(res, { category }, 'Category created successfully')
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 'A category with this name already exists', 409)
    throw err
  }
}

const updateCategory = async (req, res) => {
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } })
  if (!existing) return notFound(res, 'Category not found')
  const { name, icon, description, isActive } = req.body
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
      },
      include: { _count: { select: { medicines: true } } },
    })
    ok(res, { category }, 'Category updated successfully')
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 'A category with this name already exists', 409)
    throw err
  }
}

const deleteCategory = async (req, res) => {
  const existing = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { medicines: true } } },
  })
  if (!existing) return notFound(res, 'Category not found')
  if (existing._count.medicines > 0) {
    return fail(res, `Cannot delete: ${existing._count.medicines} medicine(s) are assigned to this category`, 400)
  }
  await prisma.category.delete({ where: { id: req.params.id } })
  ok(res, {}, 'Category deleted successfully')
}

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory }
