// Canvas BG
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener("resize", resize);
const orbs = [
  { x: 400, y: 200, r: 300, c: "#FF3CAC", vx: 0.3, vy: 0.2 },
  { x: 800, y: 300, r: 350, c: "#784BA0", vx: -0.2, vy: 0.25 },
  { x: 200, y: 400, r: 250, c: "#2B86C5", vx: 0.2, vy: -0.2 },
];
function drawBg() {
  ctx.fillStyle = "#06060f"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  orbs.forEach(o => {
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, o.c + "14"); g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    o.x += o.vx; o.y += o.vy;
    if (o.x < 0 || o.x > canvas.width) o.vx *= -1;
    if (o.y < 0 || o.y > canvas.height) o.vy *= -1;
  });
  requestAnimationFrame(drawBg);
}
drawBg();

// Step navigation
let currentStep = 1;
let timerInterval;

function setStep(n) {
  [1,2,3,4].forEach(i => {
    document.getElementById("step" + i).classList.toggle("hidden", i !== n);
  });
  [1,2,3].forEach(i => {
    const el = document.getElementById("lp-s" + i);
    if (el) {
      el.classList.toggle("active", i === n);
      el.classList.toggle("done", i < n);
    }
  });
  currentStep = n;
}

function goStep1() { setStep(1); if (timerInterval) clearInterval(timerInterval); }

let _resetToken = '';
let _resetEmail = '';

async function goStep2() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email || !email.includes("@")) {
    document.getElementById("emailInput").style.borderColor = "rgba(244,67,54,0.6)";
    return;
  }
  document.getElementById("emailInput").style.borderColor = "";

  const btn = document.querySelector('[onclick="goStep2()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'A enviar...'; }

  try {
    const res = await AuthAPI.forgotPassword(email);
    _resetEmail = email;
    // In dev mode the token is returned directly
    if (res.dev_token) {
      _resetToken = res.dev_token;
      // Auto-fill token digits for dev convenience
      const tokenDigits = _resetToken.slice(0, 6);
      setTimeout(() => {
        const digits = document.querySelectorAll(".code-digit");
        tokenDigits.split("").forEach((d, i) => {
          if (digits[i]) { digits[i].value = d; digits[i].classList.add("filled"); }
        });
      }, 600);
    }
  } catch {
    // Still proceed — don't reveal if email exists
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar Código →'; }
  }

  document.getElementById("codeSubtext").textContent = `Introduz o token de recuperação enviado para ${email}.`;
  setStep(2);
  startTimer();
}

function goStep3() {
  const digits = [...document.querySelectorAll(".code-digit")].map(d => d.value);
  if (digits.some(d => !d)) {
    document.querySelectorAll(".code-digit").forEach(d => { if (!d.value) d.style.borderColor = "rgba(244,67,54,0.6)"; });
    return;
  }
  // Capture token from digit inputs if not already set from API response
  if (!_resetToken) _resetToken = digits.join('');
  if (timerInterval) clearInterval(timerInterval);
  setStep(3);
}

async function goSuccess() {
  const pass = document.getElementById("newPass").value;
  const conf = document.getElementById("confirmPass").value;
  if (pass.length < 8 || pass !== conf) return;

  // Use the token collected from step 2 digit inputs
  const digits = [...document.querySelectorAll(".code-digit")].map(d => d.value).join('');
  const token = _resetToken || digits;

  if (!token) {
    alert('Token inválido. Volta ao passo anterior.');
    return;
  }

  const btn = document.querySelector('[onclick="goSuccess()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'A redefinir...'; }

  try {
    await AuthAPI.resetPassword(token, pass);
    setStep(4);
  } catch (err) {
    alert(err.message || 'Token inválido ou expirado. Tenta novamente.');
    if (btn) { btn.disabled = false; btn.textContent = 'Redefinir Password →'; }
  }
}

// Timer countdown
function startTimer() {
  let secs = 60;
  document.getElementById("timerCount").textContent = secs;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secs--;
    document.getElementById("timerCount").textContent = secs;
    if (secs <= 0) {
      clearInterval(timerInterval);
      document.getElementById("codeTimer").innerHTML = '<span style="color:var(--pink);cursor:pointer" onclick="startTimer()">Reenviar código</span>';
    }
  }, 1000);
}

// Code digit auto-advance
document.querySelectorAll(".code-digit").forEach((input, i, all) => {
  input.addEventListener("input", () => {
    input.classList.toggle("filled", !!input.value);
    if (input.value && i < all.length - 1) all[i + 1].focus();
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Backspace" && !input.value && i > 0) all[i - 1].focus();
  });
});

// Password strength
function checkStrength(val) {
  const fill = document.getElementById("strengthFill");
  const label = document.getElementById("strengthLabel");
  document.getElementById("r-len").classList.toggle("ok", val.length >= 8);
  document.getElementById("r-num").classList.toggle("ok", /\d/.test(val));
  document.getElementById("r-sym").classList.toggle("ok", /[^a-zA-Z0-9]/.test(val));
  document.getElementById("r-len").textContent = (val.length >= 8 ? "✓" : "✕") + " Mínimo 8 caracteres";
  document.getElementById("r-num").textContent = (/\d/.test(val) ? "✓" : "✕") + " Pelo menos um número";
  document.getElementById("r-sym").textContent = (/[^a-zA-Z0-9]/.test(val) ? "✓" : "✕") + " Pelo menos um símbolo";
  let strength = 0;
  if (val.length >= 8) strength++;
  if (/\d/.test(val)) strength++;
  if (/[^a-zA-Z0-9]/.test(val)) strength++;
  if (val.length >= 12) strength++;
  const pct = (strength / 4) * 100;
  const colors = ["#f44336","#FF8C00","#FFB800","#4CAF50"];
  const labels = ["Fraca","Razoável","Boa","Forte"];
  fill.style.width = pct + "%";
  fill.style.background = colors[Math.max(0, strength - 1)] || "#f44336";
  label.textContent = val ? labels[Math.max(0, strength - 1)] : "";
  label.style.color = colors[Math.max(0, strength - 1)] || "";
  checkMatch();
}

function checkMatch() {
  const pass = document.getElementById("newPass").value;
  const conf = document.getElementById("confirmPass").value;
  const hint = document.getElementById("matchHint");
  if (!conf) { hint.textContent = ""; return; }
  if (pass === conf) {
    hint.textContent = "✓ Passwords coincidem";
    hint.className = "match-hint match-ok";
  } else {
    hint.textContent = "✕ Passwords não coincidem";
    hint.className = "match-hint match-no";
  }
}

function togglePwd(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
  btn.style.opacity = input.type === "text" ? "1" : "0.4";
}
