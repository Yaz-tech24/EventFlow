// Canvas BG (hero)
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
resize();
const orbs = [
  { x: 250, y: 160, r: 260, c: "#FF3CAC", vx: 0.3, vy: 0.2 },
  { x: 650, y: 200, r: 300, c: "#784BA0", vx: -0.25, vy: 0.2 },
  { x: 180, y: 280, r: 200, c: "#2B86C5", vx: 0.2, vy: -0.15 },
];
function drawBg() {
  ctx.fillStyle = "#06060f"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  orbs.forEach(o => {
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, o.c + "18"); g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    o.x += o.vx; o.y += o.vy;
    if (o.x < 0 || o.x > canvas.width) o.vx *= -1;
    if (o.y < 0 || o.y > canvas.height) o.vy *= -1;
  });
  requestAnimationFrame(drawBg);
}
drawBg();

// Canvas CTA
const ctaCanvas = document.getElementById("bgCta");
const ctaCtx = ctaCanvas.getContext("2d");
function resizeCta() { ctaCanvas.width = ctaCanvas.parentElement.offsetWidth; ctaCanvas.height = ctaCanvas.parentElement.offsetHeight; }
resizeCta();
const ctaOrbs = [
  { x: 200, y: 100, r: 200, c: "#FF3CAC", vx: 0.2, vy: 0.15 },
  { x: 500, y: 150, r: 220, c: "#784BA0", vx: -0.2, vy: 0.2 },
];
function drawCtaBg() {
  ctaCtx.fillStyle = "#06060f"; ctaCtx.fillRect(0, 0, ctaCanvas.width, ctaCanvas.height);
  ctaOrbs.forEach(o => {
    const g = ctaCtx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, o.c + "14"); g.addColorStop(1, "transparent");
    ctaCtx.beginPath(); ctaCtx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctaCtx.fillStyle = g; ctaCtx.fill();
    o.x += o.vx; o.y += o.vy;
    if (o.x < 0 || o.x > ctaCanvas.width) o.vx *= -1;
    if (o.y < 0 || o.y > ctaCanvas.height) o.vy *= -1;
  });
  requestAnimationFrame(drawCtaBg);
}
drawCtaBg();

// Organizers data
const organizers = [
  {
    id: 1, emoji: "🎵", name: "Mozambique Live", cat: "musica", catLabel: "Música",
    desc: "A maior produtora de eventos musicais de Moçambique com mais de 10 anos de experiência.",
    color: "#FF3CAC", events: 24, followers: "8.4K", rating: 4.9, verified: true,
    featured: true,
    featDesc: "A Mozambique Live é a principal organizadora de concertos e festivais de música do país. Com um portfolio impressionante que inclui o Festival de Música de Moçambique, já trouxe artistas internacionais e locais para palcos em todo o país.",
    featEvents: [
      { emoji: "🎵", name: "Festival de Música de Moçambique 2025", date: "12 Jul 2025", price: "MT6638" },
      { emoji: "🎶", name: "Concerto de Jazz — Maputo ao Pôr do Sol", date: "3 Jun 2025", price: "MT1500" },
    ]
  },
  {
    id: 2, emoji: "💻", name: "TechHub Maputo", cat: "tech", catLabel: "Tecnologia",
    desc: "Organizamos os maiores eventos de tecnologia e inovação em Moçambique.",
    color: "#00BCD4", events: 18, followers: "5.2K", rating: 4.8, verified: true, featured: false,
  },
  {
    id: 3, emoji: "🎨", name: "Arte Viva", cat: "arte", catLabel: "Arte & Cultura",
    desc: "Exposições, instalações e performances artísticas por todo o país.",
    color: "#784BA0", events: 12, followers: "3.1K", rating: 4.7, verified: true, featured: false,
  },
  {
    id: 4, emoji: "⚽", name: "Sport Events MZ", cat: "desporto", catLabel: "Desporto",
    desc: "Torneios, corridas e competições desportivas para todos os níveis.",
    color: "#2B86C5", events: 31, followers: "9.8K", rating: 4.6, verified: false, featured: false,
  },
  {
    id: 5, emoji: "🍽️", name: "Sabores de Moçambique", cat: "gastronomia", catLabel: "Gastronomia",
    desc: "Festivais gastronómicos celebrando a riquíssima culinária moçambicana.",
    color: "#FF8C00", events: 8, followers: "2.4K", rating: 4.9, verified: true, featured: false,
  },
  {
    id: 6, emoji: "🎭", name: "Teatro Nacional MZ", cat: "arte", catLabel: "Teatro",
    desc: "Peças clássicas e contemporâneas no coração de Maputo.",
    color: "#9B59B6", events: 15, followers: "4.7K", rating: 4.8, verified: true, featured: false,
  },
  {
    id: 7, emoji: "🎓", name: "EduEvents Africa", cat: "tech", catLabel: "Workshops",
    desc: "Workshops, masterclasses e formações profissionais em diversas áreas.",
    color: "#4CAF50", events: 22, followers: "6.1K", rating: 4.7, verified: false, featured: false,
  },
  {
    id: 8, emoji: "🎬", name: "Cine Maputo", cat: "arte", catLabel: "Cinema",
    desc: "Festivais de cinema, estreias e sessões especiais de filmes africanos.",
    color: "#F44336", events: 9, followers: "1.8K", rating: 4.5, verified: false, featured: false,
  },
];

