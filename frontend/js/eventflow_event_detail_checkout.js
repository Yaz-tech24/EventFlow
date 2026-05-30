function showToast(msg) {
  let t = document.getElementById('ef-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'ef-toast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:rgba(20,20,30,.95);color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;z-index:99999;opacity:0;transition:opacity .3s;pointer-events:none;border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 32px rgba(0,0,0,.4)';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._hide);
  t._hide = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function toggleWishlist(btn) {
  const inList = btn.textContent.includes('Guardado');
  btn.textContent = inList ? '♡ Adicionar à Lista de Desejos' : '♥ Guardado nos Favoritos';
  btn.style.background = inList ? '' : 'rgba(255,60,172,0.12)';
  btn.style.borderColor = inList ? '' : 'rgba(255,60,172,0.35)';
  btn.style.color = inList ? '' : '#ff3cac';
  showToast(inList ? 'Removido dos favoritos' : '❤️ Adicionado aos favoritos!');

  // Sync with API
  const eventId = _eventData?.id || new URLSearchParams(window.location.search).get('id');
  if (eventId && typeof FavoritesAPI !== 'undefined' && Auth.isLoggedIn()) {
    const action = inList ? FavoritesAPI.remove : FavoritesAPI.add;
    action(eventId).catch(() => {});
  }
}

// ── Dynamic event data ────────────────────────────────────────────────
let _eventData = null;
let _ticketTypeIds = [];
let _lastPurchaseResult = null;
let _selectedPayMethod = 'mpesa';

// Ticket data arrays (populated from API or fallback)
let prices = [6638, 18567, 2908];
let fees   = [25, 25, 25];
let names  = ['Passe Geral', 'VIP Experience', 'Passe Diário'];
let qtys   = [1, 0, 0];
let currentStep = 1;
let discount = 0;

async function loadEventFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id || typeof EventsAPI === 'undefined') return;

  try {
    _eventData = await EventsAPI.get(id);
    if (_eventData.ticket_types && _eventData.ticket_types.length) {
      names.length = 0; prices.length = 0; fees.length = 0; qtys.length = 0; _ticketTypeIds.length = 0;
      _eventData.ticket_types.forEach((tt, i) => {
        names.push(tt.name);
        prices.push(tt.price);
        fees.push(tt.price === 0 ? 0 : 25);
        qtys.push(i === 0 ? 1 : 0);
        _ticketTypeIds.push(tt.id);
      });
    }

    // Update page hero
    const heroTitle = document.querySelector('.event-title, .hero-title, h1');
    if (heroTitle) heroTitle.textContent = _eventData.title;
    const heroDate = document.querySelector('.event-date, .ev-date');
    if (heroDate) heroDate.textContent = `📅 ${_eventData.date_start}`;
    const heroVenue = document.querySelector('.event-venue, .ev-venue');
    if (heroVenue) heroVenue.textContent = `📍 ${_eventData.venue}, ${_eventData.city}`;

    // Update banner background
    const bannerBg = document.querySelector('.banner-bg');
    if (bannerBg) {
      if (_eventData.image_url) {
        bannerBg.style.backgroundImage = `url(${_eventData.image_url})`;
        bannerBg.style.backgroundSize = 'cover';
        bannerBg.style.backgroundPosition = 'center';
        bannerBg.textContent = '';
      } else {
        bannerBg.textContent = _eventData.emoji || '🎪';
      }
    }

    // Update breadcrumb / title
    const bcTitle = document.querySelector('.bc-title');
    if (bcTitle) bcTitle.textContent = _eventData.title;
    const bcCat = document.querySelector('.bc-cat');
    if (bcCat) bcCat.textContent = _eventData.category || '—';
    const bcOrg = document.querySelector('.bc-org span');
    if (bcOrg && _eventData.org_name) bcOrg.textContent = _eventData.org_name;

    updateSummary();

    // Update ticket type cards in the page
    const ticketCards = document.querySelectorAll('.ticket-type');
    ticketCards.forEach((card, i) => {
      if (!_eventData.ticket_types[i]) { card.style.display = 'none'; return; }
      const tt = _eventData.ticket_types[i];
      const nameEl = card.querySelector('.tt-name, h3, .ticket-name');
      if (nameEl) nameEl.textContent = tt.name;
      const priceEl = card.querySelector('.tt-price-val, .price');
      if (priceEl) priceEl.textContent = tt.price === 0 ? 'Grátis' : `MT ${tt.price.toLocaleString('pt')}`;
      const availEl = card.querySelector('.tt-avail, .available');
      if (availEl) availEl.textContent = `${tt.available} disponíveis`;
    });
  } catch {}
}

