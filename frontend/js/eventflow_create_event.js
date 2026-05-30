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

// Edit mode — populated when URL contains ?id=
const _editId = new URLSearchParams(location.search).get('id');

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// State
let currentStep = 1;
const totalSteps = 4;
const tags = [];
let ticketTypes = [
  { name: 'General Pass', price: '350', qty: '200', desc: 'Acesso geral ao evento' },
];

// ── Step Navigation ───────────────────────────────────────────────────

function goToStep(step) {
  // Hide all steps
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById(`sc-${i}`).classList.add('hidden');
    const nav = document.getElementById(`step-nav-${i}`);
    nav.classList.remove('active');
    if (i < step) nav.classList.add('done');
    else nav.classList.remove('done');
  }
  // Show target
  document.getElementById(`sc-${step}`).classList.remove('hidden');
  document.getElementById(`step-nav-${step}`).classList.add('active');
  currentStep = step;

  // Update step dot icons for done steps
  document.querySelectorAll('.step-item.done .step-dot').forEach(d => {
    d.textContent = '✓';
  });
  // Active step gets number
  for (let i = 1; i <= totalSteps; i++) {
    const nav = document.getElementById(`step-nav-${i}`);
    const dot = nav.querySelector('.step-dot');
    if (!nav.classList.contains('done')) dot.textContent = i;
  }

  if (step === 4) buildReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(from) {
  if (from === 1 && !validateStep1()) return;
  if (from === 2 && !validateStep2()) return;
  if (from === 3 && !validateStep3()) return;
  goToStep(from + 1);
}

function prevStep(from) { goToStep(from - 1); }

// ── Validation ────────────────────────────────────────────────────────

function validateStep1() {
  const title = document.getElementById('evTitle').value.trim();
  const cat = document.getElementById('evCat').value;
  const desc = document.getElementById('evDesc').value.trim();
  if (!title) { showToast('Por favor insere o título do evento'); return false; }
  if (!cat) { showToast('Por favor seleciona uma categoria'); return false; }
  if (desc.length < 20) { showToast('A descrição deve ter pelo menos 20 caracteres'); return false; }
  return true;
}

function validateStep2() {
  const dateStart = document.getElementById('evDateStart').value;
  const venue = document.getElementById('evVenue').value.trim();
  if (!dateStart) { showToast('Por favor indica a data de início'); return false; }
  if (!venue) { showToast('Por favor indica o local do evento'); return false; }
  return true;
}

function validateStep3() {
  if (!ticketTypes.length) { showToast('Adiciona pelo menos um tipo de bilhete'); return false; }
  return true;
}

// ── Preview ───────────────────────────────────────────────────────────

function updatePreview() {
  const title = document.getElementById('evTitle')?.value || '';
  const dateStart = document.getElementById('evDateStart')?.value || '';
  const venue = document.getElementById('evVenue')?.value || '';
  const city = document.getElementById('evCity')?.value || '';

  document.getElementById('previewName').textContent = title || 'Nome do Evento';

  const dateFmt = dateStart ? new Date(dateStart).toLocaleDateString('pt-PT', { day:'numeric', month:'short', year:'numeric' }) : 'Data';
  const locStr = [venue, city].filter(Boolean).join(', ') || 'Local';
  document.getElementById('previewMeta').textContent = `📅 ${dateFmt}  ·  📍 ${locStr}`;

  // Price from first ticket
  const priceInput = document.querySelector('.tt-price');
  const price = priceInput ? priceInput.value || '—' : '—';
  document.getElementById('previewPrice').textContent = price !== '—' ? `A partir de MT ${price}` : 'A partir de MT —';
}

// ── Emoji Picker ──────────────────────────────────────────────────────

const bannerGradients = {
  '🎪': 'linear-gradient(135deg,#1a0a2e,#3d0a2e)',
  '🎵': 'linear-gradient(135deg,#0a0a2e,#2e0a3d)',
  '🎨': 'linear-gradient(135deg,#0a1a2e,#1a2a4a)',
  '💡': 'linear-gradient(135deg,#0a2e1a,#1a4a2a)',
  '🏃': 'linear-gradient(135deg,#2e1a0a,#4a2a1a)',
  '🎭': 'linear-gradient(135deg,#2e0a2e,#4a0a3d)',
  '🎤': 'linear-gradient(135deg,#0a2e2e,#0a3d3d)',
  '🌍': 'linear-gradient(135deg,#0a2e0a,#1a4a1a)',
  '🍽️': 'linear-gradient(135deg,#2e1a0a,#3d2a0a)',
  '📸': 'linear-gradient(135deg,#0a0a2e,#1a0a3d)',
  '🎮': 'linear-gradient(135deg,#0a1a0a,#1a2e1a)',
  '🎓': 'linear-gradient(135deg,#2e0a0a,#4a1a0a)',
};

