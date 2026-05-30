const router = require('express').Router();
const bcrypt  = require('bcryptjs');
const multer  = require('multer');
const path    = require('path');
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const avatarUpload = multer({
  dest: path.join(__dirname, '../../uploads/avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Apenas imagens são aceites'));
    cb(null, true);
  },
}).single('avatar');

// GET /api/users/me/stats
router.get('/me/stats', authMiddleware, (req, res) => {
  const uid = req.user.id;
  const tickets_bought  = db.prepare('SELECT COUNT(*) AS n FROM orders WHERE user_id=?').get(uid)?.n || 0;
  const events_attended = db.prepare("SELECT COUNT(*) AS n FROM orders o JOIN events e ON e.id=o.event_id WHERE o.user_id=? AND e.date_start < date('now')").get(uid)?.n || 0;
  const favorites_count = db.prepare('SELECT COUNT(*) AS n FROM favorites WHERE user_id=?').get(uid)?.n || 0;
  const avg_rating      = db.prepare('SELECT AVG(rating) AS avg FROM reviews WHERE user_id=?').get(uid)?.avg || null;
  res.json({ tickets_bought, events_attended, favorites_count, avg_rating });
});

// PUT /api/users/me — update own profile
router.put('/me', authMiddleware, (req, res) => {
  const { first_name, last_name, phone, city, birth_date } = req.body;
  const fields = [];
  const params = [];

  if (first_name) { fields.push('first_name=?'); params.push(first_name); }
  if (last_name)  { fields.push('last_name=?');  params.push(last_name); }
  if (phone)      { fields.push('phone=?');       params.push(phone); }
  if (city)       { fields.push('city=?');        params.push(city); }
  if (birth_date) { fields.push('birth_date=?');  params.push(birth_date); }

  if (!fields.length) return res.status(400).json({ error: 'Nenhum campo para actualizar' });

  fields.push("updated_at=datetime('now')");
  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${fields.join(',')} WHERE id=?`).run(...params);

  const user = db.prepare('SELECT id,first_name,last_name,email,role,phone,city,birth_date,avatar_url,created_at FROM users WHERE id=?').get(req.user.id);
  res.json(user);
});

// POST /api/users/me/avatar — upload avatar
router.post('/me/avatar', authMiddleware, (req, res) => {
  avatarUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Ficheiro em falta' });

    const avatar_url = `/uploads/avatars/${req.file.filename}`;
    db.prepare("UPDATE users SET avatar_url=?,updated_at=datetime('now') WHERE id=?")
      .run(avatar_url, req.user.id);

    res.json({ avatar_url, message: 'Avatar atualizado com sucesso' });
  });
});

// PUT /api/users/me/organizer — update organizer profile
router.put('/me/organizer', authMiddleware, (req, res) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Apenas organizadores podem actualizar este perfil' });

  const { org_name, description, category, website, bank_name, bank_iban, mpesa_number } = req.body;
  const org = db.prepare('SELECT * FROM organizers WHERE user_id=?').get(req.user.id);
  if (!org) return res.status(404).json({ error: 'Perfil de organizador não encontrado' });

  const fields = [];
  const params = [];
  if (org_name)     { fields.push('org_name=?');     params.push(org_name); }
  if (description)  { fields.push('description=?');  params.push(description); }
  if (category)     { fields.push('category=?');     params.push(category); }
  if (website)      { fields.push('website=?');      params.push(website); }
  if (bank_name)    { fields.push('bank_name=?');    params.push(bank_name); }
  if (bank_iban)    { fields.push('bank_iban=?');    params.push(bank_iban); }
  if (mpesa_number) { fields.push('mpesa_number=?'); params.push(mpesa_number); }

  if (!fields.length) return res.status(400).json({ error: 'Nenhum campo para actualizar' });
  params.push(org.id);
  db.prepare(`UPDATE organizers SET ${fields.join(',')} WHERE id=?`).run(...params);

  res.json(db.prepare('SELECT * FROM organizers WHERE id=?').get(org.id));
});

// GET /api/users/me/history — purchase history
router.get('/me/history', authMiddleware, (req, res) => {
  const history = db.prepare(`
    SELECT o.id, o.total_price, o.payment_method, o.payment_status, o.created_at,
           e.title AS event_title, e.emoji, e.date_start,
           tt.name AS ticket_type
    FROM orders o
    JOIN events e ON e.id = o.event_id
    JOIN ticket_types tt ON tt.id = o.ticket_type_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json(history);
});

// DELETE /api/users/me — deactivate account
router.delete('/me', authMiddleware, (req, res) => {
  db.prepare("UPDATE users SET is_active=0,updated_at=datetime('now') WHERE id=?").run(req.user.id);
  res.json({ message: 'Conta desactivada com sucesso' });
});

// POST /api/users/contact — public contact form (no auth required)
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email, mensagem' });
  console.log('[CONTACT]', new Date().toISOString(), { name, email, subject: subject || '—', message: message.slice(0, 200) });
  res.json({ message: 'Mensagem recebida com sucesso. Responderemos brevemente!' });
});

module.exports = router;
