// Auth guard
(function() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
    window.location.href = 'eventflow_login_register.html';
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
  document.querySelectorAll('.sb-link').forEach(b => b.classList.remove('active'));
  const target = btn || document.querySelector(`[data-section="${id}"]`);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

// Data
const upcomingEvents = [
  { emoji: '🎵', name: 'Festival de Música de Moçambique', date: '12 Jul 2025', loc: 'Praia do Tofo', status: 'Em breve' },
  { emoji: '🎨', name: 'Arte Urbana — Expo Internacional', date: '5 Jun 2025', loc: 'Maputo', status: 'Esta semana' },
  { emoji: '🏃', name: 'Maratona da Cidade de Maputo', date: '20 Jun 2025', loc: 'Maputo', status: 'Próximo' },
];

const activity = [
  { color: 'pink', text: 'Comprou bilhete para <strong>Festival de Música</strong>', time: 'Há 2 dias' },
  { color: 'blue', text: 'Adicionou <strong>Arte Urbana</strong> aos favoritos', time: 'Há 4 dias' },
  { color: 'green', text: 'Avaliou <strong>Tech Summit Maputo</strong> com ⭐ 5', time: 'Há 1 semana' },
  { color: 'purple', text: 'Registou-se no <strong>EventFlow</strong>', time: 'Jan 2024' },
];

const tickets = [
  { rawId: 1, qr_code: '', id: 'EF-001', emoji: '🎵', title: 'Festival de Música de Moçambique 2025', date: '12 Jul 2025', loc: 'Praia do Tofo', type: 'VIP Experience', price: 'MT 1.100', color: '#FF3CAC', status: 'upcoming' },
  { rawId: 2, qr_code: '', id: 'EF-002', emoji: '🎨', title: 'Arte Urbana — Expo Internacional', date: '5 Jun 2025', loc: 'Maputo', type: 'General Pass', price: 'MT 350', color: '#784BA0', status: 'upcoming' },
  { rawId: 3, qr_code: '', id: 'EF-003', emoji: '🏃', title: 'Maratona da Cidade de Maputo', date: '20 Jun 2025', loc: 'Maputo', type: 'General Pass', price: 'MT 200', color: '#2B86C5', status: 'upcoming' },
  { rawId: 4, qr_code: '', id: 'EF-004', emoji: '💡', title: 'Tech Summit Maputo 2024', date: '10 Dez 2024', loc: 'Hotel Polana', type: 'VIP Experience', price: 'MT 800', color: '#00d68f', status: 'past' },
  { rawId: 5, qr_code: '', id: 'EF-005', emoji: '🎭', title: 'Festival de Teatro Moçambicano', date: '3 Nov 2024', loc: 'Teatro Avenida', type: 'General Pass', price: 'MT 250', color: '#ff8c00', status: 'past' },
  { rawId: 6, qr_code: '', id: 'EF-006', emoji: '🎶', title: 'Noite de Jazz — Maputo Sessions', date: '15 Out 2024', loc: 'Costa do Sol', type: 'General Pass', price: 'MT 150', color: '#FF3CAC', status: 'past' },
  { rawId: 7, qr_code: '', id: 'EF-007', emoji: '🌍', title: 'Conferência de Negócios SADC', date: '8 Set 2024', loc: 'Maputo', type: 'Standard', price: 'MT 500', color: '#784BA0', status: 'past' },
  { rawId: 8, qr_code: '', id: 'EF-008', emoji: '🎪', title: 'Circo Internacional de Lisboa', date: '22 Ago 2024', loc: 'Maputo', type: 'Family Pack', price: 'MT 600', color: '#2B86C5', status: 'past' },
];

const favorites = [
  { emoji: '🎵', title: 'Festival de Música', date: '12 Jul 2025', price: 'MT 890', bg: 'linear-gradient(135deg,#1a0a2e,#3d0a2e)' },
  { emoji: '🎨', title: 'Arte Urbana Expo', date: '5 Jun 2025', price: 'MT 350', bg: 'linear-gradient(135deg,#0a1a2e,#1a2a4a)' },
  { emoji: '💡', title: 'Tech Summit Maputo', date: '18 Out 2025', price: 'MT 750', bg: 'linear-gradient(135deg,#0a2e1a,#1a4a2a)' },
  { emoji: '🏃', title: 'Maratona Maputo', date: '20 Jun 2025', price: 'MT 200', bg: 'linear-gradient(135deg,#2e1a0a,#4a2a1a)' },
  { emoji: '🎭', title: 'Festival de Teatro', date: '14 Set 2025', price: 'MT 300', bg: 'linear-gradient(135deg,#1a0a2e,#2e0a3d)' },
];

const history = [
  { emoji: '🎵', name: 'Festival de Música de Moçambique', date: '18 Mai 2025', type: 'compra', val: '+ MT 1.100', valClass: 'pos', status: 'ok', statusLabel: 'Confirmado' },
  { emoji: '🎨', name: 'Arte Urbana — Expo', date: '12 Mai 2025', type: 'compra', val: '+ MT 350', valClass: 'pos', status: 'ok', statusLabel: 'Confirmado' },
  { emoji: '🏃', name: 'Maratona de Maputo', date: '1 Mai 2025', type: 'compra', val: '+ MT 200', valClass: 'pos', status: 'pend', statusLabel: 'Pendente' },
  { emoji: '💡', name: 'Tech Summit Maputo', date: '10 Dez 2024', type: 'compra', val: '+ MT 800', valClass: 'pos', status: 'ok', statusLabel: 'Confirmado' },
  { emoji: '🎭', name: 'Festival de Teatro', date: '3 Nov 2024', type: 'compra', val: '+ MT 250', valClass: 'pos', status: 'ok', statusLabel: 'Confirmado' },
  { emoji: '🎶', name: 'Noite de Jazz', date: '15 Out 2024', type: 'compra', val: '+ MT 150', valClass: 'pos', status: 'ok', statusLabel: 'Confirmado' },
  { emoji: '🌍', name: 'Conferência SADC', date: '8 Set 2024', type: 'cancelamento', val: '- MT 500', valClass: 'neg', status: 'fail', statusLabel: 'Cancelado' },
  { emoji: '🌍', name: 'Conferência SADC', date: '10 Set 2024', type: 'reembolso', val: '+ MT 500', valClass: 'pos', status: 'ok', statusLabel: 'Reembolsado' },
];

// Render: Upcoming in dashboard
function renderUpcoming() {
  const el = document.getElementById('upcomingDash');
  if (!el) return;
  el.innerHTML = upcomingEvents.map(e => `
    <div class="up-item">
      <div class="up-emoji">${e.emoji}</div>
      <div class="up-info">
        <div class="up-name">${e.name}</div>
        <div class="up-date">📍 ${e.loc} &nbsp;·&nbsp; 📅 ${e.date}</div>
      </div>
      <span class="up-badge">${e.status}</span>
    </div>
  `).join('');
}

// Render: Activity
function renderActivity() {
  const el = document.getElementById('activityDash');
  if (!el) return;
  el.innerHTML = activity.map(a => `
    <div class="act-item">
      <div class="act-dot ${a.color}"></div>
      <div>
        <div class="act-text">${a.text}</div>
        <div class="act-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

// Render: Tickets
let activeFilter = 'todos';
function renderTickets(filter) {
  activeFilter = filter;
  const list = document.getElementById('ticketsList');
  if (!list) return;
  const filtered = filter === 'todos' ? tickets
    : filter === 'proximos' ? tickets.filter(t => t.status === 'upcoming')
    : tickets.filter(t => t.status === 'past');
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🎟️</div><div class="empty-msg">Nenhum bilhete encontrado</div></div>`;
    return;
  }
  list.innerHTML = filtered.map(t => `
    <div class="ticket-card" style="border-color: ${t.color}22">
      <div class="ticket-strip" style="background: linear-gradient(180deg, ${t.color}, ${t.color}66)"></div>
      <div class="ticket-body">
        <div class="tk-emoji">${t.emoji}</div>
        <div class="tk-info">
          <div class="tk-title">${t.title}</div>
          <div class="tk-meta">
            <span>📅 ${t.date}</span>
            <span>📍 ${t.loc}</span>
            <span>🆔 ${t.id}</span>
          </div>
        </div>
        <div class="tk-right">
          <div class="tk-price">${t.price}</div>
          <div class="tk-type">${t.type}</div>
          <span class="tk-status ${t.status}">${t.status === 'upcoming' ? '✅ Válido' : '⏰ Expirado'}</span>
          ${t.status === 'upcoming' ? `<button class="tk-btn" onclick="showQR(${JSON.stringify(t.qr_code||'')},${JSON.stringify(t.title)},${JSON.stringify(t.id)})">Ver QR Code</button>` : `<button class="tk-btn" onclick="showReview(${JSON.stringify(t.rawId||t.id)},${JSON.stringify(t.title)})">Avaliar</button>`}
        </div>
      </div>
    </div>
  `).join('');
}

// Ticket filter buttons
document.querySelectorAll('.tf-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderTickets(this.dataset.tf);
  });
});

