// Canvas BG
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
resize();
const orbs = [
  { x: 300, y: 150, r: 280, c: "#FF3CAC", vx: 0.3, vy: 0.2 },
  { x: 700, y: 200, r: 320, c: "#784BA0", vx: -0.2, vy: 0.25 },
  { x: 150, y: 300, r: 200, c: "#2B86C5", vx: 0.2, vy: -0.2 },
];
function drawBg() {
  ctx.fillStyle = "#06060f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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

// Categories data
const categories = [
  { id: "musica", emoji: "🎵", name: "Música", desc: "Festivais, concertos, DJ sets e muito mais", count: 47, color: "#FF3CAC", pct: 92 },
  { id: "arte", emoji: "🎨", name: "Arte & Cultura", desc: "Exposições, galerias e eventos culturais", count: 28, color: "#784BA0", pct: 58 },
  { id: "desporto", emoji: "⚽", name: "Desporto", desc: "Jogos, torneios e competições desportivas", count: 35, color: "#2B86C5", pct: 72 },
  { id: "gastronomia", emoji: "🍽️", name: "Gastronomia", desc: "Festivais de comida, wine tastings e chefs", count: 22, color: "#FF8C00", pct: 45 },
  { id: "teatro", emoji: "🎭", name: "Teatro", desc: "Peças, musicais e artes performativas", count: 18, color: "#9B59B6", pct: 37 },
  { id: "tecnologia", emoji: "💻", name: "Tecnologia", desc: "Conferências, hackathons e meetups tech", count: 31, color: "#00BCD4", pct: 63 },
  { id: "workshops", emoji: "🎓", name: "Workshops", desc: "Formações, cursos e masterclasses", count: 24, color: "#4CAF50", pct: 50 },
  { id: "feiras", emoji: "🛍️", name: "Feiras", desc: "Feiras de artesanato, mercados e expos", count: 19, color: "#FF5722", pct: 40 },
  { id: "cinema", emoji: "🎬", name: "Cinema", desc: "Filmes, festivais de cinema e estreias", count: 15, color: "#F44336", pct: 30 },
  { id: "outros", emoji: "🎪", name: "Outros", desc: "Eventos diversos e especiais", count: 8, color: "#607D8B", pct: 18 },
];

const featuredEvents = {
  musica: [
    { emoji: "🎵", name: "Festival de Música de Moçambique 2025", date: "12 Jul 2025", price: "MT6638" },
    { emoji: "🎶", name: "Concerto de Jazz — Maputo ao Pôr do Sol", date: "3 Jun 2025", price: "MT1500" },
    { emoji: "🎸", name: "Rock in Mozambique — Edição 7", date: "20 Ago 2025", price: "MT2200" },
  ],
  tecnologia: [
    { emoji: "💻", name: "Tech Summit Moçambique 2025", date: "10 Nov 2025", price: "MT8990" },
    { emoji: "🚀", name: "Hackathon Nacional — FinTech Edition", date: "5 Out 2025", price: "Grátis" },
    { emoji: "🤖", name: "AI & Innovation Conference Maputo", date: "15 Set 2025", price: "MT3500" },
  ],
};

function renderCategories(filter = "") {
  const grid = document.getElementById("categoriesGrid");
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.desc.toLowerCase().includes(filter.toLowerCase())
  );
  document.getElementById("catCount").textContent = filtered.length + " categori" + (filtered.length === 1 ? "a" : "as");
  grid.innerHTML = filtered.map((c, i) => `
    <div class="cat-card" style="--cat-color:${c.color};animation-delay:${i * 0.06}s" onclick="window.location.href=\`eventflow_events.html?cat=${c.id}\`">
      <div class="cat-corner"></div>
      <span class="cat-emoji">${c.emoji}</span>
      <div class="cat-name">${c.name}</div>
      <div class="cat-desc">${c.desc}</div>
      <div class="cat-bar"><div class="cat-bar-fill" style="width:${c.pct}%"></div></div>
      <div class="cat-footer">
        <div class="cat-count">${c.count} eventos</div>
        <div class="cat-arrow">→</div>
      </div>
    </div>
  `).join("");
  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll(".cat-bar-fill").forEach(b => { const w = b.style.width; b.style.width = "0"; setTimeout(() => b.style.width = w, 50); });
  }, 100);
}

function renderFeatCard(id, data, color, emoji) {
  const el = document.getElementById(id);
  el.innerHTML = `
    <div class="fcc-tag">⭐ Categoria em Destaque</div>
    <div class="fcc-emoji">${emoji}</div>
    <div class="fcc-title">${data.name}</div>
    <div class="fcc-sub">${data.desc} — ${data.count} eventos disponíveis</div>
    <div class="fcc-events">
      ${featuredEvents[data.id] ? featuredEvents[data.id].map(e => `
        <div class="fcc-event">
          <div class="fcc-event-emoji">${e.emoji}</div>
          <div class="fcc-event-info">
            <div class="fcc-event-name">${e.name}</div>
            <div class="fcc-event-date">${e.date}</div>
          </div>
          <div class="fcc-event-price">${e.price}</div>
        </div>
      `).join("") : ""}
    </div>
    <button class="fcc-btn" onclick="window.location.href=\`eventflow_events.html?cat=${data.id}\`">VER TODOS OS EVENTOS →</button>
  `;
  el.style.borderColor = color + "33";
}

renderCategories();
renderFeatCard("featCard1", categories[0], categories[0].color, categories[0].emoji);
renderFeatCard("featCard2", categories[5], categories[5].color, categories[5].emoji);

document.getElementById("catSearch").addEventListener("input", e => renderCategories(e.target.value));
