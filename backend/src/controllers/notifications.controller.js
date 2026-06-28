const prisma = require('../config/db')
const { ok } = require('../utils/response')

// GET /api/notifications
const getNotifications = async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const where = { userId: req.user.id }

  const [total, notifications, unreadCount] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
  ])

  ok(res, { notifications, unreadCount, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } })
}

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } })
  ok(res, {}, 'All notifications marked as read')
}

// PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } })
  ok(res, {}, 'Notification marked as read')
}

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.user.id } })
  ok(res, {}, 'Notification deleted')
}

// DELETE /api/notifications  (clear all)
const clearAll = async (req, res) => {
  await prisma.notification.deleteMany({ where: { userId: req.user.id } })
  ok(res, {}, 'All notifications cleared')
}

module.exports = { getNotifications, markAllRead, markRead, deleteNotification, clearAll }