let currentFilter = "todos";
let currentSearch = "";

function renderTopCard(org) {
  document.getElementById("topOrgCard").innerHTML = `
    <div class="toc-verified">✓ VERIFICADO</div>
    <div class="toc-avatar">${org.emoji}</div>
    <div class="toc-label">Organizador #1</div>
    <div class="toc-name">${org.name}</div>
    <div class="toc-cat">${org.catLabel}</div>
    <div class="toc-stats">
      <div class="toc-stat"><div class="toc-stat-num">${org.events}</div><div class="toc-stat-lbl">Eventos</div></div>
      <div class="toc-stat"><div class="toc-stat-num">${org.followers}</div><div class="toc-stat-lbl">Seguidores</div></div>
      <div class="toc-stat"><div class="toc-stat-num">${org.rating}★</div><div class="toc-stat-lbl">Rating</div></div>
    </div>
    <button class="toc-follow" onclick="this.textContent=this.textContent==='SEGUIR →'?'A SEGUIR ✓':'SEGUIR →'">SEGUIR →</button>
  `;
}

function renderFeatured(org) {
  document.getElementById("featuredOrg").innerHTML = `
    <div class="fo-left">
      <div class="fo-badge">⭐ DESTAQUE</div>
      <div class="fo-avatar">${org.emoji}</div>
      <div class="fo-name">${org.name}</div>
      <div class="fo-cat">${org.catLabel}</div>
      <div class="fo-rating">
        <span class="fo-stars">★★★★★</span>
        <span class="fo-rating-num">${org.rating}</span>
      </div>
      <div class="fo-followers">${org.followers} seguidores</div>
      <br>
      <button class="fo-follow-btn" onclick="this.textContent=this.textContent==='SEGUIR ORGANIZADOR →'?'A SEGUIR ✓':'SEGUIR ORGANIZADOR →'">SEGUIR ORGANIZADOR →</button>
      <a href="eventflow_organizer_dashboard.html" style="display:block;margin-top:10px;padding:9px 18px;background:rgba(255,140,0,0.12);border:1px solid rgba(255,140,0,0.3);border-radius:8px;color:#ff8c00;font-size:12px;font-weight:600;text-align:center;text-decoration:none;letter-spacing:0.5px;transition:background 0.2s" onmouseover="this.style.background='rgba(255,140,0,0.2)'" onmouseout="this.style.background='rgba(255,140,0,0.12)'">📊 Ver Dashboard do Organizador</a>
    </div>
    <div class="fo-right">
      <div class="fo-label">Sobre o organizador</div>
      <div class="fo-desc">${org.featDesc || org.desc}</div>
      <div class="fo-stats">
        <div class="fo-stat"><div class="fo-stat-num">${org.events}</div><div class="fo-stat-lbl">Eventos</div></div>
        <div class="fo-stat"><div class="fo-stat-num">${org.followers}</div><div class="fo-stat-lbl">Seguidores</div></div>
        <div class="fo-stat"><div class="fo-stat-num">${org.rating}</div><div class="fo-stat-lbl">Rating</div></div>
      </div>
      ${org.featEvents ? `
        <div class="fo-events-label">PRÓXIMOS EVENTOS</div>
        ${org.featEvents.map(e => `
          <div class="fo-event-row">
            <span class="fo-event-emoji">${e.emoji}</span>
            <span class="fo-event-name">${e.name}</span>
            <span class="fo-event-date">${e.date}</span>
            <span class="fo-event-price">${e.price}</span>
          </div>
        `).join("")}
      ` : ""}
    </div>
  `;
}

