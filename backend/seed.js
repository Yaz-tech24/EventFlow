/**
 * EventFlow â€” Seed de Dados de DemonstraÃ§Ã£o
 * node seed.js
 */
const bcrypt = require('bcryptjs');
const db     = require('./config/database');

console.log('ðŸŒ± A popular a base de dados com dados de demonstraÃ§Ã£o...\n');

// Clear existing data
db.exec(`
  DELETE FROM notifications; DELETE FROM favorites; DELETE FROM reviews;
  DELETE FROM orders; DELETE FROM ticket_types; DELETE FROM events;
  DELETE FROM organizers; DELETE FROM users;
  DELETE FROM sqlite_sequence;
`);

// â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const hash = (p) => bcrypt.hashSync(p, 10);

const insertUser = db.prepare(`
  INSERT INTO users (first_name,last_name,email,password_hash,role,phone,city,birth_date)
  VALUES (?,?,?,?,?,?,?,?)
`);

const users = [
  { id: 1,  fn:'Admin',   ln:'EventFlow',  email:'admin@eventflow.co.mz',       pw:'admin123',   role:'admin',     phone:'+258 21 000 001', city:'Maputo',    bd:'1985-01-01' },
  { id: 2,  fn:'Carlos',  ln:'Fumo',       email:'carlos.fumo@email.com',        pw:'user123',    role:'user',      phone:'+258 84 123 4567',city:'Maputo',    bd:'1995-03-15' },
  { id: 3,  fn:'Ana',     ln:'Silva',      email:'ana.silva@email.com',          pw:'user123',    role:'user',      phone:'+258 82 234 5678',city:'Matola',    bd:'1998-07-22' },
  { id: 4,  fn:'Manuel',  ln:'Nhaca',      email:'manuel.nhaca@email.com',       pw:'user123',    role:'user',      phone:'+258 86 345 6789',city:'Beira',     bd:'1992-11-08' },
  { id: 5,  fn:'Mozambique',ln:'Live',     email:'info@mozambiquelive.co.mz',    pw:'org123',     role:'organizer', phone:'+258 21 300 000', city:'Maputo',    bd:'1990-01-01' },
  { id: 6,  fn:'TechHub', ln:'Maputo',     email:'info@techhub.co.mz',           pw:'org123',     role:'organizer', phone:'+258 21 400 000', city:'Maputo',    bd:'1990-01-01' },
  { id: 7,  fn:'Arte',    ln:'Viva',       email:'info@arteviva.co.mz',          pw:'org123',     role:'organizer', phone:'+258 21 500 000', city:'Maputo',    bd:'1990-01-01' },
  { id: 8,  fn:'Joana',   ln:'Macuácua',   email:'joana.macuacua@email.com',     pw:'user123',    role:'user',      phone:'+258 84 456 7890',city:'Maputo',    bd:'2000-05-12' },
];

users.forEach(u => insertUser.run(u.fn, u.ln, u.email, hash(u.pw), u.role, u.phone, u.city, u.bd));
console.log(`âœ… ${users.length} utilizadores criados`);

// â”€â”€ Organizers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertOrg = db.prepare(`
  INSERT INTO organizers (user_id,org_name,description,category,website,verified)
  VALUES (?,?,?,?,?,?)
`);

const orgs = [
  { uid:5, name:'Mozambique Live', desc:'A principal produtora de eventos musicais de MoÃ§ambique.', cat:'musica', web:'mozambiquelive.co.mz', verified:1 },
  { uid:6, name:'TechHub Maputo',  desc:'Os maiores eventos de tecnologia e inovaÃ§Ã£o do paÃ­s.',      cat:'tech',   web:'techhub.co.mz',         verified:1 },
  { uid:7, name:'Arte Viva',       desc:'ExposiÃ§Ãµes e instalaÃ§Ãµes artÃ­sticas por todo MoÃ§ambique.',  cat:'arte',   web:'arteviva.co.mz',         verified:1 },
];

orgs.forEach(o => insertOrg.run(o.uid, o.name, o.desc, o.cat, o.web, o.verified?1:0));
console.log(`âœ… ${orgs.length} organizadores criados`);

// â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertEvent = db.prepare(`
  INSERT INTO events (organizer_id,title,description,category,emoji,date_start,time_start,
    venue,address,city,capacity,status,bg_gradient,tags,image_url)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