function selectTicket(el, idx) {
  document.querySelectorAll('.ticket-type').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

function changeQty(idx, delta) {
  qtys[idx] = Math.max(0, qtys[idx] + delta);
  document.getElementById('qty' + idx).textContent = qtys[idx];
  updateSummary();
}

function updateSummary() {
  let subtotal = 0, fee = 0, label = [];
  qtys.forEach((q, i) => {
    if (q > 0) { subtotal += q * prices[i]; fee += q * fees[i]; label.push(q + '× ' + names[i]); }
  });
  if (subtotal === 0) { subtotal = prices[0]; fee = fees[0]; label = ['1× ' + names[0]]; qtys[0] = 1; const el0 = document.getElementById('qty0'); if (el0) el0.textContent = 1; }
  const disc = Math.round(subtotal * discount);
  const sumLabel = document.getElementById('sumLabel'); if (sumLabel) sumLabel.textContent = label.join(' + ');
  const sumItems = document.getElementById('sumItems'); if (sumItems) sumItems.textContent = 'MT' + subtotal;
  const sumFee   = document.getElementById('sumFee');   if (sumFee)   sumFee.textContent   = 'MT' + fee;
  const sumTotal = document.getElementById('sumTotal'); if (sumTotal) sumTotal.textContent  = 'MT' + (subtotal + fee - disc);
}

function applyPromo() {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  if (code === 'EVENTFLOW10') { discount = 0.1; showToast('✅ Desconto de 10% aplicado!'); updateSummary(); }
  else if (code === 'MOZAM25') { discount = 0.15; showToast('✅ Desconto de 15% aplicado!'); updateSummary(); }
  else showToast('❌ Código inválido. Tente: EVENTFLOW10');
}

function getTotal() {
  let subtotal = 0, fee = 0;
  qtys.forEach((q,i)=>{ subtotal += q*prices[i]; fee += q*fees[i]; });
  if (subtotal===0){subtotal=prices[0];fee=fees[0];}
  const disc = Math.round(subtotal*discount);
  return subtotal+fee-disc;
}

function getSummaryLines() {
  let lines = [];
  qtys.forEach((q,i)=>{ if(q>0) lines.push({n:q+'× '+names[i],v:'MT'+(q*prices[i])}); });
  if (lines.length===0) lines=[{n:'1× '+names[0],v:'MT'+prices[0]}];
  return lines;
}

function openCheckout() { currentStep=1; renderStep(); document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
function closeOnBg(e) { if(e.target===document.getElementById('modalOverlay')) closeModal(); }

function stepsHTML(active) {
  const s = ['Dados','Pagamento','Confirmação'];
  return `<div class="steps">${s.map((l,i)=>{
    const idx=i+1;
    const isDone=idx<active, isActive=idx===active;
    return `<div class="step ${isDone?'done':isActive?'active':''}">`+
      `<div class="step-circle">${isDone?'✓':idx}</div>`+
      `<span class="step-label">${l}</span>`+
      (i<s.length-1?`<div class="step-line ${idx<active?'done':''}"></div>`:'')
    +`</div>`;
  }).join('')}</div>`;
}

function orderSummaryHTML() {
  const lines = getSummaryLines();
  return `<div class="modal-order-summary">
    ${lines.map(l=>`<div class="mos-row"><span class="mos-label">${l.n}</span><span class="mos-val">${l.v}</span></div>`).join('')}
    <div class="mos-row"><span class="mos-label">Taxa de serviço</span><span class="mos-val">MT${qtys.reduce((a,q,i)=>a+q*fees[i],0)||fees[0]}</span></div>
    <div class="mos-total"><span class="mos-total-label">TOTAL</span><span class="mos-total-val">MT${getTotal()}</span></div>
  </div>`;
}

function renderStep() {
  const mb = document.getElementById('modalBody');
  const mt = document.getElementById('modalTitle');
  if (currentStep===1) {
    mt.textContent='Dados do Comprador';
    const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
    mb.innerHTML = stepsHTML(1)+
      `${orderSummaryHTML()}
      <div class="mform-row"><div class="mform-group"><label class="mform-label">Nome</label><input class="mform-input" placeholder="João" id="f-nome" value="${user?.first_name||''}"></div><div class="mform-group"><label class="mform-label">Apelido</label><input class="mform-input" placeholder="Silva" id="f-apelido" value="${user?.last_name||''}"></div></div>
      <div class="mform-group"><label class="mform-label">Email</label><input class="mform-input" type="email" placeholder="joao@email.com" id="f-email" value="${user?.email||''}"></div>
      <div class="mform-group"><label class="mform-label">Telemóvel</label><input class="mform-input" placeholder="+258 84 123 4567" id="f-tel" value="${user?.phone||''}"></div>
      <div class="mform-group"><label class="mform-label">NIF (opcional)</label><input class="mform-input" placeholder="123 456 789" id="f-nif"></div>
      <button class="btn-modal-primary" onclick="nextStep()">Continuar para Pagamento →</button>
      <button class="btn-modal-back" onclick="closeModal()">Cancelar</button>`;
  } else if (currentStep===2) {
    mt.textContent='Método de Pagamento';
    mb.innerHTML = stepsHTML(2)+
      `${orderSummaryHTML()}
      <div style="display:flex;gap:6px;margin-bottom:16px">
        <button class="qty-btn" id="pay-card"  style="flex:1;width:auto;padding:10px;font-size:11px;letter-spacing:1px" onclick="selPay(this,'card')">💳 Cartão</button>
        <button class="qty-btn" id="pay-mpesa" style="flex:1;width:auto;padding:10px;font-size:11px;letter-spacing:1px;border-color:var(--pink);color:var(--pink)" onclick="selPay(this,'mpesa')">📱 M-Pesa</button>
        <button class="qty-btn" id="pay-atm"   style="flex:1;width:auto;padding:10px;font-size:11px;letter-spacing:1px" onclick="selPay(this,'atm')">🏧 ATM</button>
        <button class="qty-btn" id="pay-paypal"style="flex:1;width:auto;padding:10px;font-size:11px;letter-spacing:1px" onclick="selPay(this,'paypal')">🌐 PayPal</button>
      </div>
      <div id="pay-fields">
        <div class="mform-group"><label class="mform-label">Número M-Pesa</label><input class="mform-input" placeholder="+258 84 123 4567" id="f-mpesa"></div>
      </div>
      <button class="btn-modal-primary" id="confirmPayBtn" onclick="nextStep()">Confirmar Pagamento — MT${getTotal()} →</button>
      <button class="btn-modal-back" onclick="prevStep()">← Voltar</button>`;
  } else {
    const result = _lastPurchaseResult;
    const code = result?.qr_code || ('EF-' + Math.random().toString(36).substr(2,8).toUpperCase());
    const eventTitle = _eventData?.title || 'Festival de Música de Moçambique 2025';
    const eventDate  = _eventData ? `${_eventData.date_start}` : '12–14 Jul 2025';
    const eventVenue = _eventData ? `${_eventData.venue}, ${_eventData.city}` : 'Praia do Tofo, Inhambane';
    mt.textContent='Pedido Confirmado';
    mb.innerHTML = `<div class="success-screen">
      <div class="success-icon">🎉</div>
      <div class="success-title">Bilhete Confirmado!</div>
      <div class="success-sub">O teu bilhete foi confirmado e enviado para o teu email.<br>Apresenta o QR Code na entrada do evento.</div>
      <div class="ticket-visual">
        <div class="tv-notch-l"></div><div class="tv-notch-r"></div>
        <div class="tv-row"><span class="tv-label">Evento</span><span class="tv-value">${eventTitle}</span></div>
        <div class="tv-row"><span class="tv-label">Data</span><span class="tv-value">${eventDate}</span></div>
        <div class="tv-row"><span class="tv-label">Local</span><span class="tv-value">${eventVenue}</span></div>
        <div class="tv-dashed"></div>
        <div class="tv-row"><span class="tv-label">Tipo</span><span class="tv-value">${names[qtys.findIndex(q=>q>0)||0]} × ${qtys.find(q=>q>0)||1}</span></div>
        <div class="tv-row"><span class="tv-label">Total pago</span><span class="tv-value" style="color:var(--success)">MT${getTotal()}</span></div>
        <div class="tv-code">${code}</div>
      </div>
      <button class="btn-download" onclick="showToast('📥 Funcionalidade de download em breve!')">📥 Descarregar Bilhete PDF</button>
      <button class="btn-modal-back" onclick="closeModal();window.location.href='eventflow_profile.html'">Ver os meus bilhetes →</button>
    </div>`;
  }
}

async function nextStep() {
  if (currentStep === 1) {
    const nome = document.getElementById('f-nome')?.value?.trim();
    const email = document.getElementById('f-email')?.value?.trim();
    if (!nome || !email) { showToast('Por favor preenche o nome e email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Email inválido'); return; }
    currentStep = 2;
    renderStep();
    return;
  }

  if (currentStep === 2) {
    // Make real API purchase call
    if (!Auth.isLoggedIn()) {
      showToast('Precisas de iniciar sessão para comprar bilhetes');
      setTimeout(() => { closeModal(); window.location.href='eventflow_login_register.html'; }, 1500);
      return;
    }

    const btn = document.getElementById('confirmPayBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'A processar...'; }

    const ticketIdx = qtys.findIndex(q => q > 0);
    const safeIdx = ticketIdx >= 0 ? ticketIdx : 0;
    const ticket_type_id = _ticketTypeIds[safeIdx];
    const event_id = _eventData?.id || new URLSearchParams(window.location.search).get('id');

    // Only call API if we have real IDs
    if (event_id && ticket_type_id) {
      const buyer_name  = [document.getElementById('f-nome')?.value, document.getElementById('f-apelido')?.value].filter(Boolean).join(' ');
      const buyer_email = document.getElementById('f-email')?.value;
      const buyer_phone = document.getElementById('f-tel')?.value;

      try {
        _lastPurchaseResult = await TicketsAPI.purchase({
          event_id: parseInt(event_id),
          ticket_type_id,
          quantity: qtys[safeIdx] || 1,
          payment_method: _selectedPayMethod || 'mpesa',
          buyer_name:  buyer_name  || undefined,
          buyer_email: buyer_email || undefined,
          buyer_phone: buyer_phone || undefined,
        });
      } catch (err) {
        showToast('❌ ' + (err.message || 'Falha ao processar pagamento'));
        if (btn) { btn.disabled = false; btn.textContent = `Confirmar Pagamento — MT${getTotal()} →`; }
        return;
      }
    }

    currentStep = 3;
    renderStep();
    return;
  }
}

function prevStep() {
  if (currentStep > 1) { currentStep--; renderStep(); }
}

function selPay(btn, method) {
  document.querySelectorAll('[id^="pay-"]').forEach(b => { b.style.borderColor=''; b.style.color=''; });
  btn.style.borderColor = 'var(--pink)';
  btn.style.color = 'var(--pink)';
  _selectedPayMethod = method;
  const pf = document.getElementById('pay-fields');
  if (!pf) return;
  if (method==='mpesa')  pf.innerHTML=`<div class="mform-group"><label class="mform-label">Número M-Pesa</label><input class="mform-input" placeholder="+258 84 123 4567" id="f-mpesa"></div>`;
  else if (method==='atm')    pf.innerHTML=`<div style="padding:16px;background:rgba(255,255,255,.03);border:1px solid var(--border);text-align:center;font-size:12px;color:rgba(255,255,255,.5)">Referência ATM gerada após confirmação</div>`;
  else if (method==='paypal') pf.innerHTML=`<div style="padding:16px;background:rgba(255,255,255,.03);border:1px solid var(--border);text-align:center;font-size:12px;color:rgba(255,255,255,.5)">Será redirecionado para o PayPal</div>`;
  else pf.innerHTML=`<div class="mform-group"><label class="mform-label">Número do Cartão</label><div class="card-input-wrap"><input class="mform-input" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCard(this)" id="f-card"><div class="card-icons"><span>💳</span></div></div></div><div class="mform-row-3"><div class="mform-group"><label class="mform-label">Titular</label><input class="mform-input" placeholder="JOAO SILVA" id="f-holder"></div><div class="mform-group"><label class="mform-label">Validade</label><input class="mform-input" placeholder="MM/AA" maxlength="5" id="f-exp"></div><div class="mform-group"><label class="mform-label">CVV</label><input class="mform-input" placeholder="•••" maxlength="3" type="password" id="f-cvv"></div></div>`;
}

function formatCard(inp) {
  let v = inp.value.replace(/\D/g,'').substring(0,16);
  inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

function switchTab(btn, id) {
  document.querySelectorAll('.dtab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.dtab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-'+id).classList.add('active');
}

// Load dynamic event data on page init
document.addEventListener('DOMContentLoaded', () => {
  loadEventFromURL();
  updateSummary();
});
