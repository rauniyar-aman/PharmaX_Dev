const crypto = require('crypto')
const https = require('https')
const prisma = require('../config/db')

const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST'
const SECRET_KEY   = process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q'
const FORM_URL     = process.env.ESEWA_FORM_URL     || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
const VERIFY_URL   = process.env.ESEWA_VERIFY_URL   || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/'
const FRONTEND_URL = process.env.FRONTEND_URL        || 'http://localhost:5173'
const BACKEND_URL  = process.env.BACKEND_URL         || 'http://localhost:5000'

// HMAC-SHA256 signature over "total_amount,transaction_uuid,product_code"
function generateSignature(totalAmount, transactionUuid) {
  const msg = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${PRODUCT_CODE}`
  return crypto.createHmac('sha256', SECRET_KEY).update(msg).digest('base64')
}

// Fetch eSewa transaction status (plain https — no extra deps needed)
function verifyWithEsewa(productCode, totalAmount, transactionUuid) {
  return new Promise((resolve, reject) => {
    const url = `${VERIFY_URL}?product_code=${productCode}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`
    https.get(url, res => {
      let body = ''
      res.on('data', c => (body += c))
      res.on('end', () => {
        try { resolve(JSON.parse(body)) } catch { reject(new Error('Bad JSON from eSewa')) }
      })
    }).on('error', reject)
  })
}

async function getCartData(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { medicine: true } } },
  })
  if (!cart || !cart.items.length) return null
  const subtotal = cart.items.reduce((s, i) => s + parseFloat(i.medicine.price) * i.quantity, 0)
  const deliveryCharge = subtotal >= 500 ? 0 : 80
  const totalAmount = subtotal + deliveryCharge
  return { cart, subtotal, deliveryCharge, totalAmount }
}

// ─── POST /api/payment/esewa/initiate ────────────────────────────────────────
const initiateEsewa = async (req, res) => {
  const { addressId, prescriptionMap = {} } = req.body
  if (!addressId) return res.status(400).json({ success: false, message: 'Delivery address is required' })

  const data = await getCartData(req.user.id)
  if (!data) return res.status(400).json({ success: false, message: 'Cart is empty' })

  const { cart, totalAmount, deliveryCharge } = data
  const totalStr = totalAmount.toFixed(2)

  // Create order in PENDING state first so we have an ID
  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      addressId,
      paymentMethod: 'esewa',
      paymentStatus: 'PENDING',
      totalAmount,
      deliveryCharge,
      items: {
        create: cart.items.map(i => ({
          medicineId:     i.medicineId,
          quantity:       i.quantity,
          unitPrice:      i.medicine.price,
          prescriptionId: prescriptionMap[i.medicineId] || null,
        })),
      },
    },
  })

  // transaction_uuid must be unique across all eSewa payments
  const transactionUuid = `${order.id}-${Date.now()}`

  await prisma.order.update({
    where: { id: order.id },
    data: { esewaTransactionUuid: transactionUuid },
  })

  const signature = generateSignature(totalStr, transactionUuid)

  return res.json({
    success: true,
    data: {
      formUrl: FORM_URL,
      params: {
        amount:                  totalStr,
        tax_amount:              '0',
        total_amount:            totalStr,
        transaction_uuid:        transactionUuid,
        product_code:            PRODUCT_CODE,
        product_service_charge:  '0',
        product_delivery_charge: '0',
        success_url: `${BACKEND_URL}/api/payment/esewa/success`,
        failure_url: `${BACKEND_URL}/api/payment/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    },
  })
}

// ─── GET /api/payment/esewa/success?data=<base64> ────────────────────────────
const esewaSuccess = async (req, res) => {
  try {
    const { data } = req.query
    if (!data) return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1&reason=missing_data`)

    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
    const { transaction_uuid, total_amount, status } = decoded

    if (status !== 'COMPLETE') {
      return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1&reason=incomplete`)
    }

    // Verify with eSewa
    let verification
    try {
      verification = await verifyWithEsewa(PRODUCT_CODE, total_amount, transaction_uuid)
    } catch {
      return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1&reason=verify_error`)
    }

    if (verification.status !== 'COMPLETE') {
      return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1&reason=not_verified`)
    }

    // Find matching order
    const order = await prisma.order.findUnique({
      where: { esewaTransactionUuid: transaction_uuid },
    })
    if (!order) return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1&reason=order_not_found`)

    // Idempotent — if already paid, just redirect
    if (order.paymentStatus === 'PAID') {
      return res.redirect(`${FRONTEND_URL}/dashboard/checkout/confirmation?orderId=${order.id}`)
    }

    // Confirm order
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    })

    // Clear cart
    const cart = await prisma.cart.findUnique({ where: { userId: order.userId } })
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return res.redirect(`${FRONTEND_URL}/dashboard/checkout/confirmation?orderId=${order.id}`)
  } catch (err) {
    console.error('eSewa success error:', err)
    return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1&reason=server_error`)
  }
}

// ─── GET /api/payment/esewa/failure?data=<base64> ────────────────────────────
const esewaFailure = async (req, res) => {
  try {
    const { data } = req.query
    if (data) {
      const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
      const order = await prisma.order.findUnique({
        where: { esewaTransactionUuid: decoded.transaction_uuid },
      })
      if (order && order.paymentStatus === 'PENDING') {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
        })
      }
    }
  } catch {}
  return res.redirect(`${FRONTEND_URL}/dashboard/checkout/payment?esewa_cancelled=1`)
}

// ─── POST /api/payment/cod/place ─────────────────────────────────────────────
const placeCodOrder = async (req, res) => {
  const { addressId, prescriptionMap = {} } = req.body
  if (!addressId) return res.status(400).json({ success: false, message: 'Delivery address is required' })

  const data = await getCartData(req.user.id)
  if (!data) return res.status(400).json({ success: false, message: 'Cart is empty' })

  const { cart, totalAmount, deliveryCharge } = data

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      addressId,
      paymentMethod: 'cod',
      paymentStatus: 'PENDING',
      status: 'PLACED',
      totalAmount,
      deliveryCharge,
      items: {
        create: cart.items.map(i => ({
          medicineId:     i.medicineId,
          quantity:       i.quantity,
          unitPrice:      i.medicine.price,
          prescriptionId: prescriptionMap[i.medicineId] || null,
        })),
      },
    },
    include: { items: { include: { medicine: true } }, address: true },
  })

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  return res.status(201).json({ success: true, data: { order }, message: 'Order placed successfully' })
}

module.exports = { initiateEsewa, esewaSuccess, esewaFailure, placeCodOrder }
