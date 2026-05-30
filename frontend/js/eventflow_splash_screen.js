  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    const rect = document.getElementById('splash').getBoundingClientRect();
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();

  // Canvas aurora background
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = 600;

  const orbs = [
    { x: canvas.width * 0.2, y: 200, r: 200, color: '#FF3CAC', vx: 0.3, vy: 0.2 },
    { x: canvas.width * 0.7, y: 300, r: 250, color: '#784BA0', vx: -0.2, vy: 0.3 },
    { x: canvas.width * 0.5, y: 100, r: 180, color: '#2B86C5', vx: 0.25, vy: -0.2 },
  ];

  function drawBg() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => {
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, o.color + '22');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      o.x += o.vx;
      o.y += o.vy;
      if (o.x < 0 || o.x > canvas.width) o.vx *= -1;
      if (o.y < 0 || o.y > canvas.height) o.vy *= -1;
    });
    requestAnimationFrame(drawBg);
  }
  drawBg();

  // Particles
  const pc = document.getElementById('particles');
  const colors = ['#FF3CAC', '#784BA0', '#2B86C5', '#ffffff'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    const delay = Math.random() * 8;
    const duration = Math.random() * 8 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      bottom: 0;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    pc.appendChild(p);
  }

  // Floating tags
  const ft = document.getElementById('floatingTags');
  const tags = ['Música Tradicional', 'Festivais de Praia', 'Arte Moçambicana', 'Gastronomia Local', 'Desporto Náutico', 'Teatro Comunitário', 'Cinema Africano', 'Festivais Culturais', 'Networking Empresarial', 'Workshops de Arte'];
  tags.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'tag';
    el.textContent = t;
    el.style.cssText = `
      left: ${Math.random() * 80 + 5}%;
      animation-duration: ${12 + Math.random() * 8}s;
      animation-delay: ${i * 1.5}s;
      font-size: ${9 + Math.random() * 4}px;
    `;
    ft.appendChild(el);
  });

  // Counter animation
  function animCount(el, target, suffix = '') {
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString('pt') + suffix;
      if (current >= target) clearInterval(timer);
    }, 30);
  }

  // Load real stats from API, fallback to defaults
  setTimeout(async () => {
    let s1 = 247, s2 = 12843, s3 = 3521;
    try {
      const res = await fetch((typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:3000/api') + '/events/stats');
      if (res.ok) {
        const data = await res.json();
        s1 = data.total_events  || s1;
        s2 = data.total_tickets || s2;
        s3 = data.total_users   || s3;
      }
    } catch {}
    animCount(document.getElementById('s1'), s1);
    animCount(document.getElementById('s2'), s2);
    animCount(document.getElementById('s3'), s3);
  }, 2200);

  function enterSite() {
  const splash = document.getElementById('splash');
  splash.style.transition = 'all 0.8s ease';
  splash.style.opacity = '0';
  splash.style.transform = 'scale(1.05)';
  setTimeout(() => {
    const token = localStorage.getItem('ef_token');
    window.location.href = token
      ? 'eventflow_homepage.html'
      : 'eventflow_login_register.html';
  }, 800);
}