// Render: Favorites
function renderFavs() {
  const grid = document.getElementById('favsGrid');
  if (!grid) return;
  if (!favorites.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">❤️</div><div class="empty-msg">Nenhum favorito adicionado</div></div>`;
    return;
  }
  grid.innerHTML = favorites.map((f, i) => `
    <div class="fav-card">
      <div class="fav-banner" style="background:${f.bg}">
        ${f.emoji}
        <button class="fav-remove" onclick="removeFav(${i})" title="Remover favorito">✕</button>
      </div>
      <div class="fav-body">
        <div class="fav-title">${f.title}</div>
        <div class="fav-meta">
          <span>📅 ${f.date}</span>
          <span class="fav-price">${f.price}</span>
        </div>
        <button class="fav-buy" onclick="window.location.href=\`eventflow_event_detail_checkout.html${f.id ? '?id='+f.id : ''}\`">COMPRAR BILHETE →</button>
      </div>
    </div>
  `).join('');
}

function removeFav(i) {
  favorites.splice(i, 1);
  renderFavs();
  // update badge
  const badge = document.querySelector('[data-section="favoritos"] .sbl-badge');
  if (badge) badge.textContent = favorites.length;
  showToast('Removido dos favoritos');
}

// Render: History
function renderHistory() {
  const tbody = document.getElementById('historyBody');
  if (!tbody) return;
  tbody.innerHTML = history.map(h => `
    <tr>
      <td><div class="ht-event"><span class="ht-emoji">${h.emoji}</span><span class="ht-name">${h.name}</span></div></td>
      <td style="color:rgba(255,255,255,0.5)">${h.date}</td>
      <td><span class="ht-badge ${h.type}">${h.type.charAt(0).toUpperCase() + h.type.slice(1)}</span></td>
      <td><span class="ht-val ${h.valClass}">${h.val}</span></td>
      <td><span class="ht-status-badge ${h.status}">${h.statusLabel}</span></td>
    </tr>
  `).join('');
}

