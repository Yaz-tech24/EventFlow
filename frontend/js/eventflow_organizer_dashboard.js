// Role guard — organizer or admin only
(function() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
    window.location.href = 'eventflow_login_register.html';
    return;
  }
  const u = Auth.getUser();
  if (u?.role !== 'organizer' && u?.role !== 'admin') {
    window.location.href = 'eventflow_homepage.html';
  }
})();

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Section navigation
function showSection(id, btn) {
  document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
  document.getElementById('sec-' + id).classList.remove('hidden');
  document.querySelectorAll('.sb-link, .nav-link').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const sb = document.querySelector(`.sb-link[data-section="${id}"]`);
    if (sb) sb.classList.add('active');
  }
  window.scrollTo(0, 0);
}

// ── Data ──────────────────────────────────────────────────────────────

const revenueData = [
  { month: 'Dez', val: 28000 },
  { month: 'Jan', val: 35000 },
  { month: 'Fev', val: 22000 },
  { month: 'Mar', val: 48000 },
  { month: 'Abr', val: 41000 },
  { month: 'Mai', val: 47200 },
];

const activeEvents = [
  { emoji: '🎵', name: 'Festival de Música de Moçambique 2025', date: '12 Jul 2025', sold: 720, cap: 800 },
  { emoji: '🎨', name: 'Arte Urbana — Expo Internacional', date: '5 Jun 2025', sold: 210, cap: 300 },
  { emoji: '🏃', name: 'Maratona da Cidade de Maputo', date: '20 Jun 2025', sold: 580, cap: 1000 },
  { emoji: '💡', name: 'Tech Summit Maputo 2025', date: '18 Out 2025', sold: 150, cap: 500 },
];

const recentOrders = [
  { initials: 'CF', name: 'Carlos Fumo', event: 'Festival de Música', val: 'MT 1.100', time: 'Há 5 min' },
  { initials: 'AS', name: 'Ana Silva', event: 'Arte Urbana Expo', val: 'MT 350', time: 'Há 12 min' },
  { initials: 'MN', name: 'Manuel Nhaca', event: 'Maratona Maputo', val: 'MT 200', time: 'Há 23 min' },
  { initials: 'JM', name: 'Joana Macuácua', event: 'Tech Summit', val: 'MT 750', time: 'Há 1h' },
  { initials: 'RP', name: 'Rui Pereira', event: 'Festival de Música', val: 'MT 890', time: 'Há 2h' },
];

const ticketDist = [
  { name: 'General Pass', pct: 52, color: '#2B86C5' },
  { name: 'VIP Experience', pct: 28, color: '#FF3CAC' },
  { name: 'Daily Pass', pct: 13, color: '#784BA0' },
  { name: 'Family Pack', pct: 7, color: '#00d68f' },
];

const allEvents = [
  { emoji: '🎵', name: 'Festival de Música de Moçambique 2025', date: '12 Jul 2025', loc: 'Praia do Tofo', sold: 720, cap: 800, revenue: 'MT 142K', status: 'ativo', bg: 'linear-gradient(135deg,#1a0a2e,#3d0a2e)' },
  { emoji: '🎨', name: 'Arte Urbana — Expo Internacional', date: '5 Jun 2025', loc: 'Maputo', sold: 210, cap: 300, revenue: 'MT 32K', status: 'ativo', bg: 'linear-gradient(135deg,#0a1a2e,#1a2a4a)' },
  { emoji: '🏃', name: 'Maratona da Cidade de Maputo', date: '20 Jun 2025', loc: 'Maputo', sold: 580, cap: 1000, revenue: 'MT 58K', status: 'ativo', bg: 'linear-gradient(135deg,#0a2e28,#1a4a3a)' },
  { emoji: '💡', name: 'Tech Summit Maputo 2025', date: '18 Out 2025', loc: 'Hotel Polana', sold: 150, cap: 500, revenue: 'MT 52K', status: 'ativo', bg: 'linear-gradient(135deg,#1a2e0a,#2a4a1a)' },
  { emoji: '🎭', name: 'Noite de Teatro Contemporâneo', date: '—', loc: 'Teatro Avenida', sold: 0, cap: 400, revenue: 'MT 0', status: 'rascunho', bg: 'linear-gradient(135deg,#2a0a2e,#1a0a3d)' },
  { emoji: '🎤', name: 'Open Mic Maputo Sessions', date: '—', loc: 'Costa do Sol', sold: 0, cap: 200, revenue: 'MT 0', status: 'rascunho', bg: 'linear-gradient(135deg,#0a2a2e,#0a1a3d)' },
  { emoji: '🎶', name: 'Noite de Jazz 2024', date: '15 Out 2024', loc: 'Costa do Sol', sold: 280, cap: 280, revenue: 'MT 21K', status: 'passado', bg: 'linear-gradient(135deg,#1a0a2e,#3d0a2e)' },
  { emoji: '🌍', name: 'Conferência de Negócios SADC', date: '8 Set 2024', loc: 'Maputo', sold: 420, cap: 450, revenue: 'MT 105K', status: 'passado', bg: 'linear-gradient(135deg,#0a1a0a,#1a2a0a)' },
];

