const router = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const eventImageUpload = multer({
  dest: path.join(__dirname, '../../uploads/events'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Apenas imagens são aceites'));
    cb(null, true);
  },
}).single('image');

const auth = [authMiddleware, requireRole('organizer','admin')];

// GET /api/organizer — public listing of organizers
router.get('/', (req, res) => {
  const { q, verified, cat, limit = 20 } = req.query;
  let sql = `
    SELECT o.id, o.org_name, o.description, o.category, o.logo_url, o.verified,
           COUNT(DISTINCT e.id) AS total_events,
           ROUND(AVG(r.rating), 1) AS avg_rating
    FROM organizers o
    LEFT JOIN events e ON e.organizer_id=o.id AND e.status='published'
    LEFT JOIN reviews r ON r.event_id=e.id
    WHERE 1=1
  `;
  const params = [];
  if (q) { sql += ' AND (o.org_name LIKE ? OR o.description LIKE ?)'; const l=`%${q}%`; params.push(l,l); }
  if (verified !== undefined) { sql += ' AND o.verified=?'; params.push(verified==='1'?1:0); }
  if (cat) { sql += ' AND o.category=?'; params.push(cat); }
  sql += ` GROUP BY o.id ORDER BY total_events DESC LIMIT ?`;
  params.push(parseInt(limit));
  res.json(db.prepare(sql).all(...params));
});

// GET /api/organizer/stats — dashboard KPIs
router.get('/stats', ...auth, (req, res) => {
  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (!org) return res.status(404).json({ error: 'Perfil de organizador não encontrado' });

  const total_events   = db.prepare("SELECT COUNT(*) AS n FROM events WHERE organizer_id=? AND status='published'").get(org.id)?.n || 0;
  const total_tickets  = db.prepare('SELECT COALESCE(SUM(sold),0) AS n FROM ticket_types tt JOIN events e ON e.id=tt.event_id WHERE e.organizer_id=?').get(org.id)?.n || 0;
  const total_revenue  = db.prepare("SELECT COALESCE(SUM(total_price),0) AS n FROM orders o JOIN events e ON e.id=o.event_id WHERE e.organizer_id=? AND o.payment_status='paid'").get(org.id)?.n || 0;
  const avg_rating     = db.prepare('SELECT AVG(r.rating) AS avg FROM reviews r JOIN events e ON e.id=r.event_id WHERE e.organizer_id=?').get(org.id)?.avg || null;

  res.json({ total_events, total_tickets, total_revenue, avg_rating });
});

// GET /api/organizer/events — all organizer events
router.get('/events', ...auth, (req, res) => {
  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (!org) return res.status(404).json({ error: 'Perfil não encontrado' });

  const { status } = req.query;
  let sql = `
    SELECT e.*,
      (SELECT COALESCE(SUM(sold),0) FROM ticket_types WHERE event_id=e.id) AS total_sold,
      (SELECT COALESCE(SUM(quantity),0) FROM ticket_types WHERE event_id=e.id) AS total_capacity,
      (SELECT COALESCE(SUM(total_price),0) FROM orders WHERE event_id=e.id AND payment_status='paid') AS revenue,
      (SELECT AVG(rating) FROM reviews WHERE event_id=e.id) AS avg_rating
    FROM events e WHERE e.organizer_id=?
  `;
  const params = [org.id];
  if (status) { sql += ' AND e.status=?'; params.push(status); }
  sql += ' ORDER BY e.date_start DESC';

  res.json(db.prepare(sql).all(...params).map(e => ({ ...e, tags: JSON.parse(e.tags || '[]') })));
});

// GET /api/organizer/tickets — recent ticket sales
router.get('/tickets', ...auth, (req, res) => {
  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (!org) return res.status(404).json({ error: 'Perfil não encontrado' });

  const tickets = db.prepare(`
    SELECT o.id, o.quantity, o.total_price, o.payment_method, o.payment_status, o.created_at,
           o.buyer_name, o.buyer_email,
           e.title AS event_title, e.emoji,
           tt.name AS ticket_type_name
    FROM orders o
    JOIN events e ON e.id = o.event_id
    JOIN ticket_types tt ON tt.id = o.ticket_type_id
    WHERE e.organizer_id = ?
    ORDER BY o.created_at DESC
    LIMIT 100
  `).all(org.id);
  res.json(tickets);
});

// GET /api/organizer/revenue — monthly revenue breakdown
router.get('/revenue', ...auth, (req, res) => {
  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (!org) return res.status(404).json({ error: 'Perfil não encontrado' });

  const monthly = db.prepare(`
    SELECT strftime('%Y-%m', o.created_at) AS month,
           SUM(o.total_price) AS revenue,
           COUNT(*) AS orders
    FROM orders o
    JOIN events e ON e.id = o.event_id
    WHERE e.organizer_id=? AND o.payment_status='paid'
    GROUP BY month ORDER BY month DESC LIMIT 12
  `).all(org.id);
  res.json(monthly);
});

// POST /api/organizer/events/:id/image — upload event image
router.post('/events/:id/image', ...auth, (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (req.user.role !== 'admin' && event.organizer_id !== org?.id)
    return res.status(403).json({ error: 'Sem permissão' });

  eventImageUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Ficheiro em falta' });

    const image_url = `/uploads/events/${req.file.filename}`;
    db.prepare("UPDATE events SET image_url=?,updated_at=datetime('now') WHERE id=?")
      .run(image_url, req.params.id);

    res.json({ image_url, message: 'Imagem do evento atualizada com sucesso' });
  });
});

module.exports = router;
