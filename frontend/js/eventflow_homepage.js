// Canvas BG
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
function resize() {
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
}
resize();
const orbs = [
  { x: 200, y: 180, r: 300, c: "#FF3CAC", vx: 0.3, vy: 0.2 },
  { x: 600, y: 280, r: 350, c: "#784BA0", vx: -0.2, vy: 0.25 },
  { x: 400, y: 420, r: 250, c: "#2B86C5", vx: 0.2, vy: -0.2 },
];
function drawBg() {
  ctx.fillStyle = "#06060f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  orbs.forEach((o) => {
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, o.c + "18");
    g.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < 0 || o.x > canvas.width) o.vx *= -1;
    if (o.y < 0 || o.y > canvas.height) o.vy *= -1;
  });
  requestAnimationFrame(drawBg);
}
drawBg();

// Fallback events (shown while API loads)
let events = [];
let activeCat = "todos";

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('pt-PT', { day:'numeric', month:'short', year:'numeric' }); }
  catch { return d; }
}

function renderGrid(list) {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.4);padding:40px">Nenhum evento disponível de momento.</div>';
    return;
  }
  grid.innerHTML = list.map((e, i) => {
    const price = e.min_price === 0 ? 0 : (e.min_price || e.price || 0);
    const loc   = e.city || e.loc || '—';
    const catL  = e.category || e.catLabel || '—';
    const bg    = e.bg_gradient || e.bg || 'linear-gradient(135deg,#1a0a2e,#3d0a2e)';
    const imgUrl = e.image_url || '';
    const bgStyle = imgUrl
      ? `linear-gradient(rgba(0,0,0,0.22),rgba(0,0,0,0.48)),url(${imgUrl}) center/cover no-repeat`
      : bg;
    const badge = e.badge || '';
    const badgeColor = e.badgeColor || '';
    return `
    <div class="event-card" style="animation-delay:${i * 0.08}s" onclick="openEvent(${e.id})">
      <div class="ec-img" style="background:${bgStyle}">
        ${e.emoji || '🎪'}
        <button class="ec-fav${e.faved ? ' faved' : ''}" onclick="event.stopPropagation();toggleFav(${e.id},this)">${e.faved ? '❤️' : '🤍'}</button>
        ${badge ? `<div class="ec-badge" style="background:${badgeColor}22;color:${badgeColor};border:1px solid ${badgeColor}44">${badge}</div>` : ''}
      </div>
      <div class="ec-body">
        <div class="ec-cat">${catL}</div>
        <div class="ec-title">${e.title}</div>
        <div class="ec-meta">
          <div class="ec-meta-row">📅 ${fmtDate(e.date_start || e.date)}</div>
          <div class="ec-meta-row">📍 ${loc}</div>
        </div>
        <div class="ec-footer">
          <div class="ec-price${price === 0 ? ' free' : ''}">${price === 0 ? 'Grátis' : 'MT ' + price.toLocaleString('pt')}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="ec-spots">${e.total_capacity ? (e.total_capacity - (e.total_sold||0)) + ' lugares' : ''}</span>
            <button class="ec-btn" onclick="event.stopPropagation();openEvent(${e.id})">Bilhete</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join("");
}

function filterCat(btn, cat) {
  document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeCat = cat;
  const filtered = cat === "todos" ? events : events.filter((e) => (e.category||e.cat) === cat);
  renderGrid(filtered);
}

function filterEvents(q) {
  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(q.toLowerCase()) ||
    (e.city||e.loc||'').toLowerCase().includes(q.toLowerCase())
  );
  renderGrid(filtered);
}

function toggleFav(id, btn) {
  const ev = events.find((e) => e.id === id);
  if (!ev) return;
  ev.faved = !ev.faved;
  btn.textContent = ev.faved ? "❤️" : "🤍";
  btn.classList.toggle("faved", ev.faved);
  if (typeof FavoritesAPI !== 'undefined' && Auth.isLoggedIn()) {
    const action = ev.faved ? FavoritesAPI.add : FavoritesAPI.remove;
    action(id).catch(() => {});
  }
}

function openEvent(id) {
  window.location.href = `eventflow_event_detail_checkout.html?id=${id}`;
}

function goEvents() {
  window.location.href = "eventflow_events.html";
}

// ── API Integration ───────────────────────────────────────────────────
async function loadHomepageData() {
  // Load platform stats
  try {
    const stats = await EventsAPI.stats();
    const statEls = document.querySelectorAll('.hs-num');
    if (statEls[0]) statEls[0].textContent = (stats.total_events || 0).toLocaleString('pt');
    if (statEls[1]) statEls[1].textContent = (stats.total_tickets || 0).toLocaleString('pt');
    if (statEls[2]) statEls[2].textContent = (stats.total_orgs || 0).toLocaleString('pt');
  } catch {}

  // Load featured events
  try {
    const res = await EventsAPI.list({ limit: 8, sort: 'date_start' });
    if (res.events && res.events.length) {
      events = res.events;
      renderGrid(events);

      // Near you scroll section
      const nearScroll = document.getElementById("nearScroll");
      if (nearScroll) {
        nearScroll.innerHTML = events.slice(0, 5).map((e, i) => {
          const price = e.min_price === 0 ? 0 : (e.min_price || 0);
          return `
          <div class="event-card event-card-sm" style="animation-delay:${i * 0.1}s" onclick="openEvent(${e.id})">
            <div class="ec-img" style="background:${e.image_url?`linear-gradient(rgba(0,0,0,0.22),rgba(0,0,0,0.48)),url(${e.image_url}) center/cover no-repeat`:(e.bg_gradient||'linear-gradient(135deg,#1a0a2e,#3d0a2e)')};height:100px">${e.emoji||'🎪'}</div>
            <div class="ec-body" style="padding:10px">
              <div class="ec-cat">${e.category||'—'}</div>
              <div class="ec-title">${e.title}</div>
              <div class="ec-meta"><div class="ec-meta-row">📍 ${e.city||'—'} · ${fmtDate(e.date_start)}</div></div>
              <div class="ec-price${price===0?' free':''}">${price===0?'Grátis':'MT '+price.toLocaleString('pt')}</div>
            </div>
          </div>`;
        }).join("");
      }

      // Upcoming table
      const upcomingTbody = document.getElementById("upcomingTbody");
      if (upcomingTbody) {
        upcomingTbody.innerHTML = events.slice(0, 5).map(u => {
          const price = u.min_price === 0 ? 'Grátis' : (u.min_price ? 'MT ' + u.min_price.toLocaleString('pt') : '—');
          const available = u.total_capacity && u.total_sold !== undefined
            ? (u.total_capacity - u.total_sold)
            : null;
          const statusLabel = available === 0 ? 'Esgotado' : available !== null && available < 20 ? 'Limitado' : 'Disponível';
          const statusC = available === 0 ? '#ff4444' : available !== null && available < 20 ? '#FF8C00' : '#00c864';
          return `<tr>
            <td>
              <div class="ut-event">
                <div class="ut-icon" style="background:${u.bg_gradient||'rgba(255,60,172,0.12)'}">${u.emoji||'🎪'}</div>
                <div><div class="ut-name">${u.title}</div></div>
              </div>
            </td>
            <td><span class="ut-date">${fmtDate(u.date_start)}</span></td>
            <td><span style="font-size:11px;color:rgba(255,255,255,0.4)">📍 ${u.city||'—'}</span></td>
            <td><span class="ut-price">${price}</span></td>
            <td><span class="ut-status" style="background:${statusC}18;color:${statusC};border:1px solid ${statusC}33">${statusLabel}</span></td>
            <td><button class="ut-buy" ${available===0?'disabled style="opacity:.4;cursor:not-allowed"':''} onclick="openEvent(${u.id})">Comprar</button></td>
          </tr>`;
        }).join("");
      }
    }
  } catch {
    // Fallback: show empty state
    renderGrid([]);
  }
}

loadHomepageData();