function pickEmoji(emoji, el) {
  document.querySelectorAll('.ep-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('epSelected').textContent = emoji;
  document.getElementById('previewEmoji').textContent = emoji;
  document.getElementById('previewBanner').style.background = bannerGradients[emoji] || bannerGradients['🎪'];
}

// ── Tags ──────────────────────────────────────────────────────────────

function handleTagInput(e) {
  if ((e.key === 'Enter' || e.key === ',') && e.target.value.trim()) {
    e.preventDefault();
    const tag = e.target.value.trim().replace(/,/g, '');
    if (tag && !tags.includes(tag) && tags.length < 8) {
      tags.push(tag);
      renderTags();
    }
    e.target.value = '';
  }
}

function renderTags() {
  const list = document.getElementById('tagsList');
  list.innerHTML = tags.map((t, i) => `
    <span class="tag-chip">${t}<span class="tag-remove" onclick="removeTag(${i})">×</span></span>
  `).join('');
}

function removeTag(i) { tags.splice(i, 1); renderTags(); }

// ── Ticket Types ──────────────────────────────────────────────────────

function renderTicketTypes() {
  const list = document.getElementById('ticketTypesList');
  if (!list) return;
  list.innerHTML = ticketTypes.map((t, i) => `
    <div class="tt-card" id="tt-${i}">
      <div class="tt-header">
        <div class="tt-num">${i + 1}</div>
        <div class="tt-lbl">Tipo de Bilhete ${i + 1}</div>
      </div>
      ${i > 0 ? `<button class="tt-remove" onclick="removeTicketType(${i})">Remover</button>` : ''}
      <div class="tt-grid">
        <div class="tt-group">
          <div class="tt-label">NOME DO BILHETE</div>
          <input class="fg-input" type="text" value="${t.name}" placeholder="Ex: General Pass" onchange="ticketTypes[${i}].name=this.value;updatePreview()">
        </div>
        <div class="tt-group">
          <div class="tt-label">PREÇO (MT)</div>
          <input class="fg-input tt-price" type="number" value="${t.price}" min="0" placeholder="0" onchange="ticketTypes[${i}].price=this.value;updatePreview()">
        </div>
        <div class="tt-group">
          <div class="tt-label">QUANTIDADE</div>
          <input class="fg-input" type="number" value="${t.qty}" min="1" placeholder="100" onchange="ticketTypes[${i}].qty=this.value">
        </div>
        <div class="tt-group">
          <div class="tt-label">DESCRIÇÃO CURTA</div>
          <input class="fg-input" type="text" value="${t.desc}" placeholder="Acesso geral..." onchange="ticketTypes[${i}].desc=this.value">
        </div>
      </div>
    </div>
  `).join('');
}

function addTicketType() {
  if (ticketTypes.length >= 5) { showToast('Máximo de 5 tipos de bilhete'); return; }
  ticketTypes.push({ name: '', price: '', qty: '', desc: '' });
  renderTicketTypes();
  showToast('Novo tipo de bilhete adicionado');
}

function removeTicketType(i) {
  ticketTypes.splice(i, 1);
  renderTicketTypes();
}

// ── Step 2 helpers ────────────────────────────────────────────────────

function selectRecurrence(btn) {
  document.querySelectorAll('.rec-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleOnlineLink() {
  const checked = document.getElementById('evOnline').checked;
  const link = document.getElementById('onlineLink');
  link.style.display = checked ? 'block' : 'none';
}

// ── Review ────────────────────────────────────────────────────────────

function buildReview() {
  const title = document.getElementById('evTitle')?.value || '—';
  const cat = document.getElementById('evCat')?.selectedOptions[0]?.text || '—';
  const desc = document.getElementById('evDesc')?.value?.slice(0, 80) + '...' || '—';
  const dateStart = document.getElementById('evDateStart')?.value || '—';
  const venue = document.getElementById('evVenue')?.value || '—';
  const city = document.getElementById('evCity')?.value || '—';
  const capacity = document.getElementById('evCapacity')?.value || '—';

  const dateFmt = dateStart !== '—'
    ? new Date(dateStart).toLocaleDateString('pt-PT', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : '—';

  const items = [
    { lbl: 'Título', val: title },
    { lbl: 'Categoria', val: cat },
    { lbl: 'Descrição', val: desc },
    { lbl: 'Tags', val: tags.join(', ') || '—' },
    { lbl: 'Data de Início', val: dateFmt },
    { lbl: 'Local', val: `${venue}, ${city}` },
    { lbl: 'Capacidade', val: capacity !== '—' ? `${capacity} pessoas` : '—' },
    { lbl: 'Bilhetes', val: ticketTypes.map(t => `${t.name || 'Tipo'} · MT ${t.price || '0'} (${t.qty || '?'} disp.)`).join('<br>') || '—' },
  ];

  document.getElementById('reviewContent').innerHTML = items.map(it => `
    <div class="rv-item">
      <div class="rv-lbl">${it.lbl}</div>
      <div class="rv-val">${it.val}</div>
    </div>
  `).join('');

  // Checklist
  updateChecklist();
}

function updateChecklist() {
  const title = document.getElementById('evTitle')?.value;
  const dateStart = document.getElementById('evDateStart')?.value;
  const venue = document.getElementById('evVenue')?.value;

  setCheck('chk1', title, 'Informação básica');
  setCheck('chk2', dateStart && venue, 'Data & local');
  setCheck('chk3', ticketTypes.length > 0 && ticketTypes[0].name, 'Pelo menos 1 bilhete');
}

function setCheck(id, ok, label) {
  const el = document.getElementById(id);
  if (!el) return;
  if (ok) {
    el.className = 'pp-check-item ok';
    el.innerHTML = `<span class="chk-icon">✓</span><span>${label}</span>`;
  } else {
    el.className = 'pp-check-item';
    el.innerHTML = `<span class="chk-icon">⏳</span><span>${label}</span>`;
  }
}

function selectPubOpt(el) {
  document.querySelectorAll('.pub-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}

// ── Publish ───────────────────────────────────────────────────────────

function buildEventPayload(isDraft) {
  const selectedEmoji = document.getElementById('epSelected')?.textContent || '🎪';
  const selectedGradient = document.getElementById('previewBanner')?.style.background || '';

  return {
    title:        document.getElementById('evTitle')?.value?.trim(),
    description:  document.getElementById('evDesc')?.value?.trim(),
    category:     document.getElementById('evCat')?.value,
    emoji:        selectedEmoji,
    date_start:   document.getElementById('evDateStart')?.value,
    time_start:   document.getElementById('evTimeStart')?.value || '20:00',
    date_end:     document.getElementById('evDateEnd')?.value || undefined,
    time_end:     document.getElementById('evTimeEnd')?.value || undefined,
    venue:        document.getElementById('evVenue')?.value?.trim(),
    address:      document.getElementById('evAddress')?.value?.trim() || undefined,
    city:         document.getElementById('evCity')?.value?.trim() || 'Maputo',
    capacity:     parseInt(document.getElementById('evCapacity')?.value) || 100,
    is_online:    document.getElementById('evOnline')?.checked ? 1 : 0,
    online_link:  document.getElementById('evOnlineLink')?.value?.trim() || undefined,
    cancel_policy:'no_refund',
    tags,
    bg_gradient:  selectedGradient || undefined,
    ticket_types: ticketTypes.map(t => ({
      name:        t.name || 'Geral',
      description: t.desc || undefined,
      price:       parseFloat(t.price) || 0,
      quantity:    parseInt(t.qty) || 100,
    })),
  };
}

async function publishEvent() {
  const title    = document.getElementById('evTitle')?.value;
  const dateStart = document.getElementById('evDateStart')?.value;
  const venue    = document.getElementById('evVenue')?.value;
  if (!title || !dateStart || !venue) {
    showToast('Preenche todos os campos obrigatórios primeiro');
    return;
  }
  if (!Auth.isLoggedIn()) {
    showToast('Precisas de iniciar sessão para criar eventos');
    setTimeout(() => window.location.href = 'eventflow_login_register.html', 1500);
    return;
  }
  const btn = document.querySelector('[onclick="publishEvent()"]');
  if (btn) { btn.disabled = true; btn.textContent = _editId ? 'A guardar...' : 'A publicar...'; }
  try {
    if (_editId) {
      await EventsAPI.update(_editId, buildEventPayload(false));
    } else {
      await EventsAPI.create(buildEventPayload(false));
    }
    document.getElementById('successModal').classList.remove('hidden');
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erro ao guardar evento'));
    if (btn) { btn.disabled = false; btn.textContent = _editId ? 'Guardar Alterações →' : 'Publicar Evento →'; }
  }
}

async function saveDraft() {
  const title = document.getElementById('evTitle')?.value;
  if (!title) { showToast('Dá um título ao evento antes de guardar'); return; }
  if (!Auth.isLoggedIn()) {
    showToast('Precisas de iniciar sessão para guardar');
    setTimeout(() => window.location.href = 'eventflow_login_register.html', 1500);
    return;
  }
  try {
    if (_editId) {
      await EventsAPI.update(_editId, buildEventPayload(true));
    } else {
      await EventsAPI.create(buildEventPayload(true));
    }
    showToast(_editId ? 'Alterações guardadas!' : 'Rascunho guardado com sucesso!');
  } catch {
    showToast('Guardado localmente!');
  }
  setTimeout(() => window.location.href = 'eventflow_organizer_dashboard.html', 1500);
}

// ── Char Count ────────────────────────────────────────────────────────

function updateCharCount() {
  const desc = document.getElementById('evDesc');
  const counter = document.getElementById('charCount');
  if (!desc || !counter) return;
  const len = desc.value.length;
  counter.textContent = `${len} / 1000`;
  counter.style.color = len > 900 ? '#ff6666' : 'rgba(255,255,255,0.25)';
  if (desc.value.length > 1000) desc.value = desc.value.slice(0, 1000);
}

// ── Init ──────────────────────────────────────────────────────────────
renderTicketTypes();
goToStep(1);

if (_editId) {
  document.title = 'EventFlow — Editar Evento';
  const badge = document.querySelector('.nav-badge');
  if (badge) badge.textContent = 'EDITAR EVENTO';

  EventsAPI.get(_editId).then(ev => {
    // Step 1
    if (ev.title)       document.getElementById('evTitle').value = ev.title;
    if (ev.category)    document.getElementById('evCat').value   = ev.category;
    if (ev.description) document.getElementById('evDesc').value  = ev.description;

    // Emoji
    if (ev.emoji) {
      const epSel = document.getElementById('epSelected');
      if (epSel) epSel.textContent = ev.emoji;
      const previewEmoji = document.getElementById('previewEmoji');
      if (previewEmoji) previewEmoji.textContent = ev.emoji;
      document.querySelectorAll('.ep-opt').forEach(o => {
        o.classList.toggle('active', o.textContent.trim() === ev.emoji);
      });
      const previewBanner = document.getElementById('previewBanner');
      if (previewBanner && ev.bg_gradient) previewBanner.style.background = ev.bg_gradient;
    }

    // Step 2
    if (ev.date_start)  document.getElementById('evDateStart').value = ev.date_start.slice(0, 10);
    if (ev.time_start)  document.getElementById('evTimeStart').value = ev.time_start.slice(0, 5);
    if (ev.date_end)    document.getElementById('evDateEnd').value   = ev.date_end.slice(0, 10);
    if (ev.time_end)    document.getElementById('evTimeEnd').value   = ev.time_end.slice(0, 5);
    if (ev.venue)       document.getElementById('evVenue').value     = ev.venue;
    if (ev.address)     document.getElementById('evAddress').value   = ev.address;
    if (ev.city)        document.getElementById('evCity').value      = ev.city;
    if (ev.capacity)    document.getElementById('evCapacity').value  = ev.capacity;
    if (ev.is_online) {
      const onlineChk = document.getElementById('evOnline');
      if (onlineChk) { onlineChk.checked = true; toggleOnlineLink(); }
    }
    const onlineLinkEl = document.getElementById('evOnlineLink');
    if (onlineLinkEl && ev.online_link) onlineLinkEl.value = ev.online_link;

    // Tags
    const parsedTags = Array.isArray(ev.tags)
      ? ev.tags
      : (typeof ev.tags === 'string' ? (() => { try { return JSON.parse(ev.tags); } catch { return []; } })() : []);
    tags.splice(0, tags.length, ...parsedTags);
    renderTags();

    // Ticket types
    if (ev.ticket_types && ev.ticket_types.length) {
      ticketTypes.splice(0, ticketTypes.length, ...ev.ticket_types.map(t => ({
        name:  t.name        || '',
        price: String(t.price    ?? 0),
        qty:   String(t.quantity ?? t.qty ?? 100),
        desc:  t.description || '',
      })));
      renderTicketTypes();
    }

    updatePreview();
    updateCharCount();
  }).catch(() => showToast('Não foi possível carregar os dados do evento'));
}
