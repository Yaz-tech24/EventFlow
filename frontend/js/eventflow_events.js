// ── Toast ─────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Data — 16 events ─────────────────────────────────────────────────
const allEvents = [
  { id:1,  emoji:'🎵', cat:'musica',       catLabel:'Música',       title:'Festival de Música de Moçambique 2025',   date:'12 Jul 2025', dateMs: new Date('2025-07-12').getTime(), loc:'Praia do Tofo',  city:'Inhambane', price:890,  spots:240, bg:'linear-gradient(135deg,#1a0a2e,#3d0a2e)', badge:'Quente',   badgeC:'#FF3CAC', faved:false },
  { id:2,  emoji:'🎨', cat:'arte',         catLabel:'Arte',         title:'Arte Urbana — Expo Internacional',         date:'5 Jun 2025',  dateMs: new Date('2025-06-05').getTime(), loc:'Maputo',         city:'Maputo',    price:350,  spots:80,  bg:'linear-gradient(135deg,#0a1a2e,#0a2e3d)', badge:'Novo',     badgeC:'#2B86C5', faved:false },
  { id:3,  emoji:'💡', cat:'tech',         catLabel:'Tecnologia',   title:'Tech Summit Moçambique 2025',              date:'10 Nov 2025', dateMs: new Date('2025-11-10').getTime(), loc:'Hotel Polana',   city:'Maputo',    price:2990, spots:12,  bg:'linear-gradient(135deg,#0d1a0d,#1a3d0a)', badge:'Limitado', badgeC:'#FF8C00', faved:true  },
  { id:4,  emoji:'🍽️', cat:'gastronomia', catLabel:'Gastronomia',  title:'Festival de Gastronomia de Moçambique',   date:'20 Set 2025', dateMs: new Date('2025-09-20').getTime(), loc:'Beira',          city:'Beira',     price:0,    spots:500, bg:'linear-gradient(135deg,#2e1a0a,#3d2a0a)', badge:'Grátis',  badgeC:'#00c864', faved:false },
  { id:5,  emoji:'🎭', cat:'teatro',       catLabel:'Teatro',       title:'Festival de Teatro Moçambicano',           date:'15 Ago 2025', dateMs: new Date('2025-08-15').getTime(), loc:'Teatro Avenida', city:'Maputo',    price:300,  spots:45,  bg:'linear-gradient(135deg,#2e0a2e,#1a0a3d)', badge:'',        badgeC:'',        faved:false },
  { id:6,  emoji:'🏃', cat:'desporto',     catLabel:'Desporto',     title:'Maratona da Cidade de Maputo 2025',        date:'20 Jun 2025', dateMs: new Date('2025-06-20').getTime(), loc:'Maputo',         city:'Maputo',    price:200,  spots:300, bg:'linear-gradient(135deg,#0a2e1a,#0a1a2e)', badge:'Popular', badgeC:'#784BA0', faved:false },
  { id:7,  emoji:'🛠️', cat:'workshops',   catLabel:'Workshop',     title:'Workshop de Fotografia Urbana',            date:'8 Jun 2025',  dateMs: new Date('2025-06-08').getTime(), loc:'Beira',          city:'Beira',     price:450,  spots:18,  bg:'linear-gradient(135deg,#1a1a0a,#2e2a0a)', badge:'',        badgeC:'',        faved:false },
  { id:8,  emoji:'🎬', cat:'cinema',       catLabel:'Cinema',       title:'Mostra de Cinema Africano 2025',           date:'2 Jul 2025',  dateMs: new Date('2025-07-02').getTime(), loc:'Nampula',        city:'Nampula',   price:100,  spots:120, bg:'linear-gradient(135deg,#0a0a2e,#2e0a0a)', badge:'',        badgeC:'',        faved:false },
  { id:9,  emoji:'💼', cat:'negocios',     catLabel:'Negócios',     title:'Conferência de Negócios SADC 2025',        date:'18 Out 2025', dateMs: new Date('2025-10-18').getTime(), loc:'Hotel Polana',   city:'Maputo',    price:1500, spots:200, bg:'linear-gradient(135deg,#0a1a2e,#1a2a0a)', badge:'Destaque', badgeC:'#784BA0', faved:false },
  { id:10, emoji:'🎤', cat:'musica',       catLabel:'Música',       title:'Noite de Jazz — Costa do Sol Sessions',   date:'3 Jun 2025',  dateMs: new Date('2025-06-03').getTime(), loc:'Costa do Sol',   city:'Maputo',    price:150,  spots:180, bg:'linear-gradient(135deg,#0a0a1a,#1a0a2e)', badge:'',        badgeC:'',        faved:false },
  { id:11, emoji:'🌍', cat:'negocios',     catLabel:'Negócios',     title:'Fórum de Empreendedorismo Jovem MZ',       date:'25 Jul 2025', dateMs: new Date('2025-07-25').getTime(), loc:'Matola',         city:'Matola',    price:0,    spots:400, bg:'linear-gradient(135deg,#0a2e0a,#2e2a0a)', badge:'Grátis',  badgeC:'#00c864', faved:false },
  { id:12, emoji:'🎶', cat:'musica_gospel',catLabel:'Gospel',        title:'Celebração Gospel — Maputo Praise Fest',  date:'14 Set 2025', dateMs: new Date('2025-09-14').getTime(), loc:'Praça da Indep.',city:'Maputo',    price:0,    spots:2000,bg:'linear-gradient(135deg,#1a0a0a,#2e1a0a)', badge:'Grátis',  badgeC:'#00c864', faved:false },
  { id:13, emoji:'🏄', cat:'desporto',     catLabel:'Desporto',     title:'Torneio de Surf — Tofo Pro 2025',         date:'10 Ago 2025', dateMs: new Date('2025-08-10').getTime(), loc:'Praia do Tofo',  city:'Inhambane', price:500,  spots:60,  bg:'linear-gradient(135deg,#0a1a2e,#0a2e2e)', badge:'',        badgeC:'',        faved:false },
  { id:14, emoji:'🎓', cat:'workshops',   catLabel:'Workshop',     title:'Bootcamp de Programação Web — 5 dias',    date:'7 Jul 2025',  dateMs: new Date('2025-07-07').getTime(), loc:'Maputo',         city:'Maputo',    price:1200, spots:30,  bg:'linear-gradient(135deg,#0a0a2e,#0a1a3d)', badge:'',        badgeC:'',        faved:false },
  { id:15, emoji:'🎪', cat:'arte',         catLabel:'Arte',         title:'Bienal de Arte Contemporânea de Maputo',  date:'1 Nov 2025',  dateMs: new Date('2025-11-01').getTime(), loc:'Maputo',         city:'Maputo',    price:200,  spots:1000,bg:'linear-gradient(135deg,#1a0a2e,#2e0a2e)', badge:'',        badgeC:'',        faved:false },
  { id:16, emoji:'🌊', cat:'desporto',     catLabel:'Desporto',     title:'Corrida de Mergulho — Pemba 2025',        date:'22 Nov 2025', dateMs: new Date('2025-11-22').getTime(), loc:'Pemba',          city:'Pemba',     price:800,  spots:50,  bg:'linear-gradient(135deg,#0a2e2e,#0a1a2e)', badge:'Novo',    badgeC:'#2B86C5', faved:false },
];