const ticketSales = [
  { buyer: 'Carlos Fumo', event: 'Festival de Música', type: 'VIP Experience', date: '18 Mai 2025', val: 'MT 1.100', status: 'ok' },
  { buyer: 'Ana Silva', event: 'Arte Urbana Expo', type: 'General Pass', date: '17 Mai 2025', val: 'MT 350', status: 'ok' },
  { buyer: 'Manuel Nhaca', event: 'Maratona Maputo', type: 'General Pass', date: '16 Mai 2025', val: 'MT 200', status: 'ok' },
  { buyer: 'Joana Macuácua', event: 'Tech Summit', type: 'VIP Experience', date: '15 Mai 2025', val: 'MT 750', status: 'ok' },
  { buyer: 'Rui Pereira', event: 'Festival de Música', type: 'General Pass', date: '15 Mai 2025', val: 'MT 890', status: 'ok' },
  { buyer: 'Sónia Bila', event: 'Arte Urbana Expo', type: 'Daily Pass', date: '14 Mai 2025', val: 'MT 175', status: 'pend' },
  { buyer: 'David Machava', event: 'Maratona Maputo', type: 'General Pass', date: '13 Mai 2025', val: 'MT 200', status: 'ok' },
];

const revenueByEvent = [
  { name: 'Festival de Música', val: 'MT 142K', pct: 50 },
  { name: 'Conferência SADC', val: 'MT 105K', pct: 37 },
  { name: 'Maratona Maputo', val: 'MT 58K', pct: 20 },
  { name: 'Tech Summit', val: 'MT 52K', pct: 18 },
  { name: 'Arte Urbana Expo', val: 'MT 32K', pct: 11 },
];

const paymentMethods = [
  { icon: '📱', name: 'M-Pesa', count: '1.023 transações', pct: '55%' },
  { icon: '💳', name: 'Cartão de Crédito/Débito', count: '612 transações', pct: '33%' },
  { icon: '🏧', name: 'Referência ATM', count: '212 transações', pct: '12%' },
];

const ageData = [
  { lbl: '18-24', pct: 32 }, { lbl: '25-34', pct: 41 }, { lbl: '35-44', pct: 18 }, { lbl: '45+', pct: 9 },
];

const geoData = [
  { flag: '🏙️', city: 'Maputo', pct: '64%' },
  { flag: '🌆', city: 'Matola', pct: '15%' },
  { flag: '🌇', city: 'Beira', pct: '9%' },
  { flag: '🏘️', city: 'Nampula', pct: '7%' },
  { flag: '🌄', city: 'Outras cidades', pct: '5%' },
];

const channels = [
  { ico: '📲', name: 'Redes Sociais', pct: 45 },
  { ico: '🔗', name: 'EventFlow App', pct: 28 },
  { ico: '🤝', name: 'Indicação', pct: 15 },
  { ico: '🔍', name: 'Pesquisa Google', pct: 12 },
];

const topAttendees = [
  { av: 'CF', name: 'Carlos Fumo', events: '5 eventos', val: 'MT 2.640' },
  { av: 'AS', name: 'Ana Silva', events: '4 eventos', val: 'MT 1.900' },
  { av: 'MN', name: 'Manuel Nhaca', events: '4 eventos', val: 'MT 1.400' },
  { av: 'JM', name: 'Joana Macuácua', events: '3 eventos', val: 'MT 2.150' },
  { av: 'RP', name: 'Rui Pereira', events: '3 eventos', val: 'MT 1.780' },
];

// ── Renders ───────────────────────────────────────────────────────────

