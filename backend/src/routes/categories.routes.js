const router = require('express').Router()
const { getCategories } = require('../controllers/categories.controller')

router.get('/', getCategories)

module.exports = router
