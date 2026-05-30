require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const fs        = require('fs');

require('./config/database');

const app    = express();
const PORT   = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ── Uploads folder ────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Security headers ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: function(origin, callback) {
    // Permite requests sem origin (ex: Postman, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error('CORS bloqueado para origem:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no browser origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsing (with size limit) ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiados pedidos. Tenta novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas tentativas. Tenta novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply strict rate limit to auth endpoints before general limiter
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/',              apiLimiter);

// ── Static files ──────────────────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '../frontend')));
// Also serve html/ at root so /eventflow_*.html works without the /html/ prefix
app.use(express.static(path.join(__dirname, '../frontend/html')));

// Default route → splash screen
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/eventflow_splash_screen.html'));
});

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/tickets',       require('./routes/tickets'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/favorites',     require('./routes/favorites'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/organizer',     require('./routes/organizer'));

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` }));

// ── Error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  // Never leak internal error details in production
  const message = isProd && status === 500
    ? 'Erro interno do servidor'
    : (err.message || 'Erro interno do servidor');
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`\nEventFlow API a correr em http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health\n`);
});