function renderRevenueChart() {
  const el = document.getElementById('revenueChart');
  if (!el) return;
  const max = Math.max(...revenueData.map(d => d.val));
  el.innerHTML = revenueData.map(d => {
    const h = Math.round((d.val / max) * 120);
    const label = d.val >= 1000 ? `MT ${Math.round(d.val/1000)}K` : `MT ${d.val}`;
    return `<div class="chart-bar-group">
      <div class="chart-bar" style="height:${h}px" title="${label}">
        <span class="chart-bar-val">${label}</span>
      </div>
      <div class="chart-lbl">${d.month}</div>
    </div>`;
  }).join('');
}

function renderActiveEvents() {
  const el = document.getElementById('activeEventsList');
  if (!el) return;
  el.innerHTML = activeEvents.map(e => {
    const pct = Math.round((e.sold / e.cap) * 100);
    return `<div class="ae-item">
      <div class="ae-emoji">${e.emoji}</div>
      <div class="ae-info">
        <div class="ae-name">${e.name}</div>
        <div class="ae-meta">📅 ${e.date}</div>
      </div>
      <div class="ae-right">
        <div class="ae-sold">${e.sold}/${e.cap}</div>
        <div class="ae-cap">${pct}% cheio</div>
        <div class="ae-prog"><div class="ae-prog-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }).join('');
}

function renderRecentOrders() {
  const el = document.getElementById('recentOrders');
  if (!el) return;
  el.innerHTML = recentOrders.map(o => `
    <div class="ro-item">
      <div class="ro-avatar">${o.initials}</div>
      <div class="ro-info">
        <div class="ro-name">${o.name}</div>
        <div class="ro-event">${o.event}</div>
      </div>
      <div class="ro-right">
        <div class="ro-val">${o.val}</div>
        <div class="ro-time">${o.time}</div>
      </div>
    </div>
  `).join('');
}

function renderTicketDist() {
  const el = document.getElementById('ticketDistribution');
  if (!el) return;
  el.innerHTML = ticketDist.map(t => `
    <div class="td-item">
      <div class="td-header">
        <span class="td-name">${t.name}</span>
        <span class="td-pct">${t.pct}%</span>
      </div>
      <div class="td-bar">
        <div class="td-fill" style="width:${t.pct}%;background:${t.color}"></div>
      </div>
    </div>
  `).join('');
}

function renderEventsGrid(filter = 'todos', query = '') {
  const el = document.getElementById('eventsGrid');
  if (!el) return;
  let data = filter === 'todos' ? allEvents : allEvents.filter(e => e.status === filter);
  if (query) data = data.filter(e => e.name.toLowerCase().includes(query.toLowerCase()));
  if (!data.length) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:rgba(255,255,255,0.25)">Nenhum evento encontrado</div>`;
    return;
  }
  el.innerHTML = data.map(e => {
    const pct = e.cap > 0 ? Math.round((e.sold / e.cap) * 100) : 0;
    const statusLabel = e.status === 'ativo' ? 'Ativo' : e.status === 'rascunho' ? 'Rascunho' : 'Encerrado';
    const editUrl = e.id ? `eventflow_create_event.html?id=${e.id}` : 'eventflow_create_event.html';
    return `<div class="ev-card">
      <div class="ev-banner" style="background:${e.bg}">
        <div class="ev-emoji">${e.emoji}</div>
        <span class="ev-status-badge ${e.status}">${statusLabel}</span>
      </div>
      <div class="ev-body">
        <div class="ev-title">${e.name}</div>
        <div class="ev-meta">
          <span>📅 ${e.date}</span>
          <span>📍 ${e.loc}</span>
        </div>
        <div class="ev-stats">
          <div class="ev-stat"><div class="ev-stat-num">${e.sold}</div><div class="ev-stat-lbl">VENDIDOS</div></div>
          <div class="ev-stat"><div class="ev-stat-num">${e.cap}</div><div class="ev-stat-lbl">CAPACIDADE</div></div>
          <div class="ev-stat"><div class="ev-stat-num">${pct}%</div><div class="ev-stat-lbl">OCUPAÇÃO</div></div>
          <div class="ev-stat"><div class="ev-stat-num" style="color:#00d68f">${e.revenue}</div><div class="ev-stat-lbl">RECEITA</div></div>
        </div>
        <div class="ev-actions">
          <button class="ev-btn primary" onclick="window.location.href='${editUrl}'">✎ Editar</button>
          <button class="ev-btn secondary" onclick="window.location.href='eventflow_event_detail_checkout.html?id=${e.id||''}'">👁 Ver</button>
          <button class="ev-btn danger" onclick="deleteEvent(${e.id||0})">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

let currentFilter = 'todos';
function filterEvents(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.ef-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderEventsGrid(f, document.querySelector('.ef-search')?.value || '');
}
function searchEvents(q) { renderEventsGrid(currentFilter, q); }

function renderTicketsTable() {
  const el = document.getElementById('ticketsTableBody');
  if (!el) return;
  el.innerHTML = ticketSales.map(t => `
    <tr>
      <td><div class="buyer-cell"><div class="buyer-av">${t.buyer.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>${t.buyer}</div></td>
      <td style="color:rgba(255,255,255,0.6)">${t.event}</td>
      <td>${t.type}</td>
      <td style="color:rgba(255,255,255,0.5)">${t.date}</td>
      <td style="font-weight:600;color:#00d68f">${t.val}</td>
      <td><span class="${t.status === 'ok' ? 'status-ok' : 'status-pend'}">${t.status === 'ok' ? '✓ Confirmado' : '⏳ Pendente'}</span></td>
    </tr>
  `).join('');
}

function renderRevenueByEvent() {
  const el = document.getElementById('revenueByEvent');
  if (!el) return;
  el.innerHTML = revenueByEvent.map(r => `
    <div class="rev-item">
      <div class="rev-header">
        <span class="rev-name">${r.name}</span>
        <span class="rev-val">${r.val}</span>
      </div>
      <div class="rev-bar"><div class="rev-fill" style="width:${r.pct}%"></div></div>
    </div>
  `).join('');
}

function renderPaymentMethods() {
  const el = document.getElementById('paymentMethods');
  if (!el) return;
  el.innerHTML = paymentMethods.map(p => `
    <div class="pm-item">
      <div class="pm-icon">${p.icon}</div>
      <div class="pm-info">
        <div class="pm-name">${p.name}</div>
        <div class="pm-count">${p.count}</div>
      </div>
      <div class="pm-pct">${p.pct}</div>
    </div>
  `).join('');
}

function renderAgeChart() {
  const el = document.getElementById('ageChart');
  if (!el) return;
  el.innerHTML = ageData.map(a => `
    <div class="age-item">
      <div class="age-lbl">${a.lbl}</div>
      <div class="age-bar-wrap"><div class="age-bar" style="width:${a.pct}%"></div></div>
      <div class="age-pct">${a.pct}%</div>
    </div>
  `).join('');
}

function renderGeoChart() {
  const el = document.getElementById('geoChart');
  if (!el) return;
  el.innerHTML = geoData.map(g => `
    <div class="geo-item">
      <div class="geo-flag">${g.flag}</div>
      <div class="geo-city">${g.city}</div>
      <div class="geo-pct">${g.pct}</div>
    </div>
  `).join('');
}

function renderChannels() {
  const el = document.getElementById('channelChart');
  if (!el) return;
  el.innerHTML = channels.map(c => `
    <div class="ch-item">
      <div class="ch-ico">${c.ico}</div>
      <div class="ch-name">${c.name}</div>
      <div class="ch-bar-wrap"><div class="ch-fill" style="width:${c.pct}%"></div></div>
      <div class="ch-pct">${c.pct}%</div>
    </div>
  `).join('');
}

function renderTopAttendees() {
  const el = document.getElementById('topAttendees');
  if (!el) return;
  el.innerHTML = topAttendees.map((a, i) => `
    <div class="att-item">
      <div class="att-rank">${i + 1}</div>
      <div class="att-avatar">${a.av}</div>
      <div class="att-info">
        <div class="att-name">${a.name}</div>
        <div class="att-events">${a.events}</div>
      </div>
      <div class="att-val">${a.val}</div>
    </div>
  `).join('');
}

async function deleteEvent(id) {
  if (!id) { showToast('ID do evento inválido'); return; }
  if (!confirm('Tens a certeza que queres eliminar este evento? Esta ação não pode ser desfeita.')) return;
  try {
    await EventsAPI.remove(id);
    showToast('Evento eliminado com sucesso');
    await loadDashboardData();
  } catch (err) {
    showToast('Erro ao eliminar: ' + (err.message || 'tenta novamente'));
  }
}

// ── API Integration ───────────────────────────────────────────────────
async function loadDashboardData() {
  if (typeof OrganizerAPI === 'undefined') return;
  try {
    const [stats, events, tickets, revenue] = await Promise.all([
      OrganizerAPI.stats(),
      OrganizerAPI.events(),
      OrganizerAPI.tickets(),
      OrganizerAPI.revenue(),
    ]);

    // KPI cards
    const kpiNums = document.querySelectorAll('.kpi-num');
    if (kpiNums[0]) kpiNums[0].textContent = stats.total_events || 0;
    if (kpiNums[1]) kpiNums[1].textContent = (stats.total_tickets || 0).toLocaleString('pt');
    if (kpiNums[2]) {
      const rev = stats.total_revenue || 0;
      kpiNums[2].textContent = rev >= 1000 ? `MT ${(rev/1000).toFixed(0)}K` : `MT ${rev}`;
    }
    if (kpiNums[3]) kpiNums[3].textContent = stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : '—';

    // Revenue chart
    if (revenue && revenue.length) {
      revenueData.splice(0, revenueData.length, ...revenue.slice(0, 6).reverse().map(r => ({
        month: r.month ? new Date(r.month + '-01').toLocaleDateString('pt', { month: 'short' }) : '—',
        val: r.revenue || 0,
      })));
      renderRevenueChart();
    }

    // Active events list
    if (events && events.length) {
      const active = events.filter(e => e.status === 'published');
      if (active.length) {
        activeEvents.splice(0, activeEvents.length, ...active.slice(0, 4).map(e => ({
          emoji: e.emoji || '🎪',
          name: e.title,
          date: e.date_start || '—',
          sold: e.total_sold || 0,
          cap: e.total_capacity || 0,
        })));
        renderActiveEvents();
      }

      // Events grid
      allEvents.splice(0, allEvents.length, ...events.map(e => ({
        id: e.id,
        emoji: e.emoji || '🎪',
        name: e.title,
        date: e.date_start || '—',
        loc: e.venue || '—',
        sold: e.total_sold || 0,
        cap: e.total_capacity || 0,
        revenue: `MT ${((e.revenue || 0) / 1000).toFixed(0)}K`,
        status: e.status === 'published' ? 'ativo' : e.status === 'draft' ? 'rascunho' : 'passado',
        bg: e.bg_gradient || 'linear-gradient(135deg,#1a0a2e,#3d0a2e)',
      })));
      renderEventsGrid();

      // Revenue by event
      const byEvent = events.filter(e => (e.revenue || 0) > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      if (byEvent.length) {
        const maxRev = byEvent[0].revenue || 1;
        revenueByEvent.splice(0, revenueByEvent.length, ...byEvent.map(e => ({
          name: e.title,
          val: `MT ${((e.revenue || 0) / 1000).toFixed(0)}K`,
          pct: Math.round((e.revenue || 0) / maxRev * 100),
        })));
        renderRevenueByEvent();
      }
    }

    // Recent orders + tickets table
    if (tickets && tickets.length) {
      recentOrders.splice(0, recentOrders.length, ...tickets.slice(0, 5).map(t => ({
        initials: (t.buyer_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        name: t.buyer_name || '—',
        event: t.event_title || '—',
        val: `MT ${(t.total_price || 0).toLocaleString('pt')}`,
        time: t.created_at ? new Date(t.created_at).toLocaleDateString('pt') : '—',
      })));
      renderRecentOrders();

      ticketSales.splice(0, ticketSales.length, ...tickets.slice(0, 20).map(t => ({
        buyer: t.buyer_name || '—',
        event: t.event_title || '—',
        type: t.ticket_type_name || '—',
        date: t.created_at ? t.created_at.slice(0, 10) : '—',
        val: `MT ${(t.total_price || 0).toLocaleString('pt')}`,
        status: t.payment_status === 'paid' ? 'ok' : 'pend',
      })));
      renderTicketsTable();
    }

    // Sidebar org info
    const sbRating = document.querySelector('.sb-rating');
    if (sbRating && stats.avg_rating !== undefined)
      sbRating.textContent = `⭐ ${stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : '—'} · ${stats.total_events || 0} eventos`;

  } catch (err) {
    console.error('[OrgDash] Erro ao carregar dados:', err);
  }
}

// ── Init ──────────────────────────────────────────────────────────────
renderRevenueChart();
renderActiveEvents();
renderRecentOrders();
renderTicketDist();
renderEventsGrid();
renderTicketsTable();
renderRevenueByEvent();
renderPaymentMethods();
renderAgeChart();
renderGeoChart();
renderChannels();
renderTopAttendees();
showSection('dashboard', null);
loadDashboardData();
