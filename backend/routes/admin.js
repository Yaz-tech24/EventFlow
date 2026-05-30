const router = require('express').Router();
const db     = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const auth = [authMiddleware, requireRole('admin')];

// GET /api/admin/stats
router.get('/stats', ...auth, (req, res) => {
  res.json({
    total_users:      db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='user'").get()?.n || 0,
    total_organizers: db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='organizer'").get()?.n || 0,
    total_events:     db.prepare("SELECT COUNT(*) AS n FROM events WHERE status='published'").get()?.n || 0,
    pending_events:   db.prepare("SELECT COUNT(*) AS n FROM events WHERE status='pending'").get()?.n || 0,
    total_tickets:    db.prepare('SELECT COALESCE(SUM(sold),0) AS n FROM ticket_types').get()?.n || 0,
    total_revenue:    db.prepare("SELECT COALESCE(SUM(total_price),0) AS n FROM orders WHERE payment_status='paid'").get()?.n || 0,
  });
});

// GET /api/admin/users
router.get('/users', ...auth, (req, res) => {
  const { role, q, page = 1, limit = 20 } = req.query;
  let sql = 'SELECT id,first_name,last_name,email,role,city,phone,is_active,created_at FROM users WHERE 1=1';
  const params = [];
  if (role) { sql += ' AND role=?'; params.push(role); }
  if (q)    { sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)'; const l=`%${q}%`; params.push(l,l,l); }
  const total = db.prepare(sql.replace('SELECT id,','SELECT COUNT(*) AS n,')).get(...params)?.n || 0;
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page)-1)*parseInt(limit));
  res.json({ users: db.prepare(sql).all(...params), total });
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', ...auth, (req, res) => {
  const { is_active } = req.body;
  db.prepare("UPDATE users SET is_active=?,updated_at=datetime('now') WHERE id=?").run(is_active?1:0, req.params.id);

  const user = db.prepare('SELECT id, first_name FROM users WHERE id=?').get(req.params.id);
  if (user) {
    const msg = is_active
      ? 'A tua conta foi reativada. Podes fazer login normalmente.'
      : 'A tua conta foi suspensa. Contacta o suporte para mais informações.';
    db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'sistema',?,?)")
      .run(user.id, is_active ? '✅ Conta reativada' : '⚠️ Conta suspensa', msg);
  }

  res.json({ message: is_active ? 'Utilizador activado' : 'Utilizador suspenso' });
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', ...auth, (req, res) => {
  const { role } = req.body;
  if (!['user','organizer','admin'].includes(role)) return res.status(400).json({ error: 'Papel inválido' });
  db.prepare("UPDATE users SET role=?,updated_at=datetime('now') WHERE id=?").run(role, req.params.id);
  res.json({ message: `Papel alterado para ${role}` });
});

