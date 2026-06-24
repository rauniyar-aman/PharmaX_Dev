const prisma = require('../config/db')
const { ok, created, notFound } = require('../utils/response')

// GET /api/prescriptions
const getPrescriptions = async (req, res) => {
  const prescriptions = await prisma.prescription.findMany({
    where: { userId: req.user.id },
    orderBy: { uploadedAt: 'desc' },
  })
  ok(res, { prescriptions })
}

// POST /api/prescriptions
const uploadPrescription = async (req, res) => {
  const { doctor, hospital, expiryDate } = req.body
  const file = req.file

  const prescription = await prisma.prescription.create({
    data: {
      userId: req.user.id,
      fileName: file ? file.originalname : (req.body.fileName || 'prescription.pdf'),
      fileUrl: file ? `/uploads/${file.filename}` : (req.body.fileUrl || ''),
      doctor: doctor || null,
      hospital: hospital || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
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