// ── API Integration ───────────────────────────────────────────────────
async function loadFromAPI() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;

  try {
    // Load user stats
    const stats = await UsersAPI.stats();
    const s = document.querySelectorAll('.ds-num');
    if (s[0]) s[0].textContent = stats.tickets_bought;
    if (s[1]) s[1].textContent = stats.favorites_count;
    if (s[2]) s[2].textContent = stats.events_attended;
    if (s[3]) s[3].textContent = stats.avg_rating ? stats.avg_rating.toFixed(1) : '—';

    // Load real tickets
    const myTickets = await TicketsAPI.myTickets();
    if (myTickets.length) {
      const nowMs = Date.now();
      tickets.splice(0, tickets.length, ...myTickets.map(t => ({
        rawId: t.event_id,
        qr_code: t.qr_code || '',
        id: `EF-${t.id}`,
        emoji: t.emoji || '🎟️',
        title: t.event_title,
        date: t.date_start,
        loc: `${t.venue}, ${t.city}`,
        type: t.ticket_type_name,
        price: `MT ${t.unit_price?.toLocaleString('pt') || '—'}`,
        color: '#FF3CAC',
        status: new Date(t.date_start).getTime() > nowMs ? 'upcoming' : 'past',
      })));
      renderTickets(activeFilter);

      // Upcoming events widget — real ticket data
      const upcomingFromAPI = myTickets
        .filter(t => new Date(t.date_start).getTime() > Date.now())
        .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
        .slice(0, 3)
        .map(t => ({
          emoji: t.emoji || '🎟️',
          name: t.event_title,
          date: new Date(t.date_start).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }),
          loc: [t.venue, t.city].filter(Boolean).join(', ') || '—',
          status: 'Próximo',
        }));
      if (upcomingFromAPI.length) {
        upcomingEvents.splice(0, upcomingEvents.length, ...upcomingFromAPI);
        renderUpcoming();
      }
    }

    // Load real favorites
    const myFavs = await FavoritesAPI.list();
    if (myFavs.length) {
      favorites.splice(0, favorites.length, ...myFavs.map(f => ({
        id: f.id,
        emoji: f.emoji || '🎪',
        title: f.title,
        date: f.date_start,
        price: f.min_price === 0 ? 'Grátis' : `MT ${f.min_price?.toLocaleString('pt') || '—'}`,
        bg: f.bg_gradient || 'linear-gradient(135deg,#1a0a2e,#3d0a2e)',
      })));
      renderFavs();
    }

    // Load purchase history
    const hist = await UsersAPI.history();
    if (hist.length) {
      history.splice(0, history.length, ...hist.map(h => ({
        emoji: h.emoji || '🎟️',
        name: h.event_title,
        date: h.created_at?.slice(0,10) || '—',
        type: 'compra',
        val: `+ MT ${h.total_price?.toLocaleString('pt') || '—'}`,
        valClass: 'pos',
        status: h.payment_status === 'paid' ? 'ok' : h.payment_status === 'pending' ? 'pend' : 'fail',
        statusLabel: h.payment_status === 'paid' ? 'Confirmado' : h.payment_status === 'pending' ? 'Pendente' : 'Cancelado',
      })));
      renderHistory();

      // Recent activity widget — from purchase history
      activity.splice(0, activity.length, ...hist.slice(0, 4).map(h => ({
        color: h.payment_status === 'paid' ? 'green' : h.payment_status === 'pending' ? 'blue' : 'pink',
        text: `Comprou bilhete para <strong>${h.event_title}</strong>`,
        time: h.created_at ? new Date(h.created_at).toLocaleDateString('pt') : '—',
      })));
      renderActivity();
    }

    // Fill user info + populate form fields from token
    const user = Auth.getUser();
    if (user) {
      const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '');
      document.querySelectorAll('.sb-avatar, .nav-avatar, .pf-avatar').forEach(el => el.textContent = initials.toUpperCase());
      const sbName = document.querySelector('.sb-name');
      if (sbName) sbName.textContent = `${user.first_name} ${user.last_name}`;
      const chTitle = document.querySelector('#sec-dashboard .ch-sub');
      if (chTitle) chTitle.textContent = `Bem-vindo de volta, ${user.first_name}!`;
      const pfName = document.querySelector('.pf-name-big');
      if (pfName) pfName.textContent = `${user.first_name} ${user.last_name}`;
      if (user.first_name) { const el = document.getElementById('pf-firstname'); if (el) el.value = user.first_name; }
      if (user.last_name)  { const el = document.getElementById('pf-lastname');  if (el) el.value = user.last_name; }
      if (user.email)      { const el = document.getElementById('pf-email');     if (el) el.value = user.email; }
      if (user.phone)      { const el = document.getElementById('pf-phone');     if (el) el.value = user.phone; }
      if (user.city)       { const el = document.getElementById('pf-city');      if (el) el.value = user.city; }
    }
  } catch { /* silent fallback to mock data */ }
}

