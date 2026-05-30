const router = require('express').Router();
const db     = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// POST /api/tickets/purchase
router.post('/purchase', authMiddleware, (req, res) => {
  const { event_id, ticket_type_id, quantity = 1, payment_method = 'mpesa',
          buyer_name, buyer_email, buyer_phone } = req.body;

  if (!event_id || !ticket_type_id)
    return res.status(400).json({ error: 'event_id e ticket_type_id obrigatórios' });

  const event = db.prepare("SELECT * FROM events WHERE id=? AND status='published'").get(event_id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado ou não disponível' });

  const tt = db.prepare('SELECT * FROM ticket_types WHERE id=? AND event_id=?').get(ticket_type_id, event_id);
  if (!tt) return res.status(404).json({ error: 'Tipo de bilhete não encontrado' });

  const available = tt.quantity - tt.sold;
  if (available < quantity)
    return res.status(409).json({ error: `Apenas ${available} lugar(es) disponível(is)` });

  if (!['mpesa','card','atm','paypal'].includes(payment_method))
    return res.status(400).json({ error: 'Método de pagamento inválido' });

  const unit_price  = tt.price;
  const SERVICE_FEE = unit_price === 0 ? 0 : 25; // no fee for free tickets
  const total_price = unit_price * quantity + SERVICE_FEE;
  const qr_code     = uuidv4();

  // Atomic transaction
  const purchase = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO orders (user_id,event_id,ticket_type_id,quantity,unit_price,service_fee,
        total_price,payment_method,payment_status,qr_code,buyer_name,buyer_email,buyer_phone)
      VALUES (?,?,?,?,?,?,?,?,'paid',?,?,?,?)
    `).run(
      req.user.id, event_id, ticket_type_id, quantity, unit_price, SERVICE_FEE,
      total_price, payment_method, qr_code,
      buyer_name  || null,
      buyer_email || null,
      buyer_phone || null,
    );

    db.prepare('UPDATE ticket_types SET sold=sold+? WHERE id=?').run(quantity, ticket_type_id);

    // Confirmation notification
    db.prepare(`
      INSERT INTO notifications (user_id,type,title,body)
      VALUES (?,?,?,?)
    `).run(
      req.user.id, 'bilhetes',
      'Bilhete confirmado! 🎟️',
      `O teu bilhete para "${event.title}" foi confirmado. Apresenta o QR Code na entrada.`,
    );

    return result.lastInsertRowid;
  });

  const orderId = purchase();
  const order   = db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);
  res.status(201).json({ order, qr_code, message: 'Compra realizada com sucesso!' });
});

// POST /api/tickets/:orderId/cancel
router.post('/:orderId/cancel', authMiddleware, (req, res) => {
  const order = db.prepare(`
    SELECT o.*, e.date_start, e.cancel_policy, tt.price AS unit_price
    FROM orders o
    JOIN events e ON e.id = o.event_id
    JOIN ticket_types tt ON tt.id = o.ticket_type_id
    WHERE o.id=? AND o.user_id=?
  `).get(req.params.orderId, req.user.id);

  if (!order) return res.status(404).json({ error: 'Bilhete não encontrado' });
  if (order.payment_status === 'cancelled') return res.status(409).json({ error: 'Bilhete já cancelado' });

  const eventDate = new Date(order.date_start);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / 3600000;

  if (hoursUntilEvent < 24)
    return res.status(400).json({ error: 'Não é possível cancelar com menos de 24h antes do evento' });

  db.transaction(() => {
    db.prepare("UPDATE orders SET payment_status='cancelled', updated_at=datetime('now') WHERE id=?")
      .run(order.id);
    db.prepare('UPDATE ticket_types SET sold=sold-? WHERE id=?')
      .run(order.quantity, order.ticket_type_id);
    db.prepare("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'bilhetes',?,?)")
      .run(req.user.id, 'Bilhete cancelado', `O teu bilhete foi cancelado. ${order.cancel_policy === 'no_refund' ? 'Este evento não tem política de reembolso.' : 'O reembolso será processado em 5-7 dias úteis.'}`);
  })();

  res.json({ message: 'Bilhete cancelado com sucesso' });
});

// GET /api/tickets/my — authenticated user's tickets
router.get('/my', authMiddleware, (req, res) => {
  const { status } = req.query; // 'upcoming' | 'past'
  let sql = `
    SELECT o.*, e.title AS event_title, e.date_start, e.venue, e.city, e.emoji,
           e.bg_gradient, tt.name AS ticket_type_name
    FROM orders o
    JOIN events e ON e.id = o.event_id
    JOIN ticket_types tt ON tt.id = o.ticket_type_id
    WHERE o.user_id = ?
  `;
  const params = [req.user.id];

  if (status === 'upcoming') { sql += " AND e.date_start >= date('now')"; }
  if (status === 'past')     { sql += " AND e.date_start < date('now')"; }
  sql += ' ORDER BY e.date_start DESC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/tickets/:orderId/qr — get QR code for a specific order
router.get('/:orderId/qr', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?')
    .get(req.params.orderId, req.user.id);
  if (!order) return res.status(404).json({ error: 'Bilhete não encontrado' });
  res.json({ qr_code: order.qr_code, order_id: order.id });
});

// GET /api/tickets/validate/:qrCode — organizer validates at door
router.get('/validate/:qrCode', authMiddleware, requireRole('organizer','admin'), (req, res) => {
  const order = db.prepare(`
    SELECT o.*, e.title, u.first_name, u.last_name, tt.name AS ticket_type
    FROM orders o
    JOIN events e ON e.id = o.event_id
    JOIN users u ON u.id = o.user_id
    JOIN ticket_types tt ON tt.id = o.ticket_type_id
    WHERE o.qr_code = ?
  `).get(req.params.qrCode);

  if (!order) return res.status(404).json({ valid: false, error: 'QR Code inválido' });
  res.json({ valid: true, order });
});

module.exports = router;
