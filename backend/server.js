const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const errorHandler = require('./src/middleware/errorHandler')
const prisma = require('./src/config/db')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://pharmax.com'
    : /^http:\/\/localhost(:\d+)?$/,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/auth.routes'))
app.use('/api/medicines',     require('./src/routes/medicines.routes'))
app.use('/api/categories',    require('./src/routes/categories.routes'))
app.use('/api/cart',          require('./src/routes/cart.routes'))
app.use('/api/wishlist',      require('./src/routes/wishlist.routes'))
app.use('/api/orders',        require('./src/routes/orders.routes'))
app.use('/api/prescriptions', require('./src/routes/prescriptions.routes'))
app.use('/api/user',          require('./src/routes/user.routes'))
app.use('/api/admin',         require('./src/routes/admin.routes'))
app.use('/api/notifications', require('./src/routes/notifications.routes'))
app.use('/api/payment',       require('./src/routes/payment.routes'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PharmaX API', version: '1.0.0' })
})

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))
app.use(errorHandler)

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT', 'EMAIL_USER', 'EMAIL_PASS']
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])
if (missingEnvVars.length) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '))
  process.exit(1)
}

const startServer = async () => {
  try {
    await prisma.$connect()
    app.listen(PORT, () => console.log(`PharmaX API running on http://localhost:${PORT}`))
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to start PharmaX API:', error)
    process.exit(1)
  }
}

startServer()

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down server...`)
  try {
    await prisma.$disconnect()
  } catch (err) {
    console.error('Error disconnecting Prisma client:', err)
  }
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})
