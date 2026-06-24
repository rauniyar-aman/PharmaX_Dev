require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://pharmax.com'
    : 'http://localhost:5173',
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PharmaX API', version: '1.0.0' })
})

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))
app.use(errorHandler)

app.listen(PORT, () => console.log(`PharmaX API running on http://localhost:${PORT}`))
