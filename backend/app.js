const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://pharmax.com'
    : /^http:\/\/localhost(:\d+)?$/,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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

module.exports = app
