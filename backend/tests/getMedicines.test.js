jest.mock('../src/config/db', () => ({
  medicine: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
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

const mockMedicines = [
  {
    id: 'm1', name: 'Paracetamol 500mg', brand: 'Panadol', price: 50,
    inStock: true, type: 'TABLET', stockQuantity: 100,
    category: { id: 'c1', name: 'Pain Relief', icon: 'medication' },
  },
  {
    id: 'm2', name: 'Ibuprofen 400mg', brand: 'Brufen', price: 80,
    inStock: true, type: 'TABLET', stockQuantity: 50,
    category: { id: 'c1', name: 'Pain Relief', icon: 'medication' },
  },
]

describe('GET /api/medicines', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 200 and a list of medicines', async () => {
    prisma.medicine.count.mockResolvedValue(2)
    prisma.medicine.findMany.mockResolvedValue(mockMedicines)

    const res = await request(app).get('/api/medicines')

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.medicines).toHaveLength(2)
  })

  test('should return an empty medicines list', async () => {
    prisma.medicine.count.mockResolvedValue(0)
    prisma.medicine.findMany.mockResolvedValue([])

    const res = await request(app).get('/api/medicines')

    expect(res.statusCode).toBe(200)
    expect(res.body.data.medicines).toHaveLength(0)
  })

  test('should include pagination info in the response', async () => {
    prisma.medicine.count.mockResolvedValue(2)
    prisma.medicine.findMany.mockResolvedValue(mockMedicines)

    const res = await request(app).get('/api/medicines')

    expect(res.body.data.pagination).toBeDefined()
    expect(res.body.data.pagination.total).toBe(2)
  })

  test('should return 500 if database fails on medicine listing', async () => {
    prisma.medicine.count.mockRejectedValue(new Error('DB error'))

    const res = await request(app).get('/api/medicines')

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('DB error')
  })

  test('should return more than 5 medicines', async () => {
    prisma.medicine.count.mockResolvedValue(2)
    prisma.medicine.findMany.mockResolvedValue(mockMedicines)

    const res = await request(app).get('/api/medicines')

    expect(res.body.data.medicines.length).toBeGreaterThan(5)
  })
})

describe('GET /api/medicines/:id', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 200 and medicine details when found', async () => {
    prisma.medicine.findUnique.mockResolvedValue({
      ...mockMedicines[0],
      reviews: [],
      description: 'Used for pain relief and fever',
    })

    const res = await request(app).get('/api/medicines/m1')

    expect(res.statusCode).toBe(200)
    expect(res.body.data.medicine.name).toBe('Paracetamol 500mg')
    expect(res.body.data.medicine.brand).toBe('Panadol')
  })

  test('should return 404 when medicine does not exist', async () => {
    prisma.medicine.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/medicines/invalid-id')

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('Medicine not found')
  })

  test('should return 500 if database fails on single medicine lookup', async () => {
    prisma.medicine.findUnique.mockRejectedValue(new Error('DB error'))

    const res = await request(app).get('/api/medicines/m1')

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('DB error')
  })
})
