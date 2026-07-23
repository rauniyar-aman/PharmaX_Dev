jest.mock('../src/config/db', () => ({
  user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
}))
jest.mock('../src/utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendOtpEmail: jest.fn().mockResolvedValue(true),
}))
jest.mock('../src/utils/notify', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
  notifyAdmins: jest.fn().mockResolvedValue({}),
}))
jest.mock('bcrypt')

process.env.JWT_SECRET = 'test_jwt_secret'

const request = require('supertest')
const app     = require('../server')
const prisma  = require('../src/config/db')
const bcrypt  = require('bcrypt')

describe('POST /api/auth/register', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 201 when registration is successful', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    bcrypt.hash.mockResolvedValue('hashedpassword')
    prisma.user.create.mockResolvedValue({
      id: 'u1', fullName: 'Aman Rauniyar', email: 'aman@example.com', phone: '9800000001',
    })

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aman Rauniyar',
      email: 'aman@example.com',
      phone: '9800000001',
      password: 'password123',
    })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
  })

  test('should return 400 when fullName is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'aman@example.com',
      phone: '9800000001',
      password: 'password123',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('fullName, email, phone, and password are required')
  })

  test('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aman Rauniyar',
      phone: '9800000001',
      password: 'password123',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('fullName, email, phone, and password are required')
  })

  test('should return 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aman Rauniyar',
      email: 'aman@example.com',
      phone: '9800000001',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('fullName, email, phone, and password are required')
  })

  test('should return 409 when email is already registered', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1', email: 'aman@example.com', isDeleted: false, otpCode: null,
    })

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aman Rauniyar',
      email: 'aman@example.com',
      phone: '9800000001',
      password: 'password123',
    })

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toBe('An account with this email already exists')
  })

  test('should return 500 if database fails', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'))

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aman Rauniyar',
      email: 'aman@example.com',
      phone: '9800000001',
      password: 'password123',
    })

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('DB error')
  })

  test('should return 500 if bcrypt hash fails', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    bcrypt.hash.mockRejectedValue(new Error('bcrypt error'))

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aman Rauniyar',
      email: 'aman@example.com',
      phone: '9800000001',
      password: 'password123',
    })

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('bcrypt error')
  })

  test('should return 200 on successful registration', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    bcrypt.hash.mockResolvedValue('hashedpassword')
    prisma.user.create.mockResolvedValue({ id: 'u2' })

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '9800000002',
      password: 'password123',
    })

    expect(res.statusCode).toBe(200)
  })
})
