const multer = require('multer')
const path = require('path')
const fs = require('fs')

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `avatar_${req.user.id}${ext}`)
  },
})

const avatarFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'), false)
  }
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
}).single('avatar')

module.exports = { uploadAvatar }
