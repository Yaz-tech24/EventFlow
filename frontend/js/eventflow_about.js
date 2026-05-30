// Canvas Hero
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
resize();
const orbs = [
  { x: 300, y: 180, r: 280, c: "#FF3CAC", vx: 0.3, vy: 0.2 },
  { x: 700, y: 220, r: 320, c: "#784BA0", vx: -0.2, vy: 0.25 },
  { x: 500, y: 320, r: 200, c: "#2B86C5", vx: 0.2, vy: -0.2 },
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

// Canvas Org
const orgCanvas = document.getElementById("bgOrg");
const orgCtx = orgCanvas.getContext("2d");
function resizeOrg() { orgCanvas.width = orgCanvas.parentElement.offsetWidth; orgCanvas.height = orgCanvas.parentElement.offsetHeight; }
resizeOrg();
const orgOrbs = [
  { x: 100, y: 100, r: 200, c: "#784BA0", vx: 0.2, vy: 0.15 },
  { x: 600, y: 150, r: 240, c: "#FF3CAC", vx: -0.2, vy: 0.2 },
];
function drawOrgBg() {
  orgCtx.fillStyle = "#06060f"; orgCtx.fillRect(0, 0, orgCanvas.width, orgCanvas.height);
  orgOrbs.forEach(o => {
    const g = orgCtx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, o.c + "14"); g.addColorStop(1, "transparent");
    orgCtx.beginPath(); orgCtx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    orgCtx.fillStyle = g; orgCtx.fill();
    o.x += o.vx; o.y += o.vy;
    if (o.x < 0 || o.x > orgCanvas.width) o.vx *= -1;
    if (o.y < 0 || o.y > orgCanvas.height) o.vy *= -1;
  });
  requestAnimationFrame(drawOrgBg);
}
drawOrgBg();

// Animated counters
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || (target > 100 ? "+" : "");
  const duration = 1800;
  const step = duration / 60;
  let current = 0;
  const inc = target / (duration / step);
  const timer = setInterval(() => {
    current = Math.min(current + inc, target);
    let display = Math.floor(current);
    if (target >= 1000) display = (display / 1000).toFixed(1) + "K";
    if (target === 49) display = (current / 10).toFixed(1);
    el.textContent = display + suffix;
    if (current >= target) clearInterval(timer);
  }, step);
}
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); observer.unobserve(e.target); }});
}, { threshold: 0.5 });
document.querySelectorAll(".stat-num[data-target]").forEach(el => observer.observe(el));

// Team
const team = [
  { emoji: "👑", name: "Carlos Macie", role: "CEO & Fundador", bio: "Visionário da cena de eventos em Moçambique", color: "#FF3CAC" },
  { emoji: "⚙️", name: "Ana Tembe", role: "CTO", bio: "Engenheira com 8 anos de experiência em plataformas digitais", color: "#784BA0" },
  { emoji: "🎨", name: "João Mondlane", role: "Design Lead", bio: "Designer especializado em experiências digitais", color: "#2B86C5" },
  { emoji: "📈", name: "Fátima Chissano", role: "Growth Manager", bio: "Responsável pelo crescimento e parcerias", color: "#FF8C00" },
  { emoji: "🛡️", name: "Pedro Nhantumbo", role: "Segurança & Pagamentos", bio: "Especialista em sistemas de pagamento seguros", color: "#4CAF50" },
  { emoji: "🎯", name: "Lúcia Sitoe", role: "Customer Success", bio: "Garante que organizadores e participantes adoram a plataforma", color: "#9B59B6" },
];
document.getElementById("teamGrid").innerHTML = team.map((t, i) => `
  <div class="team-card" style="--tc-color:${t.color};animation-delay:${i * 0.08}s">
    <div class="tc-avatar">${t.emoji}</div>
    <div class="tc-name">${t.name}</div>
    <div class="tc-role">${t.role}</div>
    <div class="tc-bio">${t.bio}</div>
  </div>
`).join("");

// FAQ
const faqs = [
  { q: "Como compro bilhetes na EventFlow?", a: "Escolhe um evento, seleciona o tipo de bilhete e quantidade, preenche os teus dados e efetua o pagamento. Recebes o teu bilhete digital por email de imediato." },
  { q: "Quais métodos de pagamento são aceites?", a: "Aceitamos M-Pesa, cartão de crédito/débito (Visa e Mastercard) e pagamento por referência ATM (Multicaixa)." },
  { q: "Posso obter reembolso se não puder ir ao evento?", a: "Sim. Para a maioria dos eventos, podes solicitar reembolso até 48h antes do início. O prazo exato depende da política do organizador, indicada na página do evento." },
  { q: "Como me torno organizador na EventFlow?", a: "Regista-te com o perfil de 'Organizador', verifica a tua identidade e já podes criar eventos. O processo leva menos de 10 minutos." },
  { q: "O bilhete é seguro? Como funciona a verificação?", a: "Cada bilhete tem um QR code único e encriptado. Na entrada do evento, o staff da EventFlow ou do organizador valida o QR code com a nossa app. Um bilhete só pode ser usado uma vez." },
  { q: "E se o evento for cancelado?", a: "Em caso de cancelamento pelo organizador, recebes reembolso automático integral no prazo de 5 a 10 dias úteis." },
];
document.getElementById("faqList").innerHTML = faqs.map((f, i) => `
  <div class="faq-item" onclick="toggleFaq(this)">
    <div class="faq-q">${f.q}<span class="faq-arrow">▼</span></div>
    <div class="faq-a">${f.a}</div>
  </div>
`).join("");

function toggleFaq(el) {
  el.classList.toggle("open");
}

async function submitContact(btn) {
  const name    = document.getElementById('cf-name')?.value?.trim();
  const email   = document.getElementById('cf-email')?.value?.trim();
  const subject = document.getElementById('cf-subject')?.value;
  const message = document.getElementById('cf-message')?.value?.trim();

  if (!name || !email || !message) {
    alert('Por favor preenche o nome, email e mensagem.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'A enviar...';

  try {
    const base = typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:3000/api';
    await fetch(`${base}/users/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });
  } catch { /* silent — show success regardless */ }

  btn.textContent = 'ENVIADO ✓';
  btn.style.background = 'linear-gradient(135deg,#4CAF50,#2E7D32)';
  document.getElementById('cf-name').value = '';
  document.getElementById('cf-email').value = '';
  document.getElementById('cf-message').value = '';
  setTimeout(() => {
    btn.textContent = 'ENVIAR MENSAGEM →';
    btn.style.background = '';
    btn.disabled = false;
  }, 3000);
}