// GET /api/admin/events — all events (any status)
router.get('/events', ...auth, (req, res) => {
  const { status, q, page = 1, limit = 20 } = req.query;
  let sql = `SELECT e.*,o.org_name,u.first_name||' '||u.last_name AS organizer_name
    FROM events e LEFT JOIN organizers o ON o.id=e.organizer_id LEFT JOIN users u ON u.id=o.user_id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND e.status=?'; params.push(status); }
  if (q)      { sql += ' AND (e.title LIKE ? OR e.city LIKE ?)'; const l=`%${q}%`; params.push(l,l); }
  const total = db.prepare(`SELECT COUNT(*) AS n FROM events e WHERE 1=1${status?' AND e.status=?':''}${q?' AND (e.title LIKE ? OR e.city LIKE ?)':''}`).get(...params)?.n || 0;
  sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit),(parseInt(page)-1)*parseInt(limit));
  res.json({ events: db.prepare(sql).all(...params), total });
});

// PATCH /api/admin/events/:id/approve
router.patch('/events/:id/approve', ...auth, (req, res) => {
  db.prepare("UPDATE events SET status='published',updated_at=datetime('now') WHERE id=?").run(req.params.id);
  const event = db.prepare('SELECT title,organizer_id FROM events WHERE id=?').get(req.params.id);
  if (event) {
    const orgUser = db.prepare('SELECT user_id FROM organizers WHERE id=?').get(event.organizer_id);
    if (orgUser) {
      db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'eventos',?,?)")
        .run(orgUser.user_id, '✅ Evento aprovado!', `O teu evento "${event.title}" foi aprovado e está agora publicado.`);
    }
  }
  res.json({ message: 'Evento aprovado e publicado' });
});

// PATCH /api/admin/events/:id/reject
router.patch('/events/:id/reject', ...auth, (req, res) => {
  const { reason } = req.body;
  db.prepare("UPDATE events SET status='draft',updated_at=datetime('now') WHERE id=?").run(req.params.id);

  const event = db.prepare('SELECT title,organizer_id FROM events WHERE id=?').get(req.params.id);
  if (event) {
    const orgUser = db.prepare('SELECT user_id FROM organizers WHERE id=?').get(event.organizer_id);
    if (orgUser) {
      const reasonText = reason ? ` Motivo: ${reason}` : '';
      db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'eventos',?,?)")
        .run(orgUser.user_id, '❌ Evento rejeitado', `O teu evento "${event.title}" foi rejeitado.${reasonText} Revê os detalhes e submete novamente.`);
    }
  }

  res.json({ message: 'Evento rejeitado', reason: reason || null });
});

// DELETE /api/admin/events/:id
router.delete('/events/:id', ...auth, (req, res) => {
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ message: 'Evento eliminado' });
});

// PATCH /api/admin/organizers/:id/verify
router.patch('/organizers/:id/verify', ...auth, (req, res) => {
  db.prepare('UPDATE organizers SET verified=1 WHERE id=?').run(req.params.id);
  const org = db.prepare('SELECT user_id,org_name FROM organizers WHERE id=?').get(req.params.id);
  if (org) {
    db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'sistema',?,?)")
      .run(org.user_id, '✅ Organizador verificado!', `Parabéns! O perfil "${org.org_name}" foi verificado pela equipa EventFlow.`);
  }
  res.json({ message: 'Organizador verificado' });
});

// GET /api/admin/organizers — list all organizers with verification status
router.get('/organizers', ...auth, (req, res) => {
  const { verified, q, page = 1, limit = 20 } = req.query;
  let sql = `SELECT o.*, u.first_name||' '||u.last_name AS user_name, u.email
    FROM organizers o JOIN users u ON u.id=o.user_id WHERE 1=1`;
  const params = [];
  if (verified !== undefined) { sql += ' AND o.verified=?'; params.push(verified==='1'?1:0); }
  if (q) { sql += ' AND (o.org_name LIKE ? OR u.email LIKE ?)'; const l=`%${q}%`; params.push(l,l); }
  const total = db.prepare(`SELECT COUNT(*) AS n FROM organizers o JOIN users u ON u.id=o.user_id WHERE 1=1${verified!==undefined?' AND o.verified=?':''}${q?' AND (o.org_name LIKE ? OR u.email LIKE ?)':''}`).get(...params)?.n || 0;
  sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit),(parseInt(page)-1)*parseInt(limit));
  res.json({ organizers: db.prepare(sql).all(...params), total });
});

// GET /api/admin/revenue
router.get('/revenue', ...auth, (req, res) => {
  const monthly = db.prepare(`
    SELECT strftime('%Y-%m', created_at) AS month,
           SUM(total_price) AS revenue, COUNT(*) AS orders
    FROM orders WHERE payment_status='paid'
    GROUP BY month ORDER BY month DESC LIMIT 12
  `).all();
  const byMethod = db.prepare("SELECT payment_method, COUNT(*) AS n, SUM(total_price) AS total FROM orders WHERE payment_status='paid' GROUP BY payment_method").all();
  res.json({ monthly, by_method: byMethod });
});

module.exports = router;
