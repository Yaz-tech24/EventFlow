const Database = require('better-sqlite3');
const path = require('path');
const fs   = require('fs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/eventflow.db'
  : path.join(__dirname, 'eventflow.db');
const db = new Database(dbPath);

// Performance settings
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name    TEXT    NOT NULL,
  last_name     TEXT    NOT NULL,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'user',
  phone         TEXT,
  city          TEXT    DEFAULT 'Maputo',
  birth_date    TEXT,
  avatar_url    TEXT,
  is_active     INTEGER DEFAULT 1,
  created_at    TEXT    DEFAULT (datetime('now')),
  updated_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organizers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_name     TEXT    NOT NULL,
  description  TEXT,
  category     TEXT,
  website      TEXT,
  logo_url     TEXT,
  verified     INTEGER DEFAULT 0,
  bank_name    TEXT,
  bank_iban    TEXT,
  mpesa_number TEXT,
  created_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id  INTEGER REFERENCES organizers(id),
  title         TEXT    NOT NULL,
  description   TEXT,
  category      TEXT    NOT NULL,
  emoji         TEXT    DEFAULT '🎪',
  date_start    TEXT    NOT NULL,
  time_start    TEXT    DEFAULT '20:00',
  date_end      TEXT,
  time_end      TEXT,
  venue         TEXT    NOT NULL,
  address       TEXT,
  city          TEXT    NOT NULL DEFAULT 'Maputo',
  capacity      INTEGER DEFAULT 100,
  status        TEXT    DEFAULT 'draft',
  image_url     TEXT,
  cancel_policy TEXT    DEFAULT 'no_refund',
  is_online     INTEGER DEFAULT 0,
  online_link   TEXT,
  tags          TEXT    DEFAULT '[]',
  bg_gradient   TEXT    DEFAULT 'linear-gradient(135deg,#1a0a2e,#3d0a2e)',
  created_at    TEXT    DEFAULT (datetime('now')),
  updated_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ticket_types (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  description TEXT,
  price       REAL    NOT NULL DEFAULT 0,
  quantity    INTEGER NOT NULL DEFAULT 100,
  sold        INTEGER DEFAULT 0,
  created_at  TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  event_id       INTEGER NOT NULL REFERENCES events(id),
  ticket_type_id INTEGER NOT NULL REFERENCES ticket_types(id),
  quantity       INTEGER NOT NULL DEFAULT 1,
  unit_price     REAL    NOT NULL,
  service_fee    REAL    DEFAULT 0,
  total_price    REAL    NOT NULL,
  payment_method TEXT    DEFAULT 'mpesa',
  payment_status TEXT    DEFAULT 'pending',
  qr_code        TEXT    UNIQUE,
  buyer_name     TEXT,
  buyer_email    TEXT,
  buyer_phone    TEXT,
  created_at     TEXT    DEFAULT (datetime('now')),
  updated_at     TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TEXT    DEFAULT (datetime('now')),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  event_id   INTEGER NOT NULL REFERENCES events(id),
  rating     INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TEXT    DEFAULT (datetime('now')),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT    DEFAULT 'sistema',
  title      TEXT    NOT NULL,
  body       TEXT,
  read       INTEGER DEFAULT 0,
  action_url TEXT,
  created_at TEXT    DEFAULT (datetime('now'))
);
`);

// Migrations — add columns that may be missing in existing databases
const migrations = [
  "ALTER TABLE users ADD COLUMN reset_token TEXT",
  "ALTER TABLE users ADD COLUMN reset_token_expires TEXT",
  "ALTER TABLE orders ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))",
];
for (const sql of migrations) {
  try { db.exec(sql); } catch { /* column already exists — ignore */ }
}

// Indexes for performance
db.exec(`
CREATE INDEX IF NOT EXISTS idx_events_status        ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category      ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_city          ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_date_start    ON events(date_start);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id  ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id      ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id     ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id    ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_event_id   ON favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_notifs_user_id       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_read          ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_reviews_event_id     ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_organizers_user_id   ON organizers(user_id);
`);

// Ensure upload directories exist
const uploadsBase = path.join(__dirname, '../../uploads');
for (const dir of ['avatars', 'events']) {
  const p = path.join(uploadsBase, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

module.exports = db;
