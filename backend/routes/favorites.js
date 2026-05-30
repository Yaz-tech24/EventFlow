const router = require('express').Router();
const db     = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/favorites
router.get('/', authMiddleware, (req, res) => {
  const favs = db.prepare(`
    SELECT e.id, e.title, e.emoji, e.date_start, e.venue, e.city, e.bg_gradient,
           (SELECT MIN(price) FROM ticket_types WHERE event_id=e.id) AS min_price,
           f.created_at AS saved_at
    FROM favorites f
    JOIN events e ON e.id = f.event_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json(favs);
});

// GET /api/favorites/:eventId/check  — must be before /:eventId to avoid conflict
router.get('/:eventId/check', authMiddleware, (req, res) => {
  const fav = db.prepare('SELECT id FROM favorites WHERE user_id=? AND event_id=?').get(req.user.id, req.params.eventId);
  res.json({ is_favorite: !!fav });
});

// POST /api/favorites/:eventId
router.post('/:eventId', authMiddleware, (req, res) => {
  const event = db.prepare('SELECT id, title FROM events WHERE id=?').get(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

  try {
    db.prepare('INSERT INTO favorites (user_id, event_id) VALUES (?,?)').run(req.user.id, req.params.eventId);

    db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'eventos',?,?)")
      .run(req.user.id, 'Evento guardado nos favoritos ❤️', `Adicionaste "${event.title}" aos teus favoritos.`);

    res.status(201).json({ message: 'Adicionado aos favoritos' });
  } catch {
    res.status(409).json({ error: 'Já está nos favoritos' });
  }
});

// DELETE /api/favorites/:eventId
router.delete('/:eventId', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id=? AND event_id=?').run(req.user.id, req.params.eventId);
  res.json({ message: 'Removido dos favoritos' });
});

module.exports = router;