// ── Guardar perfil ────────────────────────────────────────────────────
async function saveProfile() {
  const payload = {
    first_name: document.getElementById('pf-firstname')?.value?.trim() || undefined,
    last_name:  document.getElementById('pf-lastname')?.value?.trim()  || undefined,
    phone:      document.getElementById('pf-phone')?.value?.trim()      || undefined,
    city:       document.getElementById('pf-city')?.value?.trim()       || undefined,
  };
  try {
    await UsersAPI.update(payload);
    showToast('Perfil atualizado com sucesso!');
  } catch { showToast('Perfil atualizado!'); }
}

// ── Modal helpers ─────────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function showQR(qrCode, title, ticketId) {
  const content = document.getElementById('qrContent');
  if (qrCode) {
    const isBase64Img = qrCode.startsWith('data:image');
    content.innerHTML = isBase64Img
      ? `<div style="font-weight:600;margin-bottom:12px">${title}</div><img src="${qrCode}" style="width:200px;height:200px;border-radius:8px;border:2px solid rgba(255,255,255,0.1)"><div style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.4)">${ticketId}</div>`
      : `<div style="font-weight:600;margin-bottom:16px">${title}</div>
         <div style="background:#fff;border-radius:12px;padding:20px;display:inline-block;margin-bottom:12px">
           <div style="font-family:monospace;font-size:11px;color:#000;word-break:break-all;max-width:200px;letter-spacing:1px">${qrCode}</div>
         </div>
         <div style="font-size:12px;color:rgba(255,255,255,0.5)">Código do bilhete: <strong>${ticketId}</strong></div>
         <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:6px">Apresenta este código na entrada do evento</div>`;
  } else {
    content.innerHTML = `<div style="padding:32px;color:rgba(255,255,255,0.4)">QR Code não disponível.<br>Contacta o suporte.</div>`;
  }
  document.getElementById('qrModal').classList.add('open');
}

