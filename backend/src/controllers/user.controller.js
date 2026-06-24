const prisma = require('../config/db')
const { ok, created, notFound, fail } = require('../utils/response')

// GET /api/user/profile
const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, fullName: true, email: true, phone: true, dob: true, gender: true, bloodGroup: true, allergies: true, role: true, createdAt: true },
  })
  if (!user) return notFound(res, 'User not found')
  ok(res, { user })
}

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  const { fullName, phone, dob, gender, bloodGroup, allergies } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(fullName && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(dob !== undefined && { dob: dob ? new Date(dob) : null }),
      ...(gender !== undefined && { gender }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(allergies !== undefined && { allergies }),
    },
    select: { id: true, fullName: true, email: true, phone: true, dob: true, gender: true, bloodGroup: true, allergies: true },
  })
  ok(res, { user }, 'Profile updated')
}

// GET /api/user/addresses
const getAddresses = async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })
  ok(res, { addresses })
}

// POST /api/user/addresses
const addAddress = async (req, res) => {
  const { label, name, phone, address, city, province, zip, isDefault } = req.body
  if (!name || !phone || !address || !city || !province || !zip) {
    return fail(res, 'All address fields are required')
  }

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
  }

  const newAddress = await prisma.address.create({
    data: { userId: req.user.id, label: label || 'Home', name, phone, address, city, province, zip, isDefault: !!isDefault },
  })
  created(res, { address: newAddress }, 'Address added')
}

// PUT /api/user/addresses/:id
const updateAddress = async (req, res) => {
  const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
  if (!existing) return notFound(res, 'Address not found')

  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
  }

  const updated = await prisma.address.update({
    where: { id: req.params.id },
    data: req.body,
  })
  ok(res, { address: updated }, 'Address updated')
}

// DELETE /api/user/addresses/:id
const deleteAddress = async (req, res) => {
  const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
  if (!existing) return notFound(res, 'Address not found')
  await prisma.address.delete({ where: { id: req.params.id } })
  ok(res, {}, 'Address deleted')
}

module.exports = { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress }
