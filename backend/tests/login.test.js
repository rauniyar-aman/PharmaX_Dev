jest.mock('../src/config/db', () => ({
  user: { findUnique: jest.fn() },
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
jest.mock('jsonwebtoken')

process.env.JWT_SECRET = 'test_jwt_secret'

const request = require('supertest')
const app     = require('../server')
const prisma  = require('../src/config/db')
const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')

const mockUser = {
  id: 'u1',
  fullName: 'Aman Rauniyar',
  email: 'aman@example.com',
  phone: '9800000001',
  passwordHash: 'hashedpassword',
  role: 'CUSTOMER',
  isDeleted: false,
  isActive: true,
  otpCode: null,
  otpExpiresAt: null,
  dob: null,
  gender: null,
  bloodGroup: null,
  allergies: null,
  avatarUrl: null,
  createdAt: new Date(),
}

describe('POST /api/auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 200 and token on successful login', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('fakeToken123')

    const res = await request(app).post('/api/auth/login').send({
      email: 'aman@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.token).toBe('fakeToken123')
    expect(res.body.message).toBe('Login successful')
  })

  test('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Email and password are required')
  })

  test('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aman@example.com' })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Email and password are required')
  })

  test('should return 401 when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })

  test('should return 401 when password is incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(false)

    const res = await request(app).post('/api/auth/login').send({
      email: 'aman@example.com',
      password: 'wrongpassword',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })

  test('should return 500 if database fails', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'))

    const res = await request(app).post('/api/auth/login').send({
      email: 'aman@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('DB error')
  })

  test('should return 500 if bcrypt compare fails', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser)
    bcrypt.compare.mockRejectedValue(new Error('bcrypt error'))

    const res = await request(app).post('/api/auth/login').send({
      email: 'aman@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('bcrypt error')
  })

  test('should return 500 if JWT sign fails', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockImplementation(() => {
      throw new Error('jwt error')
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'aman@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('jwt error')
  })

  test('should include "Welcome" in the success message', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('fakeToken123')

    const res = await request(app).post('/api/auth/login').send({
      email: 'aman@example.com',
      password: 'password123',
    })

    expect(res.body.message).toContain('Welcome')
  })
})
