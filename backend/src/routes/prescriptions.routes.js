const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { getPrescriptions, uploadPrescription, deletePrescription } = require('../controllers/prescriptions.controller')
const { protect } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

router.use(protect)
router.get('/', getPrescriptions)
router.post('/', upload.single('file'), uploadPrescription)
router.delete('/:id', deletePrescription)

module.exports = router
