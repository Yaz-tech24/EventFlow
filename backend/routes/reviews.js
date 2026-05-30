const router = require('express').Router();
const db     = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/reviews/event/:eventId
router.get('/event/:eventId', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.id, r.rating, r.comment, r.created_at,
           u.first_name, u.last_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.event_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.eventId);

  const stats = db.prepare('SELECT AVG(rating) AS avg, COUNT(*) AS total FROM reviews WHERE event_id=?').get(req.params.eventId);
  const dist  = db.prepare('SELECT rating, COUNT(*) AS n FROM reviews WHERE event_id=? GROUP BY rating').all(req.params.eventId);

  res.json({ reviews, avg: stats.avg, total: stats.total, distribution: dist });
});

// POST /api/reviews — user submits review (must have attended)
router.post('/', authMiddleware, (req, res) => {
  const { event_id, rating, comment } = req.body;
  if (!event_id || !rating) return res.status(400).json({ error: 'event_id e rating obrigatórios' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' });

  const attended = db.prepare('SELECT id FROM orders WHERE user_id=? AND event_id=?').get(req.user.id, event_id);
  if (!attended) return res.status(403).json({ error: 'Só podes avaliar eventos com bilhete comprado' });

  try {
    db.prepare('INSERT INTO reviews (user_id,event_id,rating,comment) VALUES (?,?,?,?)')
      .run(req.user.id, event_id, rating, comment || null);
    res.status(201).json({ message: 'Avaliação submetida com sucesso' });
  } catch {
    db.prepare('UPDATE reviews SET rating=?,comment=? WHERE user_id=? AND event_id=?')
      .run(rating, comment || null, req.user.id, event_id);
    res.json({ message: 'Avaliação actualizada' });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Avaliação removida' });
});

module.exports = router;
