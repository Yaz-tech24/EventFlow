const router = require('express').Router();
const db     = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authMiddleware, (req, res) => {
  const { unread_only } = req.query;
  let sql = 'SELECT * FROM notifications WHERE user_id=?';
  if (unread_only === '1') sql += ' AND read=0';
  sql += ' ORDER BY created_at DESC LIMIT 50';
  const notifs = db.prepare(sql).all(req.user.id);
  const unread_count = db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id=? AND read=0').get(req.user.id)?.n || 0;
  res.json({ notifications: notifs, unread_count });
});

// PATCH /api/notifications/read-all  — must be declared BEFORE /:id/read
router.patch('/read-all', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(req.user.id);
  res.json({ message: 'Todas as notificações marcadas como lidas' });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Marcado como lido' });
});

// DELETE /api/notifications — clear all
router.delete('/', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE user_id=?').run(req.user.id);
  res.json({ message: 'Todas as notificações removidas' });
});

// DELETE /api/notifications/:id
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Notificação removida' });
});

module.exports = router;