const events = [
  { org:1, title:'Festival de MÃºsica de MoÃ§ambique 2025', desc:'O maior festival musical do paÃ­s com artistas nacionais e internacionais.', cat:'musica', emoji:'ðŸŽµ', date:'2025-07-12', time:'20:00', venue:'Praia do Tofo', addr:'Praia do Tofo, Inhambane', city:'Inhambane', cap:1000, status:'published', bg:'linear-gradient(135deg,#1a0a2e,#3d0a2e)', tags:'["festival","mÃºsica","ao ar livre"]' },
  { org:2, title:'Tech Summit MoÃ§ambique 2025', desc:'A conferÃªncia de tecnologia e inovaÃ§Ã£o mais importante de MoÃ§ambique.', cat:'tech', emoji:'ðŸ’¡', date:'2025-11-10', time:'09:00', venue:'Hotel Polana', addr:'Avenida Julius Nyerere, Maputo', city:'Maputo', cap:500, status:'published', bg:'linear-gradient(135deg,#0d1a0d,#1a3d0a)', tags:'["tecnologia","inovaÃ§Ã£o","networking"]' },
  { org:3, title:'Arte Urbana â€” Expo Internacional', desc:'ExposiÃ§Ã£o de arte urbana com artistas de todo o mundo.', cat:'arte', emoji:'ðŸŽ¨', date:'2025-06-05', time:'10:00', venue:'Centro Cultural Franco-MoÃ§ambicano', addr:'Av. Julius Nyerere 717, Maputo', city:'Maputo', cap:300, status:'published', bg:'linear-gradient(135deg,#0a1a2e,#0a2e3d)', tags:'["arte","exposiÃ§Ã£o","cultura"]' },
  { org:1, title:'Noite de Jazz â€” Maputo Sessions', desc:'Uma noite mÃ¡gica de jazz ao pÃ´r do sol no Costa do Sol.', cat:'musica', emoji:'ðŸŽ¶', date:'2025-06-03', time:'19:30', venue:'Costa do Sol', addr:'Marginal de Maputo, Costa do Sol', city:'Maputo', cap:200, status:'published', bg:'linear-gradient(135deg,#0a0a1a,#1a0a2e)', tags:'["jazz","mÃºsica","noite"]' },
  { org:2, title:'Workshop de ProgramaÃ§Ã£o Web â€” 5 dias', desc:'Aprende HTML, CSS e JavaScript com mentores experientes.', cat:'tech', emoji:'ðŸŽ“', date:'2025-07-07', time:'08:30', venue:'TechHub Maputo', addr:'Av. 25 de Setembro, Maputo', city:'Maputo', cap:30, status:'published', bg:'linear-gradient(135deg,#0a0a2e,#0a1a3d)', tags:'["programaÃ§Ã£o","web","workshop"]' },
  { org:3, title:'Festival de Gastronomia de MoÃ§ambique', desc:'Celebra a riqueza culinÃ¡ria moÃ§ambicana com chefs de todo o paÃ­s.', cat:'gastronomia', emoji:'ðŸ½ï¸', date:'2025-09-20', time:'11:00', venue:'PraÃ§a da IndependÃªncia', addr:'PraÃ§a da IndependÃªncia, Maputo', city:'Maputo', cap:2000, status:'published', bg:'linear-gradient(135deg,#2e1a0a,#3d2a0a)', tags:'["gastronomia","cultura","famÃ­lia"]' },
  { org:1, title:'Maratona da Cidade de Maputo 2025', desc:'Corre pelas ruas de Maputo num percurso Ãºnico de 42km.', cat:'desporto', emoji:'ðŸƒ', date:'2025-06-20', time:'06:00', venue:'PraÃ§a da IndependÃªncia', addr:'PraÃ§a da IndependÃªncia, Maputo', city:'Maputo', cap:5000, status:'published', bg:'linear-gradient(135deg,#0a2e1a,#0a1a2e)', tags:'["desporto","corrida","saÃºde"]' },
  { org:2, title:'ConferÃªncia de NegÃ³cios SADC 2025', desc:'LÃ­deres empresariais de toda a regiÃ£o SADC reunidos em Maputo.', cat:'negocios', emoji:'ðŸ’¼', date:'2025-10-18', time:'09:00', venue:'Hotel Radisson Blu', addr:'Av. da Marginal, Maputo', city:'Maputo', cap:400, status:'published', bg:'linear-gradient(135deg,#0a1a2e,#1a2a0a)', tags:'["negÃ³cios","SADC","networking"]' },
  { org:1, title:'Open Mic Maputo Sessions',  desc:'Noite de talentos locais â€” mÃºsica, poesia e comÃ©dia stand-up.', cat:'musica', emoji:'ðŸŽ¤', date:'2025-08-15', time:'21:00', venue:'CafÃ© AcÃ¡cio',  addr:'Baixa de Maputo', city:'Maputo', cap:100, status:'pending', bg:'linear-gradient(135deg,#0a2e2e,#0a1a3d)', tags:'["open mic","talentos","ao vivo"]' },
];

