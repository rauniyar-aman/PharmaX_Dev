jest.mock('../src/middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', email: 'aman@example.com', role: 'CUSTOMER' }
    next()
  },
  adminOnly: (req, res, next) => next(),
}))

jest.mock('../src/config/db', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
}))
jest.mock('../src/utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendOtpEmail: jest.fn().mockResolvedValue(true),
}))
jest.mock('../src/utils/notify', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
  notifyAdmins: jest.fn().mockResolvedValue({}),
}))

process.env.JWT_SECRET = 'test_jwt_secret'

const request = require('supertest')
const app     = require('../server')
const prisma  = require('../src/config/db')

const updatedUser = {
  id: 'u1',
  fullName: 'Aman Rauniyar Updated',
  email: 'aman@example.com',
  phone: '9800000001',
  role: 'CUSTOMER',
  dob: null,
  gender: 'Male',
  bloodGroup: 'B+',
  allergies: null,
  avatarUrl: null,
  createdAt: new Date(),
}

describe('PUT /api/auth/me — Update Profile', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 200 when profile is updated successfully', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.update.mockResolvedValue(updatedUser)

    const res = await request(app)
      .put('/api/auth/me')
      .send({ fullName: 'Aman Rauniyar Updated', phone: '9800000001', gender: 'Male' })

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Profile updated successfully')
    expect(res.body.data.user.fullName).toBe('Aman Rauniyar Updated')
  })

  test('should return 400 when fullName is missing', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .send({ phone: '9800000001' })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Full name is required')
  })

  test('should return 409 when phone number is already taken by another user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u2', phone: '9800000002' })

    const res = await request(app)
      .put('/api/auth/me')
      .send({ fullName: 'Aman Rauniyar', phone: '9800000002' })

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toBe('This phone number is already registered')
  })

  test('should call prisma.user.update with the correct user id', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.update.mockResolvedValue(updatedUser)

    await request(app)
      .put('/api/auth/me')
      .send({ fullName: 'Aman Rauniyar Updated' })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'u1' } })
    )
  })

  test('should return 500 if database fails during update', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.update.mockRejectedValue(new Error('DB error'))

    const res = await request(app)
      .put('/api/auth/me')
      .send({ fullName: 'Aman Rauniyar Updated' })

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('DB error')
  })

  test('should return 201 after updating profile', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.update.mockResolvedValue(updatedUser)

    const res = await request(app)
      .put('/api/auth/me')
      .send({ fullName: 'Aman Rauniyar Updated' })

    expect(res.statusCode).toBe(201)
  })
})
