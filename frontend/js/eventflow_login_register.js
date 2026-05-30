      // Canvas BG
      const canvas = document.getElementById("bg");
      const ctx = canvas.getContext("2d");
      function resizeBg() {
        canvas.width = window.innerWidth;
        canvas.height = Math.max(
          700,
          document.getElementById("app").offsetHeight,
        );
      }
      resizeBg();

      const orbs = [
        { x: 180, y: 200, r: 280, c: "#FF3CAC", vx: 0.25, vy: 0.2 },
        { x: 500, y: 350, r: 320, c: "#784BA0", vx: -0.2, vy: 0.3 },
        { x: 300, y: 500, r: 200, c: "#2B86C5", vx: 0.15, vy: -0.25 },
      ];

      function drawBg() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        orbs.forEach((o) => {
          const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
          g.addColorStop(0, o.c + "1a");
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

      // Tab switching
      function switchTab(t) {
        document
          .querySelectorAll(".tab")
          .forEach((el, i) =>
            el.classList.toggle(
              "active",
              (t === "login" && i === 0) || (t === "register" && i === 1),
            ),
          );
        document
          .getElementById("panel-login")
          .classList.toggle("active", t === "login");
        document
          .getElementById("panel-register")
          .classList.toggle("active", t === "register");
      }

      // Toggle password visibility
      function togglePass(id, btn) {
        const inp = document.getElementById(id);
        const isText = inp.type === "text";
        inp.type = isText ? "password" : "text";
        btn.textContent = isText ? "👁" : "🙈";
      }

      // Role preview on left panel
      function previewRole(role) {
        document
          .querySelectorAll(".role-card")
          .forEach((c) => c.classList.remove("active"));
        event.currentTarget.classList.add("active");
      }

      // Register role selection
      let selectedRole = "user";
      const permsMap = {
        admin: {
          perms: [
            "Ver Tudo",
            "Gerir Utilizadores",
            "Gerir Eventos",
            "Ver Relatórios",
            "Configurações",
            "RBAC Control",
          ],
          colors: [
            "rgba(255,60,172,0.2)",
            "rgba(255,60,172,0.15)",
            "rgba(255,60,172,0.12)",
            "rgba(255,60,172,0.1)",
            "rgba(255,60,172,0.08)",
            "rgba(255,60,172,0.06)",
          ],
          tc: "#FF3CAC",
        },
        organizer: {
          perms: [
            "Criar Eventos",
            "Gerir Bilhetes",
            "Ver Relatórios",
            "Chat c/ Participantes",
            "Analytics",
          ],
          colors: [
            "rgba(120,75,160,0.2)",
            "rgba(120,75,160,0.15)",
            "rgba(120,75,160,0.12)",
            "rgba(120,75,160,0.1)",
            "rgba(120,75,160,0.08)",
          ],
          tc: "#a06edd",
        },
        user: {
          perms: [
            "Comprar Bilhetes",
            "Ver Eventos",
            "Gerir Perfil",
            "Favoritos",
            "Histórico",
          ],
          colors: [
            "rgba(43,134,197,0.2)",
            "rgba(43,134,197,0.15)",
            "rgba(43,134,197,0.12)",
            "rgba(43,134,197,0.1)",
            "rgba(43,134,197,0.08)",
          ],
          tc: "#5aabf0",
        },
      };

      function selectRole(role) {
        selectedRole = role;
        document.querySelectorAll(".rs-btn").forEach((b) => {
          b.className = "rs-btn";
        });
        document.getElementById("rb-" + role).classList.add("sel-" + role);
        const data = permsMap[role];
        const container = document.getElementById("ai-perms");
        container.innerHTML = data.perms
          .map(
            (p, i) =>
              `<span class="ai-perm" style="background:${data.colors[i]};color:${data.tc};border:1px solid ${data.tc}33">${p}</span>`,
          )
          .join("");
        document.getElementById("access-indicator").classList.add("show");
      }

      // Password strength
      function checkStrength(val) {
        const fill = document.getElementById("strength-fill");
        const hint = document.getElementById("strength-hint");
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        const levels = [
          { w: "0%", c: "transparent", t: "" },
          { w: "25%", c: "#ff4444", t: "Fraca" },
          { w: "50%", c: "#FF8C00", t: "Razoável" },
          { w: "75%", c: "#FFD700", t: "Boa" },
          { w: "100%", c: "#00c864", t: "Forte ✓" },
        ];
        const lv = levels[score];
        fill.style.width = lv.w;
        fill.style.background = lv.c;
        hint.style.color = lv.c;
        hint.textContent = lv.t;
      }

      function checkMatch() {
        const p1 = document.getElementById("r-pass").value;
        const p2 = document.getElementById("r-pass2").value;
        const hint = document.getElementById("match-hint");
        if (!p2) {
          hint.textContent = "";
          return;
        }
        if (p1 === p2) {
          hint.style.color = "#00c864";
          hint.textContent = "Passwords coincidem ✓";
        } else {
          hint.style.color = "#ff4444";
          hint.textContent = "Passwords não coincidem";
        }
      }

      function checkEmail(inp) {
        const hint = document.getElementById("email-hint");
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
        if (!inp.value) {
          hint.textContent = "";
          return;
        }
        hint.style.color = ok ? "#00c864" : "#ff4444";
        hint.textContent = ok ? "Email válido ✓" : "Formato inválido";
      }

      function validateLogin() {
        const email = document.getElementById('l-email').value.trim();
        const pass  = document.getElementById('l-pass').value;
        const btn   = document.querySelector('#panel-login .btn-submit');
        if (btn) btn.style.opacity = (email && pass) ? '1' : '0.5';
      }

      // Show toast
      function showToast(msg, type) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.className = "toast " + type + " show";
        setTimeout(() => t.classList.remove("show"), 3000);
      }

      async function doLogin() {
        const email = document.getElementById("l-email").value;
        const pass  = document.getElementById("l-pass").value;
        if (!email || !pass) { showToast("Preencha todos os campos", "error"); return; }
        showToast("A autenticar...", "success");
        try {
          const { user } = await AuthAPI.login(email, pass);
          const dest = user.role === "organizer" ? "eventflow_organizer_dashboard.html"
                     : user.role === "admin"     ? "eventflow_admin_dashboard.html"
                     :                             "eventflow_homepage.html";
          window.location.href = dest;
        } catch (err) {
          showToast(err.message || "Credenciais inválidas", "error");
        }
      }

      async function doRegister() {
        const fname = document.getElementById("r-fname").value;
        const lname = document.getElementById("r-lname") ? document.getElementById("r-lname").value : "";
        const email = document.getElementById("r-email").value;
        const pass  = document.getElementById("r-pass").value;
        const pass2 = document.getElementById("r-pass2").value;
        const terms = document.getElementById("r-terms").checked;
        if (!fname || !email || !pass) { showToast("Preencha todos os campos", "error"); return; }
        if (pass !== pass2) { showToast("Passwords não coincidem", "error"); return; }
        if (!terms) { showToast("Aceite os termos de serviço", "error"); return; }
        showToast("A criar conta...", "success");
        try {
          const { user } = await AuthAPI.register({ first_name: fname, last_name: lname || fname, email, password: pass, role: selectedRole });
          const dest = user.role === "organizer" ? "eventflow_organizer_dashboard.html"
                     : user.role === "admin"     ? "eventflow_admin_dashboard.html"
                     :                             "eventflow_homepage.html";
          window.location.href = dest;
        } catch (err) {
          showToast(err.message || "Erro ao criar conta", "error");
        }
      }
      // Init
      selectRole("user");