events.forEach(e => insertEvent.run(e.org, e.title, e.desc, e.cat, e.emoji, e.date, e.time, e.venue, e.addr, e.city, e.cap, e.status, e.bg, e.tags, e.img || null));
console.log(`âœ… ${events.length} eventos criados`);

// â”€â”€ Ticket Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Set image_url for each seeded event (inserted in order, IDs 1-9)
const setImg = db.prepare('UPDATE events SET image_url=? WHERE id=?');
const eventImages = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80', // Festival Musica
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', // Tech Summit
  'https://images.unsplash.com/photo-1578926288207-32e0b1c9b2a8?auto=format&fit=crop&w=800&q=80', // Arte Urbana
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=800&q=80', // Jazz
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', // Workshop
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', // Gastronomia
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80', // Maratona
  'https://images.unsplash.com/photo-1560439513-74b037a25d84?auto=format&fit=crop&w=800&q=80', // Conferencia Negocios
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80', // Open Mic
];
eventImages.forEach((url, i) => setImg.run(url, i + 1));

const insertTT = db.prepare('INSERT INTO ticket_types (event_id,name,description,price,quantity,sold) VALUES (?,?,?,?,?,?)');

const ticketTypes = [
  // Festival de MÃºsica (id=1)
  { eid:1, name:'Passe Geral',     desc:'Acesso a todos os palcos',      price:890,  qty:700, sold:580 },
  { eid:1, name:'VIP Experience',  desc:'Ãrea VIP + Meet & Greet',       price:1800, qty:200, sold:140 },
  { eid:1, name:'Passe DiÃ¡rio',    desc:'Acesso apenas num dia',          price:450,  qty:300, sold:210 },
  // Tech Summit (id=2)
  { eid:2, name:'Standard',        desc:'Acesso a todas as sessÃµes',     price:2990, qty:400, sold:150 },
  { eid:2, name:'VIP',             desc:'SessÃµes VIP + networking dinner',price:5500, qty:100, sold:42  },
  // Arte Urbana (id=3)
  { eid:3, name:'Entrada Geral',   desc:'Acesso Ã  exposiÃ§Ã£o',            price:350,  qty:250, sold:210 },
  { eid:3, name:'Visita Guiada',   desc:'Inclui tour guiado',            price:600,  qty:50,  sold:38  },
  // Jazz (id=4)
  { eid:4, name:'Entrada',         desc:'Acesso ao concerto',            price:150,  qty:180, sold:95  },
  { eid:4, name:'Mesa VIP',        desc:'Mesa privada para 4 pessoas',   price:800,  qty:20,  sold:12  },
  // Workshop (id=5)
  { eid:5, name:'Participante',    desc:'5 dias de workshop + materiais',price:1200, qty:30,  sold:22  },
  // Gastronomia (id=6)
  { eid:6, name:'Entrada Livre',   desc:'Acesso gratuito',               price:0,    qty:2000,sold:850 },
  { eid:6, name:'Mesa Reservada',  desc:'Mesa privada com menu completo',price:1500, qty:100, sold:67  },
  // Maratona (id=7)
  { eid:7, name:'42km Completo',   desc:'Maratona completa',             price:200,  qty:3000,sold:580 },
  { eid:7, name:'21km â€” Meia',     desc:'Meia maratona',                 price:150,  qty:2000,sold:420 },
  // ConferÃªncia (id=8)
  { eid:8, name:'Delegado',        desc:'Acesso a todas as sessÃµes',     price:1500, qty:350, sold:150 },
  { eid:8, name:'Delegado VIP',    desc:'IncluÃ­ jantar de gala',         price:3500, qty:50,  sold:18  },
  // Open Mic (id=9)
  { eid:9, name:'Entrada',         desc:'Acesso ao evento',              price:100,  qty:100, sold:0   },
];

ticketTypes.forEach(t => insertTT.run(t.eid, t.name, t.desc, t.price, t.qty, t.sold));
console.log(`âœ… ${ticketTypes.length} tipos de bilhete criados`);

// â”€â”€ Orders (sample purchases) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertOrder = db.prepare(`
  INSERT INTO orders (user_id,event_id,ticket_type_id,quantity,unit_price,service_fee,
    total_price,payment_method,payment_status,qr_code,buyer_name,buyer_email)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
