const router = require('express').Router();
const db     = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

function enrichEvent(event) {
  if (!event) return null;
  event.ticket_types = db.prepare(`
    SELECT *, (quantity - sold) AS available FROM ticket_types WHERE event_id = ?
  `).all(event.id);
  event.min_price = event.ticket_types.length
    ? Math.min(...event.ticket_types.map(t => t.price))
    : 0;
  event.total_sold = event.ticket_types.reduce((s, t) => s + t.sold, 0);
  event.total_capacity = event.ticket_types.reduce((s, t) => s + t.quantity, 0);
  event.avg_rating = db.prepare('SELECT AVG(rating) AS avg FROM reviews WHERE event_id=?').get(event.id)?.avg || null;
  event.review_count = db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE event_id=?').get(event.id)?.n || 0;
  event.tags = JSON.parse(event.tags || '[]');
  return event;
}

// GET /api/events — public listing with filters
router.get('/', optionalAuth, (req, res) => {
  const { q, cat, city, free, sort = 'date_start', page = 1, limit = 12 } = req.query;

  let sql = `
    SELECT e.*,
           u.first_name || ' ' || u.last_name AS organizer_name,
           o.org_name, o.verified AS org_verified,
           (SELECT MIN(price) FROM ticket_types WHERE event_id=e.id) AS min_price,
           (SELECT SUM(sold) FROM ticket_types WHERE event_id=e.id) AS total_sold,
           (SELECT SUM(quantity) FROM ticket_types WHERE event_id=e.id) AS total_capacity
    FROM events e
    LEFT JOIN organizers o ON o.id = e.organizer_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE e.status = ?
  `;
  // Public endpoint always returns only published events
  const params = ['published'];

  if (q) { sql += ' AND (e.title LIKE ? OR e.venue LIKE ? OR e.city LIKE ?)'; const like = `%${q}%`; params.push(like,like,like); }
  if (cat) { sql += ' AND e.category = ?'; params.push(cat); }
  if (city) { sql += ' AND e.city = ?'; params.push(city); }
  if (free === '1') { sql += ' AND (SELECT MIN(price) FROM ticket_types WHERE event_id=e.id) = 0'; }

  const allowedSort = { date_start:'e.date_start ASC', price_asc:'min_price ASC', price_desc:'min_price DESC', az:'e.title ASC' };
  sql += ` ORDER BY ${allowedSort[sort] || 'e.date_start ASC'}`;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(sql.replace('SELECT e.*,', 'SELECT COUNT(*) AS n,').split('ORDER BY')[0]).get(...params)?.n || 0;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const events = db.prepare(sql).all(...params).map(e => {
    e.tags = JSON.parse(e.tags || '[]');
    return e;
  });

  res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/events/stats — public stats for splash/homepage
router.get('/stats', (req, res) => {
  const total_events  = db.prepare("SELECT COUNT(*) AS n FROM events WHERE status='published'").get()?.n || 0;
  const total_tickets = db.prepare('SELECT COALESCE(SUM(sold),0) AS n FROM ticket_types').get()?.n || 0;
  const total_users   = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='user'").get()?.n || 0;
  const total_orgs    = db.prepare("SELECT COUNT(*) AS n FROM organizers").get()?.n || 0;
  res.json({ total_events, total_tickets, total_users, total_orgs });
});

// GET /api/events/:id — single event with full details
router.get('/:id', optionalAuth, (req, res) => {
  const event = db.prepare(`
    SELECT e.*,
           o.org_name, o.verified AS org_verified, o.id AS organizer_id,
           u.first_name || ' ' || u.last_name AS organizer_full_name
    FROM events e
    LEFT JOIN organizers o ON o.id = e.organizer_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

  const reviews = db.prepare(`
    SELECT r.*, u.first_name, u.last_name FROM reviews r
    JOIN users u ON u.id = r.user_id WHERE r.event_id = ? ORDER BY r.created_at DESC
  `).all(event.id);

  res.json({ ...enrichEvent(event), reviews });
});

// POST /api/events — organizer/admin create
router.post('/', authMiddleware, requireRole('organizer','admin'), (req, res) => {
  const {
    title, description, category, emoji = '🎪',
    date_start, time_start = '20:00', date_end, time_end,
    venue, address, city = 'Maputo', capacity = 100,
    cancel_policy = 'no_refund', is_online = 0, online_link,
    tags = [], bg_gradient, ticket_types = [],
  } = req.body;

  if (!title || !category || !date_start || !venue)
    return res.status(400).json({ error: 'Campos obrigatórios: título, categoria, data, local' });

  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  const orgId = org?.id || null;

  const result = db.prepare(`
    INSERT INTO events (organizer_id,title,description,category,emoji,date_start,time_start,
      date_end,time_end,venue,address,city,capacity,status,cancel_policy,is_online,
      online_link,tags,bg_gradient)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    orgId, title, description||null, category, emoji,
    date_start, time_start, date_end||null, time_end||null,
    venue, address||null, city, capacity,
    req.user.role==='admin' ? 'published' : 'pending',
    cancel_policy, is_online?1:0, online_link||null,
    JSON.stringify(tags),
    bg_gradient || 'linear-gradient(135deg,#1a0a2e,#3d0a2e)',
  );

  const eventId = result.lastInsertRowid;

  // Insert ticket types
  const insertTT = db.prepare('INSERT INTO ticket_types (event_id,name,description,price,quantity) VALUES (?,?,?,?,?)');
  ticket_types.forEach(t => insertTT.run(eventId, t.name, t.description||null, t.price||0, t.quantity||100));

  const event = db.prepare('SELECT * FROM events WHERE id=?').get(eventId);
  res.status(201).json(enrichEvent(event));
});

// PUT /api/events/:id — organizer/admin update
router.put('/:id', authMiddleware, requireRole('organizer','admin'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (req.user.role !== 'admin' && event.organizer_id !== org?.id)
    return res.status(403).json({ error: 'Sem permissão para editar este evento' });

  const fields = ['title','description','category','emoji','date_start','time_start',
    'date_end','time_end','venue','address','city','capacity','status','cancel_policy',
    'is_online','online_link','tags','bg_gradient'];

  const updates = [];
  const params = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f}=?`);
      params.push(f === 'tags' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  });
  if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para actualizar' });

  updates.push("updated_at=datetime('now')");
  params.push(req.params.id);
  db.prepare(`UPDATE events SET ${updates.join(',')} WHERE id=?`).run(...params);

  res.json(enrichEvent(db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id)));
});

// DELETE /api/events/:id
router.delete('/:id', authMiddleware, requireRole('organizer','admin'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

  const org = db.prepare('SELECT id FROM organizers WHERE user_id=?').get(req.user.id);
  if (req.user.role !== 'admin' && event.organizer_id !== org?.id)
    return res.status(403).json({ error: 'Sem permissão' });

  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ message: 'Evento eliminado' });
});

// PATCH /api/events/:id/status — admin approve/reject
router.patch('/:id/status', authMiddleware, requireRole('admin'), (req, res) => {
  const { status } = req.body;
  if (!['published','cancelled','draft','pending'].includes(status))
    return res.status(400).json({ error: 'Estado inválido' });

  db.prepare("UPDATE events SET status=?,updated_at=datetime('now') WHERE id=?").run(status, req.params.id);
  res.json({ message: `Evento ${status}` });
});

module.exports = router;