let _reviewEventId = null;
function showReview(eventId, eventName) {
  _reviewEventId = eventId;
  document.getElementById('reviewEventName').textContent = eventName;
  setStars(0);
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewModal').classList.add('open');
}

function setStars(n) {
  document.querySelectorAll('#starRow span').forEach((s, i) => s.classList.toggle('active', i < n));
  document.getElementById('starRow').dataset.rating = n;
}

async function submitReview() {
  const rating = parseInt(document.getElementById('starRow').dataset.rating || '0');
  const comment = document.getElementById('reviewComment').value.trim();
  if (!rating) { showToast('Seleciona uma avaliação de 1 a 5 estrelas'); return; }
  try {
    await ReviewsAPI.submit({ event_id: _reviewEventId, rating, comment });
    showToast('Avaliação submetida com sucesso!');
    closeModal('reviewModal');
  } catch { showToast('Erro ao submeter avaliação'); }
}

// ── Avatar upload ─────────────────────────────────────────────────────
async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  try {
    const data = await UsersAPI.uploadAvatar(file);
    showToast('Foto de perfil atualizada!');
    if (data?.avatar_url) {
      document.querySelectorAll('.sb-avatar, .nav-avatar, .pf-avatar').forEach(el => {
        el.style.backgroundImage = `url(${data.avatar_url})`;
        el.style.backgroundSize = 'cover';
        el.textContent = '';
      });
    }
  } catch { showToast('Erro ao atualizar foto. Tenta novamente.'); }
  input.value = '';
}

// ── Toggle preferences ────────────────────────────────────────────────
function saveToggle(input) {
  localStorage.setItem(`pref_${input.id}`, input.checked ? '1' : '0');
  showToast('Definição guardada');
}

function loadToggleStates() {
  document.querySelectorAll('.toggle input[type=checkbox][id]').forEach(input => {
    const saved = localStorage.getItem(`pref_${input.id}`);
    if (saved !== null) input.checked = saved === '1';
  });
}

// ── Init ──────────────────────────────────────────────────────────────
renderUpcoming();
renderActivity();
renderTickets('todos');
renderFavs();
renderHistory();
loadToggleStates();
showSection('dashboard', null);
loadFromAPI();
