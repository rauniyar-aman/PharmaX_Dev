const prisma = require('../config/db')

async function createNotification({ userId, type, title, message, link }) {
  try {
    await prisma.notification.create({ data: { userId, type, title, message, link } })
  } catch (err) {
    console.error('Failed to create notification:', err.message)
  }
}

async function notifyAdmins({ type, title, message, link }) {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true, isDeleted: false }, select: { id: true } })
    await Promise.all(admins.map(a => createNotification({ userId: a.id, type, title, message, link })))
  } catch (err) {
    console.error('Failed to notify admins:', err.message)
  }
}

module.exports = { createNotification, notifyAdmins }
