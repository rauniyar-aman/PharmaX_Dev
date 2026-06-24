require('dotenv').config()
const express = require('express')
const cors = require('cors')

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PharmaX API', version: '1.0.0' })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

app.listen(PORT, () => {
  console.log(`PharmaX API running on http://localhost:${PORT}`)
})
