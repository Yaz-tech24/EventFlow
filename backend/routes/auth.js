const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const db      = require('../config/database');
const { signToken, authMiddleware } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { first_name, last_name, email, password, role = 'user', phone, city } = req.body;

  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ error: 'Campos obrigatórios em falta' });

  if (!['user','organizer'].includes(role))
    return res.status(400).json({ error: 'Papel inválido' });

  if (password.length < 8)
    return res.status(400).json({ error: 'A password deve ter pelo menos 8 caracteres' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Este email já está registado' });

  const hash = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (first_name, last_name, email, password_hash, role, phone, city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(first_name, last_name, email, hash, role, phone || null, city || 'Maputo');

  const userId = result.lastInsertRowid;

  // Create organizer profile automatically
  if (role === 'organizer') {
    db.prepare(`
      INSERT INTO organizers (user_id, org_name, category)
      VALUES (?, ?, 'geral')
    `).run(userId, `${first_name} ${last_name}`);
  }

  // Welcome notification
  db.prepare(`
    INSERT INTO notifications (user_id, type, title, body)
    VALUES (?, 'sistema', 'Bem-vindo ao EventFlow! 🎉', 'A tua conta foi criada com sucesso. Descobre os melhores eventos de Moçambique.')
  `).run(userId);

  const user = db.prepare('SELECT id,first_name,last_name,email,role,city,created_at FROM users WHERE id=?').get(userId);
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({ user, token });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e password obrigatórios' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Credenciais inválidas' });

  if (!user.is_active)
    return res.status(403).json({ error: 'Conta suspensa. Contacta o suporte.' });

  const { password_hash, ...safeUser } = user;
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({ user: safeUser, token });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(`
    SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.phone, u.city,
           u.birth_date, u.avatar_url, u.created_at,
           o.id AS org_id, o.org_name, o.verified, o.category AS org_category
    FROM users u
    LEFT JOIN organizers o ON o.user_id = u.id
    WHERE u.id = ?
  `).get(req.user.id);

  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
  res.json(user);
});

// PUT /api/auth/password
router.put('/password', authMiddleware, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Campos obrigatórios em falta' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash))
    return res.status(401).json({ error: 'Password atual incorreta' });

  if (new_password.length < 8)
    return res.status(400).json({ error: 'A nova password deve ter pelo menos 8 caracteres' });

  db.prepare("UPDATE users SET password_hash=?, updated_at=datetime('now') WHERE id=?")
    .run(bcrypt.hashSync(new_password, 10), req.user.id);

  res.json({ message: 'Password alterada com sucesso' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });

  const user = db.prepare('SELECT id, first_name FROM users WHERE email=? AND is_active=1').get(email);

  // Always return success to prevent user enumeration
  if (!user) return res.json({ message: 'Se o email existir, receberás um link de recuperação.' });

  const token = require('crypto').randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  db.prepare("UPDATE users SET reset_token=?, reset_token_expires=? WHERE id=?")
    .run(token, expires, user.id);

  // In production this would send an email; for now store and notify
  db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'sistema',?,?)")
    .run(user.id, 'Recuperação de password 🔐',
      `Usa o token para redefinir a tua password: ${token} (válido 1 hora)`);

  res.json({ message: 'Se o email existir, receberás um link de recuperação.', dev_token: token });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password)
    return res.status(400).json({ error: 'Token e nova password obrigatórios' });

  if (new_password.length < 8)
    return res.status(400).json({ error: 'A password deve ter pelo menos 8 caracteres' });

  const user = db.prepare(`
    SELECT id FROM users
    WHERE reset_token=? AND reset_token_expires > datetime('now') AND is_active=1
  `).get(token);

  if (!user) return res.status(400).json({ error: 'Token inválido ou expirado' });

  db.prepare("UPDATE users SET password_hash=?, reset_token=NULL, reset_token_expires=NULL, updated_at=datetime('now') WHERE id=?")
    .run(bcrypt.hashSync(new_password, 10), user.id);

  res.json({ message: 'Password redefinida com sucesso. Podes fazer login.' });
});

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id,email,role,is_active FROM users WHERE id=?').get(req.user.id);
  if (!user || !user.is_active) return res.status(401).json({ error: 'Sessão inválida' });
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token });
});

module.exports = router;
