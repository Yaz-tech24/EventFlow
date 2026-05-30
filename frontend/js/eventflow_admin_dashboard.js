// Role guard — admin only
(function() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
    window.location.href = 'eventflow_login_register.html';
    return;
  }
  const u = Auth.getUser();
  if (u?.role !== 'admin') {
    window.location.href = 'eventflow_homepage.html';
  }
})();

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function showSection(id, btn) {
  document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
  document.getElementById('sec-' + id).classList.remove('hidden');
  document.querySelectorAll('.sb-link').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else { const sb = document.querySelector(`.sb-link[data-section="${id}"]`); if (sb) sb.classList.add('active'); }
  window.scrollTo(0, 0);
}

// ── Static fallback data ──────────────────────────────────────────────
const alertsData = [
  { type: 'warn', ico: '⚠️', title: '3 eventos aguardam aprovação', desc: 'Revê e aprova antes da data de publicação' },
  { type: 'info', ico: 'ℹ️', title: '12 novos utilizadores esta semana', desc: 'Taxa de crescimento +18% vs semana anterior' },
  { type: 'ok',   ico: '✅', title: 'Backup diário concluído', desc: 'Todos os dados guardados às 03:00 de hoje' },
];

const reportsData = [
  { ico:'📊', name:'Relatório de Receitas', desc:'Análise completa de receitas, comissões e pagamentos por período.' },
  { ico:'👥', name:'Relatório de Utilizadores', desc:'Registos, crescimento, retenção e atividade dos utilizadores.' },
  { ico:'🎪', name:'Relatório de Eventos', desc:'Eventos publicados, vendas, ocupação e avaliações médias.' },
  { ico:'🎟️', name:'Relatório de Bilhetes', desc:'Vendas por tipo, evento, organizador e método de pagamento.' },
  { ico:'📈', name:'Análise de Crescimento', desc:'Tendências mensais de utilizadores, eventos e receita.' },
  { ico:'🌍', name:'Relatório Geográfico', desc:'Distribuição de utilizadores e eventos por cidade/região.' },
];