`);

const { v4: uuidv4 } = require('uuid');
const orders = [
  { uid:2, eid:1, ttid:1, qty:2, price:890,  fee:25, total:1805, method:'mpesa', status:'paid', name:'Carlos Fumo',    email:'carlos.fumo@email.com' },
  { uid:2, eid:4, ttid:8, qty:1, price:150,  fee:25, total:175,  method:'mpesa', status:'paid', name:'Carlos Fumo',    email:'carlos.fumo@email.com' },
  { uid:2, eid:7, ttid:13,qty:1, price:200,  fee:25, total:225,  method:'mpesa', status:'paid', name:'Carlos Fumo',    email:'carlos.fumo@email.com' },
  { uid:3, eid:1, ttid:2, qty:1, price:1800, fee:25, total:1825, method:'card',  status:'paid', name:'Ana Silva',      email:'ana.silva@email.com' },
  { uid:3, eid:3, ttid:6, qty:2, price:350,  fee:25, total:725,  method:'mpesa', status:'paid', name:'Ana Silva',      email:'ana.silva@email.com' },
  { uid:4, eid:7, ttid:14,qty:1, price:150,  fee:25, total:175,  method:'atm',   status:'paid', name:'Manuel Nhaca',   email:'manuel.nhaca@email.com' },
  { uid:8, eid:2, ttid:4, qty:1, price:2990, fee:25, total:3015, method:'card',  status:'paid', name:'Joana Macuácua', email:'joana.macuacua@email.com' },
];

orders.forEach(o => insertOrder.run(o.uid,o.eid,o.ttid,o.qty,o.price,o.fee,o.total,o.method,o.status,uuidv4(),o.name,o.email));
console.log(`âœ… ${orders.length} ordens criadas`);

// â”€â”€ Reviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertReview = db.prepare('INSERT INTO reviews (user_id,event_id,rating,comment) VALUES (?,?,?,?)');
[
  { uid:2, eid:4, rating:5, comment:'Noite incrível! Jazz de altíssima qualidade.' },
  { uid:2, eid:7, rating:4, comment:'Maratona muito bem organizada. Parabéns!' },
  { uid:3, eid:3, rating:5, comment:'Exposição deslumbrante. Arte de nível internacional!' },
  { uid:4, eid:7, rating:5, comment:'Melhor experiência desportiva de sempre!' },
].forEach(r => insertReview.run(r.uid, r.eid, r.rating, r.comment));
console.log('âœ… 4 avaliaÃ§Ãµes criadas');

// â”€â”€ Favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertFav = db.prepare('INSERT INTO favorites (user_id,event_id) VALUES (?,?)');
[[2,1],[2,2],[2,6],[3,1],[3,4],[3,6],[8,2],[8,3]].forEach(([u,e]) => insertFav.run(u,e));
console.log('âœ… Favoritos criados');

// â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertNotif = db.prepare('INSERT INTO notifications (user_id,type,title,body,read) VALUES (?,?,?,?,?)');
[
  { uid:2, type:'bilhetes', title:'Bilhete confirmado! ðŸŽŸï¸', body:'O teu bilhete para o Festival de MÃºsica foi confirmado.', read:0 },
  { uid:2, type:'eventos',  title:'Lembrete: evento amanhÃ£! ðŸ””', body:'A Maratona de Maputo comeÃ§a amanhÃ£ Ã s 06:00.', read:0 },
  { uid:2, type:'sistema',  title:'Bem-vindo ao EventFlow! ðŸŽ‰', body:'A tua conta foi criada com sucesso.', read:1 },
  { uid:3, type:'bilhetes', title:'Bilhete confirmado! ðŸŽŸï¸', body:'O teu bilhete VIP para o Festival foi confirmado.', read:0 },
  { uid:5, type:'sistema',  title:'âœ… Evento aprovado!', body:'O teu evento "Festival de MÃºsica" foi aprovado e estÃ¡ publicado.', read:1 },
].forEach(n => insertNotif.run(n.uid, n.type, n.title, n.body, n.read));
console.log('âœ… NotificaÃ§Ãµes criadas');

console.log('\nðŸŽ‰ Seed concluÃ­do com sucesso!\n');
console.log('Contas de demonstraÃ§Ã£o:');
console.log('  ðŸ‘‘ Admin:      admin@eventflow.co.mz      / admin123');
console.log('  ðŸŽŸï¸  Utilizador: carlos.fumo@email.com      / user123');
console.log('  ðŸŽª  Organizador: info@mozambiquelive.co.mz  / org123\n');
