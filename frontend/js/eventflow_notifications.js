// Auth guard
(function() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
    window.location.href = 'eventflow_login_register.html';
  }
})();

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

const allNotifs = [
  {
    id: 1, type: 'bilhetes', unread: true, date: 'Hoje',
    icon: '🎟️', iconBg: 'rgba(255,60,172,0.15)',
    title: 'Bilhete confirmado!',
    text: 'O teu bilhete para <strong>Festival de Música de Moçambique 2025</strong> foi confirmado. Apresenta o QR Code na entrada.',
    time: 'Há 5 minutos',
    actions: [{ label: 'Ver Bilhete', cls: 'primary', fn: "window.location.href='eventflow_profile.html'" }, { label: 'Dispensar', cls: 'ghost', fn: 'dismissNotif(1)' }]
  },
  {
    id: 2, type: 'eventos', unread: true, date: 'Hoje',
    icon: '🔔', iconBg: 'rgba(43,134,197,0.15)',
    title: 'Lembrete: evento amanhã!',
    text: '<strong>Arte Urbana — Expo Internacional</strong> começa amanhã às 10h00 no Centro Cultural Franco-Moçambicano, Maputo.',
    time: 'Há 2 horas',
    actions: [{ label: 'Ver Evento', cls: 'primary', fn: "window.location.href='eventflow_event_detail_checkout.html'" }, { label: 'Dispensar', cls: 'ghost', fn: 'dismissNotif(2)' }]
  },
  {
    id: 3, type: 'eventos', unread: true, date: 'Hoje',
    icon: '🎵', iconBg: 'rgba(120,75,160,0.15)',
    title: 'Novo evento na tua área!',
    text: '<strong>Mozambique Live</strong> acabou de publicar um novo evento: <strong>Open Mic Maputo Sessions</strong> a 15 de Junho.',
    time: 'Há 4 horas',
    actions: [{ label: 'Ver Evento', cls: 'primary', fn: "window.location.href='eventflow_event_detail_checkout.html'" }, { label: 'Seguir Organizador', cls: 'ghost', fn: "showToast('A seguir Mozambique Live!')" }]
  },
  {
    id: 4, type: 'sistema', unread: false, date: 'Ontem',
    icon: '✅', iconBg: 'rgba(0,214,143,0.15)',
    title: 'Pagamento processado',
    text: 'O pagamento de <strong>MT 1.100</strong> via M-Pesa foi processado com sucesso para o Festival de Música.',
    time: 'Ontem, 14:32',
    actions: [{ label: 'Ver Histórico', cls: 'primary', fn: "window.location.href='eventflow_profile.html'" }]
  },
  {
    id: 5, type: 'eventos', unread: false, date: 'Ontem',
    icon: '❤️', iconBg: 'rgba(255,60,172,0.1)',
    title: 'Evento guardado nos favoritos',
    text: 'Adicionaste <strong>Maratona da Cidade de Maputo</strong> aos teus favoritos. Não percas a data: 20 de Junho.',
    time: 'Ontem, 10:15',
    actions: []
  },
  {
    id: 6, type: 'sistema', unread: false, date: 'Esta semana',
    icon: '🔐', iconBg: 'rgba(255,140,0,0.12)',
    title: 'Início de sessão detetado',
    text: 'Foi detetado um novo início de sessão na tua conta a partir de um dispositivo Windows em Maputo.',
    time: 'Há 3 dias',
    actions: [{ label: 'Era eu ✓', cls: 'primary', fn: "showToast('Sessão confirmada')" }, { label: 'Não fui eu!', cls: 'ghost', fn: "window.location.href='eventflow_forgot_password.html'" }]
  },
  {
    id: 7, type: 'sistema', unread: false, date: 'Esta semana',
    icon: '🎉', iconBg: 'rgba(255,60,172,0.1)',
    title: 'Bem-vindo ao EventFlow!',
    text: 'A tua conta foi criada com sucesso. Descobre os melhores eventos de Moçambique e compra os teus bilhetes agora.',
    time: 'Há 4 meses',
    actions: [{ label: 'Explorar Eventos', cls: 'primary', fn: "window.location.href='eventflow_homepage.html'" }]
  },
];

