const prisma = require('../config/db')
const { ok, created, notFound } = require('../utils/response')

// GET /api/prescriptions
const getPrescriptions = async (req, res) => {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      userId: req.user.id,
      OR: [
        { checkoutDraft: false },
        {
          checkoutDraft: true,
          orderItems: {
            some: {
              order: {
                OR: [
                  { paymentMethod: 'cod',   status: { not: 'CANCELLED' } },
                  { paymentMethod: 'esewa', paymentStatus: 'PAID' },
                ],
              },
            },
          },
        },
      ],
    },
    orderBy: { uploadedAt: 'desc' },
    include: {
      orderItems: {
        select: { orderId: true },
        take: 1,
      },
    },
  })
  ok(res, { prescriptions })
}

// POST /api/prescriptions  (accepts files[] — one or more pages)
const uploadPrescription = async (req, res) => {
  const { doctor, hospital, expiryDate, checkoutDraft } = req.body
  const files = req.files || []

  const fileUrls = files.map(f => `/uploads/${f.filename}`)
  const fileNames = files.map(f => f.originalname)

  const prescription = await prisma.prescription.create({
    data: {
      userId: req.user.id,
      fileName: fileNames.join(', ') || req.body.fileName || 'prescription.pdf',
      fileUrl: JSON.stringify(fileUrls.length ? fileUrls : [req.body.fileUrl || '']),
      doctor: doctor || null,
      hospital: hospital || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      checkoutDraft: checkoutDraft === 'true' || checkoutDraft === true,
    },
  })
  created(res, { prescription }, 'Prescription uploaded successfully')
}

// DELETE /api/prescriptions/:id
const deletePrescription = async (req, res) => {
  const prescription = await prisma.prescription.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!prescription) return notFound(res, 'Prescription not found')

  await prisma.prescription.delete({ where: { id: req.params.id } })
  ok(res, {}, 'Prescription deleted')
}

module.exports = { getPrescriptions, uploadPrescription, deletePrescription }