function renderGrid() {
  const filtered = organizers.filter(o => {
    const matchFilter = currentFilter === "todos" || o.cat === currentFilter;
    const matchSearch = o.name.toLowerCase().includes(currentSearch) || o.catLabel.toLowerCase().includes(currentSearch) || o.desc.toLowerCase().includes(currentSearch);
    return matchFilter && matchSearch;
  });
  document.getElementById("orgCount").textContent = filtered.length + " organizador" + (filtered.length !== 1 ? "es" : "");
  document.getElementById("orgsGrid").innerHTML = filtered.map((o, i) => `
    <div class="org-card" style="--org-color:${o.color};animation-delay:${i * 0.07}s">
      ${o.verified ? '<div class="org-verified">✓</div>' : ''}
      <div class="org-avatar">${o.emoji}</div>
      <div class="org-name">${o.name}</div>
      <div class="org-cat">${o.catLabel}</div>
      <div class="org-desc">${o.desc}</div>
      <div class="org-meta">
        <div class="org-stats-row">
          <div class="org-stat"><div class="org-stat-n">${o.events}</div><div class="org-stat-l">Eventos</div></div>
          <div class="org-stat"><div class="org-stat-n">${o.followers}</div><div class="org-stat-l">Seguidores</div></div>
        </div>
        <div class="org-rating"><span class="org-star">★</span>${o.rating}</div>
      </div>
    </div>
  `).join("");
}

const featured = organizers.find(o => o.featured);
renderTopCard(featured);
renderFeatured(featured);
renderGrid();

document.querySelectorAll(".fb-filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".fb-filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderGrid();
  });
});

document.getElementById("orgSearch").addEventListener("input", e => {
  currentSearch = e.target.value.toLowerCase();
  renderGrid();
});

// ── API Integration ───────────────────────────────────────────────────
async function loadOrganizersFromAPI() {
  try {
    const data = await OrganizerAPI.list({ limit: 20 });
    if (!data || !data.length) return;

    // Merge API data with static data, preferring API values
    data.forEach(apiOrg => {
      const existing = organizers.find(o => o.name === apiOrg.org_name);
      if (existing) {
        existing.events  = apiOrg.total_events || existing.events;
        existing.rating  = apiOrg.avg_rating   || existing.rating;
        existing.verified = apiOrg.verified === 1;
      } else {
        organizers.push({
          id:       apiOrg.id,
          emoji:    '🎪',
          name:     apiOrg.org_name,
          cat:      apiOrg.category || 'outros',
          catLabel: apiOrg.category || 'Outros',
          desc:     apiOrg.description || '',
          color:    '#784BA0',
          events:   apiOrg.total_events || 0,
          followers: '—',
          rating:   apiOrg.avg_rating || 0,
          verified: apiOrg.verified === 1,
          featured: false,
        });
      }
    });

    // Update count display
    const countEl = document.getElementById("orgCount");
    if (countEl) countEl.textContent = organizers.length + " organizador" + (organizers.length !== 1 ? "es" : "");

    renderGrid();
  } catch {}
}

loadOrganizersFromAPI();