let visibleNotifs = [...allNotifs];
let currentFilter = 'todas';

function renderNotifs() {
  const list = document.getElementById('notifList');
  const filtered = currentFilter === 'todas' ? visibleNotifs
    : visibleNotifs.filter(n => n.type === currentFilter);

  const unread = visibleNotifs.filter(n => n.unread).length;
  document.getElementById('unreadCount').textContent =
    unread > 0 ? `${unread} nova${unread !== 1 ? 's' : ''} notificação${unread !== 1 ? 'ões' : ''}` : 'Tudo lido';

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-notifs">
      <div class="en-icon">🔕</div>
      <div class="en-msg">Sem notificações</div>
      <div class="en-sub">Nenhuma notificação nesta categoria</div>
    </div>`;
    return;
  }

  // Group by date
  const grouped = {};
  filtered.forEach(n => { (grouped[n.date] = grouped[n.date] || []).push(n); });

  list.innerHTML = Object.entries(grouped).map(([date, items]) => `
    <div class="date-divider">${date}</div>
    ${items.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" id="notif-${n.id}" onclick="markRead(${n.id})">
        <div class="notif-icon" style="background:${n.iconBg}">${n.icon}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
          ${n.actions.length ? `<div class="notif-actions">${n.actions.map(a =>
            `<button class="na-btn ${a.cls}" onclick="event.stopPropagation();${a.fn}">${a.label}</button>`
          ).join('')}</div>` : ''}
        </div>
        <button class="notif-dismiss" onclick="event.stopPropagation();dismissNotif(${n.id})" title="Dispensar">✕</button>
      </div>
    `).join('')}
  `).join('');
}

function markRead(id) {
  const n = visibleNotifs.find(n => n.id === id);
  if (n) { n.unread = false; renderNotifs(); }
}

async function markAllRead() {
  try { await NotificationsAPI.markAllRead(); } catch {}
  visibleNotifs.forEach(n => n.unread = false);
  renderNotifs();
  showToast('Todas as notificações marcadas como lidas');
}

async function dismissNotif(id) {
  if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
    try { await NotificationsAPI.remove(id); } catch {}
  }
  visibleNotifs = visibleNotifs.filter(n => n.id !== id);
  renderNotifs();
  showToast('Notificação removida');
}

function clearAll() {
  visibleNotifs = [];
  renderNotifs();
  showToast('Todas as notificações foram removidas');
}

function filterNotifs(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.ft-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNotifs();
}

// ── API Integration ───────────────────────────────────────────────────
async function loadNotificationsFromAPI() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) { renderNotifs(); return; }
  try {
    const { notifications: apiNotifs } = await NotificationsAPI.list();
    if (apiNotifs && apiNotifs.length) {
      visibleNotifs = apiNotifs.map(n => ({
        id: n.id,
        type: n.type || 'sistema',
        unread: !n.read,
        date: new Date(n.created_at).toLocaleDateString('pt-PT') === new Date().toLocaleDateString('pt-PT') ? 'Hoje' : 'Antes',
        icon: n.type === 'bilhetes' ? '🎟️' : n.type === 'eventos' ? '🔔' : '✅',
        iconBg: n.type === 'bilhetes' ? 'rgba(255,60,172,0.15)' : n.type === 'eventos' ? 'rgba(43,134,197,0.15)' : 'rgba(0,214,143,0.15)',
        title: n.title,
        text: n.body || '',
        time: n.created_at?.slice(0, 16).replace('T', ' ') || '',
        actions: [],
        apiId: n.id,
      }));
    }
  } catch {}
  renderNotifs();
}

loadNotificationsFromAPI();
