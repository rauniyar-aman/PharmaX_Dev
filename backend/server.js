const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const app = require('./app')

if (require.main === module) {
  const prisma = require('./src/config/db')
  const PORT = process.env.PORT || 5000

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
}

module.exports = app