// ── State ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 9;
let currentView = 'grid';
let currentPeriod = 'todos';
let visibleCount = PAGE_SIZE;
let filteredEvents = [...allEvents];

// ── Filters ───────────────────────────────────────────────────────────
function getSelectedCats() {
  return [...document.querySelectorAll('#catOptions input:checked')].map(i => i.value);
}
function getSelectedCities() {
  return [...document.querySelectorAll('.filter-group input[type=checkbox][value^="M"],.filter-group input[type=checkbox][value="Beira"],.filter-group input[type=checkbox][value="Nampula"],.filter-group input[type=checkbox][value="Inhambane"],.filter-group input[type=checkbox][value="Pemba"]')].filter(i=>i.checked).map(i=>i.value);
}

function applyFilters() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const cats = getSelectedCats();
  const cities = [...document.querySelectorAll('.filters-sidebar .filter-group:nth-child(2) input:checked')].map(i => i.value);
  const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
  const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;
  const freeOnly = document.getElementById('freeOnly').checked;
  const hasSpots = document.getElementById('hasSpots').checked;
  const sort = document.getElementById('sortSelect').value;

  // Clear btn
  const clearBtn = document.getElementById('clearSearch');
  query ? clearBtn.classList.remove('hidden') : clearBtn.classList.add('hidden');

  filteredEvents = allEvents.filter(e => {
    if (query && !e.title.toLowerCase().includes(query) && !e.loc.toLowerCase().includes(query) && !e.catLabel.toLowerCase().includes(query)) return false;
    if (cats.length && !cats.includes(e.cat)) return false;
    if (cities.length && !cities.includes(e.city)) return false;
    if (freeOnly && e.price !== 0) return false;
    if (e.price < priceMin) return false;
    if (e.price > priceMax) return false;
    if (hasSpots && e.spots === 0) return false;
    if (currentPeriod !== 'todos') {
      const now = Date.now();
      const week = 7 * 24 * 3600 * 1000;
      const month = 30 * 24 * 3600 * 1000;
      const threeM = 90 * 24 * 3600 * 1000;
      if (currentPeriod === 'semana' && (e.dateMs < now || e.dateMs > now + week)) return false;
      if (currentPeriod === 'mes' && (e.dateMs < now || e.dateMs > now + month)) return false;
      if (currentPeriod === '3meses' && (e.dateMs < now || e.dateMs > now + threeM)) return false;
    }
    return true;
  });

  // Sort
  if (sort === 'date-asc')    filteredEvents.sort((a,b) => a.dateMs - b.dateMs);
  else if (sort === 'price-asc')  filteredEvents.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') filteredEvents.sort((a,b) => b.price - a.price);
  else if (sort === 'spots-desc') filteredEvents.sort((a,b) => b.spots - a.spots);
  else if (sort === 'az')         filteredEvents.sort((a,b) => a.title.localeCompare(b.title));

  visibleCount = PAGE_SIZE;
  renderGrid();
  updateActiveFilters();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearch').classList.add('hidden');
  applyFilters();
}