// ── Renders ───────────────────────────────────────────────────────────
function renderAlerts() {
  const el = document.getElementById('systemAlerts');
  if (!el) return;
  el.innerHTML = alertsData.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-ico">${a.ico}</div>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
      </div>
    </div>
  `).join('');
}

function renderUsersTable(users) {
  const el = document.getElementById('usersTableBody');
  if (!el) return;
  el.innerHTML = users.map(u => {
    const av = (u.first_name?.[0] || '') + (u.last_name?.[0] || '');
    const name = `${u.first_name} ${u.last_name}`;
    const isActive = u.is_active !== 0;
    return `<tr>
      <td><div class="user-cell"><div class="user-av">${av.toUpperCase()}</div>${name}</div></td>
      <td style="color:rgba(255,255,255,0.5);font-size:11px">${u.email}</td>
      <td><span class="role-tag ${u.role}">${u.role}</span></td>
      <td style="color:rgba(255,255,255,0.45)">${u.created_at?.slice(0,10) || '—'}</td>
      <td style="font-weight:600">—</td>
      <td><span class="${isActive ? 'status-active' : 'status-suspended'}">${isActive ? '● Ativo' : '⏸ Suspenso'}</span></td>
      <td>
        <button class="tbl-action" onclick="toggleUserStatus(${u.id}, ${isActive})">${isActive ? 'Suspender' : 'Ativar'}</button>
      </td>
    </tr>`;
  }).join('');
}

function renderEventsTable(events) {
  const el = document.getElementById('eventsTableBody');
  if (!el) return;
  el.innerHTML = events.map(e => `<tr>
    <td><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">${e.emoji || '🎪'}</span>${e.title}</div></td>
    <td style="color:rgba(255,255,255,0.5)">${e.org_name || e.organizer_name || '—'}</td>
    <td style="color:rgba(255,255,255,0.5)">${e.date_start || '—'}</td>
    <td style="font-weight:600">${e.total_sold || 0}</td>
    <td style="font-weight:600;color:#00d68f">—</td>
    <td><span class="${e.status === 'published' ? 'ev-pub' : e.status === 'pending' ? 'ev-pend' : 'ev-canc'}">${e.status === 'published' ? '✓ Publicado' : e.status === 'pending' ? '⏳ Pendente' : '✕ Cancelado'}</span></td>
    <td>
      ${e.status === 'pending' ? `<button class="tbl-action" style="color:#00d68f;border-color:rgba(0,214,143,0.3)" onclick="approveEvent(${e.id}, this)">Aprovar</button>` : ''}
      ${e.status === 'pending' ? `<button class="tbl-action danger" onclick="rejectEvent(${e.id}, this)">Rejeitar</button>` : ''}
      <button class="tbl-action danger" onclick="deleteEvent(${e.id}, this)">Remover</button>
    </td>
  </tr>`).join('');
}

function renderPendingEvents(events) {
  const el = document.getElementById('pendingEvents');
  if (!el) return;
  if (!events.length) {
    el.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:12px;padding:12px 0">Nenhum evento pendente</div>';
    return;
  }
  el.innerHTML = events.map(e => `
    <div class="pe-item">
      <div class="pe-emoji">${e.emoji || '🎪'}</div>
      <div class="pe-info">
        <div class="pe-name">${e.title}</div>
        <div class="pe-org">${e.org_name || e.organizer_name || '—'}</div>
      </div>
      <div class="pe-actions">
        <button class="pe-btn ok" onclick="approveEvent(${e.id}, this)">✓ Aprovar</button>
        <button class="pe-btn no" onclick="rejectEvent(${e.id}, this)">✕</button>
      </div>
    </div>
  `).join('');
}

function renderRecentUsers(users) {
  const el = document.getElementById('recentUsers');
  if (!el) return;
  const recent = users.slice(0, 5);
  el.innerHTML = `<table class="admin-table" style="border:none">
    <thead><tr><th>Utilizador</th><th>Papel</th><th>Registado</th><th>Estado</th></tr></thead>
    <tbody>${recent.map(u => {
      const av = (u.first_name?.[0] || '') + (u.last_name?.[0] || '');
      return `<tr>
        <td><div class="user-cell"><div class="user-av">${av.toUpperCase()}</div>${u.first_name} ${u.last_name}</div></td>
        <td><span class="role-tag ${u.role}">${u.role}</span></td>
        <td style="color:rgba(255,255,255,0.45)">${u.created_at?.slice(0,10) || '—'}</td>
        <td><span class="${u.is_active !== 0 ? 'status-active' : 'status-suspended'}">${u.is_active !== 0 ? '● Ativo' : '⏸ Suspenso'}</span></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

function renderOrganizersAdmin(orgs) {
  const el = document.getElementById('orgAdminGrid');
  if (!el) return;
  el.innerHTML = orgs.map(o => `
    <div class="oa-card">
      <div class="oa-top">
        <div class="oa-emoji">${o.emoji || '🎪'}</div>
        <div>
          <div class="oa-name">${o.org_name}</div>
          <div class="oa-cat">${o.category || '—'}</div>
          ${o.verified ? '<div class="oa-verified">✅ Verificado</div>' : '<div style="font-size:10px;color:rgba(255,140,0,0.7);margin-top:2px">⏳ Pendente verificação</div>'}
        </div>
      </div>
      <div class="oa-stats">
        <div><div class="oa-stat-n">${o.total_events || 0}</div><div class="oa-stat-l">EVENTOS</div></div>
        <div><div class="oa-stat-n">${o.avg_rating ? o.avg_rating + '★' : '—'}</div><div class="oa-stat-l">RATING</div></div>
      </div>
      <div class="oa-actions">
        ${!o.verified ? `<button class="oa-btn verify" onclick="verifyOrganizer(${o.id}, this)">✓ Verificar</button>` : `<button class="oa-btn view" disabled style="opacity:.4">✅ Verificado</button>`}
      </div>
    </div>
  `).join('');
}

function renderRevChart(monthly) {
  const el = document.getElementById('revChart');
  if (!el) return;
  if (!monthly || !monthly.length) {
    el.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:12px;padding:20px">Sem dados de receita</div>';
    return;
  }
  const max = Math.max(...monthly.map(d => d.revenue || 0), 1);
  el.innerHTML = monthly.slice(0, 6).reverse().map(d => {
    const h = Math.round(((d.revenue || 0) / max) * 120);
    const label = d.month ? d.month.slice(5) : '—';
    return `<div class="rc-bar-group">
      <div class="rc-bar" style="height:${h}px" title="MT ${(d.revenue || 0).toLocaleString('pt')}">
        <span class="rc-val">MT ${Math.round((d.revenue || 0)/1000)}K</span>
      </div>
      <div class="rc-lbl">${label}</div>
    </div>`;
  }).join('');
}

function renderReports() {
  const el = document.getElementById('reportsGrid');
  if (!el) return;
  el.innerHTML = reportsData.map((r, i) => `
    <div class="report-card">
      <div class="rc-icon">${r.ico}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-desc">${r.desc}</div>
      <button class="rc-btn" onclick="exportCSV(${i})">⬇ Exportar CSV</button>
    </div>
  `).join('');
}

// ── API Actions ───────────────────────────────────────────────────────
async function approveEvent(id, btn) {
  if (btn) btn.disabled = true;
  try {
    await AdminAPI.approveEvent(id);
    showToast('✅ Evento aprovado e publicado!');
    loadAdminData();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erro ao aprovar evento'));
    if (btn) btn.disabled = false;
  }
}

async function rejectEvent(id, btn) {
  const reason = prompt('Motivo da rejeição (opcional):') || '';
  if (reason === null) return;
  if (btn) btn.disabled = true;
  try {
    await AdminAPI.rejectEvent(id, reason);
    showToast('Evento rejeitado. Organizador notificado.');
    loadAdminData();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erro ao rejeitar evento'));
    if (btn) btn.disabled = false;
  }
}

async function deleteEvent(id, btn) {
  if (!confirm('Tens a certeza que queres eliminar este evento? Esta ação é irreversível.')) return;
  if (btn) btn.disabled = true;
  try {
    await AdminAPI.deleteEvent(id);
    showToast('Evento eliminado');
    loadAdminData();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erro ao eliminar evento'));
    if (btn) btn.disabled = false;
  }
}

async function toggleUserStatus(id, currentlyActive) {
  const action = currentlyActive ? 'suspender' : 'ativar';
  if (!confirm(`Tens a certeza que queres ${action} este utilizador?`)) return;
  try {
    await AdminAPI.setUserStatus(id, !currentlyActive);
    showToast(currentlyActive ? 'Utilizador suspenso' : 'Utilizador ativado');
    loadAdminData();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erro ao alterar estado do utilizador'));
  }
}

async function verifyOrganizer(id, btn) {
  if (btn) btn.disabled = true;
  try {
    await AdminAPI.verifyOrganizer(id);
    showToast('✅ Organizador verificado!');
    loadAdminData();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erro ao verificar organizador'));
    if (btn) btn.disabled = false;
  }
}

function searchUsersAdmin(q) {
  if (typeof _cachedUsers !== 'undefined') {
    const filtered = _cachedUsers.filter(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase())
    );
    renderUsersTable(filtered);
  }
}

function filterUsersByRole(role) {
  if (typeof _cachedUsers !== 'undefined') {
    const filtered = role === 'todos' ? _cachedUsers : _cachedUsers.filter(u => u.role === role);
    renderUsersTable(filtered);
  }
}

// ── API Load ──────────────────────────────────────────────────────────
let _cachedUsers = [];

async function loadAdminData() {
  try {
    // Stats
    const stats = await AdminAPI.stats();
    const statEls = document.querySelectorAll('.admin-kpi-num');
    if (statEls[0]) statEls[0].textContent = (stats.total_users || 0).toLocaleString('pt');
    if (statEls[1]) statEls[1].textContent = (stats.total_events || 0).toLocaleString('pt');
    if (statEls[2]) statEls[2].textContent = (stats.total_tickets || 0).toLocaleString('pt');
    if (statEls[3]) statEls[3].textContent = 'MT ' + ((stats.total_revenue || 0) / 1000).toFixed(0) + 'K';

    // Pending count badge
    const pendingBadge = document.querySelector('.sb-link[data-section="eventos"] .sbl-badge');
    if (pendingBadge) pendingBadge.textContent = stats.pending_events || 0;
  } catch {}

  try {
    const pendingRes = await AdminAPI.events({ status: 'pending', limit: 10 });
    renderPendingEvents(pendingRes.events || []);
  } catch {}

  try {
    const usersRes = await AdminAPI.users({ limit: 50 });
    _cachedUsers = usersRes.users || [];
    renderRecentUsers(_cachedUsers);
    renderUsersTable(_cachedUsers);
  } catch {}

  try {
    const eventsRes = await AdminAPI.events({ limit: 50 });
    renderEventsTable(eventsRes.events || []);
  } catch {}

  try {
    const orgsRes = await AdminAPI.organizers({ limit: 20 });
    renderOrganizersAdmin(orgsRes.organizers || []);
  } catch {}

  try {
    const rev = await AdminAPI.revenue();
    renderRevChart(rev.monthly || []);
  } catch {}
}

// ── CSV Export ────────────────────────────────────────────────────────
function downloadCSV(filename, headers, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function exportCSV(idx) {
  const btn = document.querySelectorAll('.rc-btn')[idx];
  if (btn) { btn.disabled = true; btn.textContent = 'A gerar...'; }
  try {
    if (idx === 0) {
      // Receitas — monthly revenue
      const data = await AdminAPI.revenue();
      const rows = (data.monthly || []).map(d => [d.month || '—', d.revenue || 0, d.orders || 0]);
      downloadCSV('receitas.csv', ['Mês', 'Receita (MT)', 'Ordens'], rows);
    } else if (idx === 1) {
      // Utilizadores
      const data = await AdminAPI.users({ limit: 500 });
      const rows = (data.users || []).map(u => [u.id, u.first_name, u.last_name, u.email, u.role, u.city || '—', u.created_at?.slice(0,10) || '—', u.is_active ? 'Ativo' : 'Suspenso']);
      downloadCSV('utilizadores.csv', ['ID', 'Nome', 'Apelido', 'Email', 'Papel', 'Cidade', 'Registo', 'Estado'], rows);
    } else if (idx === 2) {
      // Eventos
      const data = await AdminAPI.events({ limit: 500 });
      const rows = (data.events || []).map(e => [e.id, e.title, e.category, e.status, e.date_start?.slice(0,10) || '—', e.city || '—', e.total_sold || 0, e.total_capacity || 0]);
      downloadCSV('eventos.csv', ['ID', 'Título', 'Categoria', 'Estado', 'Data', 'Cidade', 'Vendidos', 'Capacidade'], rows);
    } else if (idx === 3) {
      // Bilhetes — use events revenue as proxy
      const data = await AdminAPI.events({ limit: 500 });
      const rows = (data.events || []).map(e => [e.id, e.title, e.total_sold || 0, e.revenue || 0]);
      downloadCSV('bilhetes.csv', ['Evento ID', 'Evento', 'Bilhetes Vendidos', 'Receita (MT)'], rows);
    } else {
      showToast('Relatório em desenvolvimento — brevemente disponível');
      return;
    }
    showToast('CSV exportado com sucesso!');
  } catch (err) {
    showToast('Erro ao exportar: ' + (err.message || 'tenta novamente'));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Exportar CSV'; }
  }
}

// ── Init ──────────────────────────────────────────────────────────────
renderAlerts();
renderReports();
showSection('overview', null);
loadAdminData();
