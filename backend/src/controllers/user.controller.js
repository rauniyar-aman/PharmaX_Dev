const prisma = require('../config/db')
const { ok, created, notFound, fail } = require('../utils/response')

// GET /api/user/profile
const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, fullName: true, email: true, phone: true, dob: true, gender: true, bloodGroup: true, allergies: true, avatarUrl: true, role: true, createdAt: true },
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
  const { label, name, phone, address, city, province, zip, lat, lng, isDefault } = req.body
  if (!name || !phone || !address || !city || !province || !zip) {
    return fail(res, 'All address fields are required')
  }

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
  }

  const newAddress = await prisma.address.create({
    data: {
      userId: req.user.id, label: label || 'Home', name, phone, address, city, province, zip,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      isDefault: !!isDefault,
    },
  })
  created(res, { address: newAddress }, 'Address added')
}

// PUT /api/user/addresses/:id
const updateAddress = async (req, res) => {
  const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
  if (!existing) return notFound(res, 'Address not found')

  const { label, name, phone, address, city, province, zip, lat, lng, isDefault } = req.body

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
  }

  const updated = await prisma.address.update({
    where: { id: req.params.id },
    data: {
      ...(label !== undefined && { label }),
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(province !== undefined && { province }),
      ...(zip !== undefined && { zip }),
      ...(lat !== undefined && { lat: lat ? parseFloat(lat) : null }),
      ...(lng !== undefined && { lng: lng ? parseFloat(lng) : null }),
      ...(isDefault !== undefined && { isDefault: !!isDefault }),
    },
  })
  ok(res, { address: updated }, 'Address updated')
}

// PUT /api/user/addresses/:id/default
const setDefaultAddress = async (req, res) => {
  const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
  if (!existing) return notFound(res, 'Address not found')

  await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
  await prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } })
  ok(res, {}, 'Default address updated')
}

// DELETE /api/user/addresses/:id
const deleteAddress = async (req, res) => {
  const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
  if (!existing) return notFound(res, 'Address not found')
  await prisma.address.delete({ where: { id: req.params.id } })
  ok(res, {}, 'Address deleted')
}

// POST /api/user/avatar
const uploadAvatarHandler = async (req, res) => {
  if (!req.file) return fail(res, 'No image file provided')
  const avatarUrl = `/uploads/avatars/${req.file.filename}`
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl },
    select: { id: true, avatarUrl: true },
  })
  ok(res, { avatarUrl: user.avatarUrl }, 'Profile picture updated')
}

// DELETE /api/user/avatar
const removeAvatarHandler = async (req, res) => {
  const fs = require('fs')
  const path = require('path')
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { avatarUrl: true } })
  if (user?.avatarUrl) {
    const filePath = path.join(__dirname, '../../', user.avatarUrl)
    try { fs.unlinkSync(filePath) } catch {}
  }
  await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: null } })
  ok(res, { avatarUrl: null }, 'Profile picture removed')
}

module.exports = { getProfile, updateProfile, getAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress, uploadAvatarHandler, removeAvatarHandler }