function clearAllFilters() {
  document.querySelectorAll('.filters-sidebar input[type=checkbox]').forEach(i => i.checked = false);
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearch').classList.add('hidden');
  document.getElementById('sortSelect').value = 'default';
  document.querySelectorAll('.db-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.db-btn[data-period="todos"]').classList.add('active');
  currentPeriod = 'todos';
  applyFilters();
}

function selectPeriod(btn) {
  document.querySelectorAll('.db-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPeriod = btn.dataset.period;
  applyFilters();
}

function updateActiveFilters() {
  const bar = document.getElementById('activeFilters');
  const chips = document.getElementById('filterChips');
  const active = [];

  document.querySelectorAll('.filters-sidebar input[type=checkbox]:checked').forEach(i => {
    const label = i.closest('label')?.textContent.trim() || i.value;
    active.push({ label, clear: () => { i.checked = false; applyFilters(); } });
  });

  const q = document.getElementById('searchInput').value.trim();
  if (q) active.push({ label: `"${q}"`, clear: clearSearch });
  if (currentPeriod !== 'todos') active.push({ label: document.querySelector('.db-btn.active')?.textContent, clear: () => { selectPeriod(document.querySelector('[data-period="todos"]')); } });

  if (active.length) {
    chips.innerHTML = active.map((a, i) => `<span class="af-chip">${a.label}<button onclick="clearChip(${i})">✕</button></span>`).join('');
    window._chipClearFns = active.map(a => a.clear);
    bar.style.display = 'block';
  } else {
    bar.style.display = 'none';
  }
}
window.clearChip = (i) => { window._chipClearFns[i](); };

// ── Render ────────────────────────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('eventsGrid');
  const empty = document.getElementById('emptyState');
  const loadWrap = document.getElementById('loadMoreWrap');
  const sortCount = document.getElementById('sortCount');
  const resultsCount = document.getElementById('resultsCount');

  const total = filteredEvents.length;
  const visible = filteredEvents.slice(0, visibleCount);

  resultsCount.textContent = total === allEvents.length
    ? `${total} eventos disponíveis`
    : `${total} resultado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;

  sortCount.innerHTML = `<strong>${total}</strong> evento${total !== 1 ? 's' : ''}`;

  if (!total) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    loadWrap.style.display = 'none';
    return;
  }

  empty.classList.add('hidden');
  loadWrap.style.display = visibleCount < total ? 'block' : 'none';

  grid.innerHTML = visible.map((e, i) => {
    const priceStr = e.price === 0 ? 'Grátis' : `MT ${e.price.toLocaleString('pt')}`;
    const spotsClass = e.spots < 20 ? 'ec-spots ec-spots-warn' : 'ec-spots';
    const spotsLabel = e.spots < 20 ? `⚠ Só ${e.spots} lugares!` : `${e.spots} lugares`;
    const bgStyle = e.img
      ? `linear-gradient(rgba(0,0,0,0.22),rgba(0,0,0,0.48)),url(${e.img}) center/cover no-repeat`
      : e.bg;
    return `
    <div class="event-card" style="animation-delay:${(i % PAGE_SIZE) * 0.06}s" onclick="openEvent(${e.id})">
      <div class="ec-img" style="background:${bgStyle}">
        ${e.emoji}
        <button class="ec-fav${e.faved?' faved':''}" onclick="event.stopPropagation();toggleFav(${e.id},this)">${e.faved?'❤️':'🤍'}</button>
        ${e.badge ? `<div class="ec-badge" style="background:${e.badgeC}22;color:${e.badgeC};border:1px solid ${e.badgeC}44">${e.badge}</div>` : ''}
      </div>
      <div class="ec-body">
        <div class="ec-cat">${e.catLabel} &nbsp;·&nbsp; ${e.city}</div>
        <div class="ec-title">${e.title}</div>
        <div class="ec-meta">
          <div class="ec-meta-row">📅 ${e.date}</div>
          <div class="ec-meta-row">📍 ${e.loc}</div>
        </div>
        <div class="ec-footer">
          <div class="ec-price${e.price===0?' free':''}">${priceStr}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="${spotsClass}">${spotsLabel}</span>
            <button class="ec-btn" onclick="event.stopPropagation();window.location.href=\`eventflow_event_detail_checkout.html?id=${e.id}\`">Bilhete</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function loadMore() {
  visibleCount += PAGE_SIZE;
  renderGrid();
  showToast('Mais eventos carregados');
}

function openEvent(id) {
  window.location.href = `eventflow_event_detail_checkout.html?id=${id}`;
}

function toggleFav(id, btn) {
  const ev = allEvents.find(e => e.id === id);
  ev.faved = !ev.faved;
  btn.textContent = ev.faved ? '❤️' : '🤍';
  btn.classList.toggle('faved', ev.faved);
  showToast(ev.faved ? '❤️ Adicionado aos favoritos' : 'Removido dos favoritos');
}

function setView(view, btn) {
  currentView = view;
  document.querySelectorAll('.vb-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('eventsGrid');
  grid.classList.toggle('list-view', view === 'list');
}

function toggleMobileFilters() {
  document.getElementById('filtersSidebar').classList.toggle('open');
}

// ── Search input listener ─────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', applyFilters);

// ── Read query param from URL ─────────────────────────────────────────
(function () {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const cat = params.get('cat');
  if (q) {
    document.getElementById('searchInput').value = q;
  }
  if (cat) {
    const cb = document.querySelector(`#catOptions input[value="${cat}"]`);
    if (cb) cb.checked = true;
  }
})();

// ── API Integration ───────────────────────────────────────────────────
async function loadEventsFromAPI() {
  try {
    const { events: apiEvents } = await EventsAPI.list({ limit: 100 });
    if (apiEvents && apiEvents.length) {
      allEvents.splice(0, allEvents.length, ...apiEvents.map(e => ({
        id: e.id,
        emoji: e.emoji || '🎪',
        cat: e.category,
        catLabel: e.category.charAt(0).toUpperCase() + e.category.slice(1),
        title: e.title,
        date: e.date_start,
        dateMs: new Date(e.date_start).getTime(),
        loc: e.venue,
        city: e.city,
        price: e.min_price || 0,
        spots: (e.total_capacity || 0) - (e.total_sold || 0),
        bg: e.bg_gradient || 'linear-gradient(135deg,#1a0a2e,#3d0a2e)',
        img: e.image_url || '',
        badge: '',
        badgeC: '',
        faved: false,
      })));
    }
  } catch { /* fallback to hardcoded data */ }
  applyFilters();
}

// ── Init — API is primary, static array is fallback ───────────────────
document.getElementById('eventsGrid').innerHTML =
  '<div style="grid-column:1/-1;text-align:center;padding:48px;color:rgba(255,255,255,0.4)">A carregar eventos...</div>';
loadEventsFromAPI();
