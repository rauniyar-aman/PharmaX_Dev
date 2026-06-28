const router = require('express').Router()
const { getNotifications, markAllRead, markRead, deleteNotification, clearAll } = require('../controllers/notifications.controller')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/', getNotifications)
router.put('/read-all', markAllRead)
router.put('/:id/read', markRead)
router.delete('/clear-all', clearAll)
router.delete('/:id', deleteNotification)

module.exports = router
