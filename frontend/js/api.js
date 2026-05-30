/**
 * EventFlow API Client
 * Partilhado por todas as páginas do frontend.
 * Inclui este ficheiro ANTES do JS específico de cada página.
 */

const API_BASE = 'http://localhost:3000/api';

// ── Token storage ─────────────────────────────────────────────────────
const Auth = {
  getToken:    ()  => localStorage.getItem('ef_token'),
  setToken:    (t) => localStorage.setItem('ef_token', t),
  removeToken: ()  => localStorage.removeItem('ef_token'),
  getUser:     ()  => { try { return JSON.parse(localStorage.getItem('ef_user')); } catch { return null; } },
  setUser:     (u) => localStorage.setItem('ef_user', JSON.stringify(u)),
  removeUser:  ()  => localStorage.removeItem('ef_user'),
  isLoggedIn:  ()  => !!localStorage.getItem('ef_token'),
  logout: () => {
    localStorage.removeItem('ef_token');
    localStorage.removeItem('ef_user');
    window.location.href = 'eventflow_login_register.html';
  },
};

// ── Core fetch wrapper ────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error || `HTTP ${res.status}`, res.status);
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Servidor indisponível. A usar dados locais.', 0);
  }
}

class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

// ── Auth endpoints ────────────────────────────────────────────────────
const AuthAPI = {
  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    Auth.setToken(data.token);
    Auth.setUser(data.user);
    return data;
  },

  async register(payload) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    Auth.setToken(data.token);
    Auth.setUser(data.user);
    return data;
  },

  async me() {
    const data = await apiFetch('/auth/me');
    Auth.setUser(data);
    return data;
  },

  async changePassword(current_password, new_password) {
    return apiFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  async forgotPassword(email) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token, new_password) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
  },

  async refresh() {
    const data = await apiFetch('/auth/refresh', { method: 'POST' });
    if (data.token) Auth.setToken(data.token);
    return data;
  },
};

// ── Events endpoints ──────────────────────────────────────────────────
const EventsAPI = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/events${qs ? '?' + qs : ''}`);
  },
  get(id)    { return apiFetch(`/events/${id}`); },
  stats()    { return apiFetch('/events/stats'); },
  create(payload) { return apiFetch('/events', { method:'POST', body: JSON.stringify(payload) }); },
  update(id, payload) { return apiFetch(`/events/${id}`, { method:'PUT', body: JSON.stringify(payload) }); },
  remove(id) { return apiFetch(`/events/${id}`, { method:'DELETE' }); },
  setStatus(id, status) { return apiFetch(`/events/${id}/status`, { method:'PATCH', body: JSON.stringify({ status }) }); },
};

// ── Tickets endpoints ─────────────────────────────────────────────────
const TicketsAPI = {
  purchase(payload) { return apiFetch('/tickets/purchase', { method:'POST', body: JSON.stringify(payload) }); },
  cancel(orderId)   { return apiFetch(`/tickets/${orderId}/cancel`, { method:'POST' }); },
  myTickets(status) { return apiFetch(`/tickets/my${status ? '?status='+status : ''}`); },
  getQR(orderId)    { return apiFetch(`/tickets/${orderId}/qr`); },
  validate(qrCode)  { return apiFetch(`/tickets/validate/${qrCode}`); },
};

// ── User endpoints ────────────────────────────────────────────────────
const UsersAPI = {
  stats()          { return apiFetch('/users/me/stats'); },
  update(payload)  { return apiFetch('/users/me', { method:'PUT', body: JSON.stringify(payload) }); },
  updateOrganizer(payload) { return apiFetch('/users/me/organizer', { method:'PUT', body: JSON.stringify(payload) }); },
  history()        { return apiFetch('/users/me/history'); },
  deactivate()     { return apiFetch('/users/me', { method:'DELETE' }); },
  uploadAvatar(file) {
    const fd = new FormData();
    fd.append('avatar', file);
    return apiFetch('/users/me/avatar', {
      method: 'POST',
      headers: {},
      body: fd,
    });
  },
};

// ── Notifications endpoints ───────────────────────────────────────────
const NotificationsAPI = {
  list(unread_only = false) { return apiFetch(`/notifications${unread_only ? '?unread_only=1' : ''}`); },
  markRead(id)   { return apiFetch(`/notifications/${id}/read`, { method:'PATCH' }); },
  markAllRead()  { return apiFetch('/notifications/read-all', { method:'PATCH' }); },
  remove(id)     { return apiFetch(`/notifications/${id}`, { method:'DELETE' }); },
  clearAll()     { return apiFetch('/notifications', { method:'DELETE' }); },
};

// ── Favorites endpoints ───────────────────────────────────────────────
const FavoritesAPI = {
  list()          { return apiFetch('/favorites'); },
  add(eventId)    { return apiFetch(`/favorites/${eventId}`, { method:'POST' }); },
  remove(eventId) { return apiFetch(`/favorites/${eventId}`, { method:'DELETE' }); },
  check(eventId)  { return apiFetch(`/favorites/${eventId}/check`); },
};

// ── Reviews endpoints ─────────────────────────────────────────────────
const ReviewsAPI = {
  forEvent(eventId) { return apiFetch(`/reviews/event/${eventId}`); },
  submit(payload)   { return apiFetch('/reviews', { method:'POST', body: JSON.stringify(payload) }); },
  remove(id)        { return apiFetch(`/reviews/${id}`, { method:'DELETE' }); },
};

// ── Organizer endpoints ───────────────────────────────────────────────
const OrganizerAPI = {
  list(params = {}) { return apiFetch('/organizer?' + new URLSearchParams(params)); },
  stats()   { return apiFetch('/organizer/stats'); },
  events(status) { return apiFetch(`/organizer/events${status ? '?status='+status : ''}`); },
  tickets() { return apiFetch('/organizer/tickets'); },
  revenue() { return apiFetch('/organizer/revenue'); },
  uploadEventImage(eventId, file) {
    const fd = new FormData();
    fd.append('image', file);
    return apiFetch(`/organizer/events/${eventId}/image`, {
      method: 'POST',
      headers: {},
      body: fd,
    });
  },
};

// ── Admin endpoints ───────────────────────────────────────────────────
const AdminAPI = {
  stats()               { return apiFetch('/admin/stats'); },
  users(params = {})    { return apiFetch('/admin/users?' + new URLSearchParams(params)); },
  organizers(params = {}) { return apiFetch('/admin/organizers?' + new URLSearchParams(params)); },
  setUserStatus(id, is_active) { return apiFetch(`/admin/users/${id}/status`, { method:'PATCH', body: JSON.stringify({ is_active }) }); },
  setUserRole(id, role) { return apiFetch(`/admin/users/${id}/role`, { method:'PATCH', body: JSON.stringify({ role }) }); },
  events(params = {})   { return apiFetch('/admin/events?' + new URLSearchParams(params)); },
  approveEvent(id)      { return apiFetch(`/admin/events/${id}/approve`, { method:'PATCH' }); },
  rejectEvent(id, reason) { return apiFetch(`/admin/events/${id}/reject`, { method:'PATCH', body: JSON.stringify({ reason }) }); },
  deleteEvent(id)       { return apiFetch(`/admin/events/${id}`, { method:'DELETE' }); },
  verifyOrganizer(id)   { return apiFetch(`/admin/organizers/${id}/verify`, { method:'PATCH' }); },
  revenue()             { return apiFetch('/admin/revenue'); },
};

// ── Nav badge (unread count) ──────────────────────────────────────────
async function updateNotifBadge() {
  if (!Auth.isLoggedIn()) return;
  try {
    const { unread_count } = await NotificationsAPI.list(true);
    document.querySelectorAll('.notif-dot').forEach(dot => {
      dot.style.display = unread_count > 0 ? 'block' : 'none';
    });
  } catch {}
}

// ── On load: update nav based on auth state ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNotifBadge();

  // Replace "Entrar" button with user avatar if logged in
  const user = Auth.getUser();
  if (user) {
    document.querySelectorAll('.btn-ghost').forEach(btn => {
      if (btn.textContent.trim() === 'Entrar') {
        const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '');
        btn.outerHTML = `<div class="nav-avatar" onclick="window.location.href='eventflow_profile.html'" style="cursor:pointer" title="${user.first_name} ${user.last_name}">${initials.toUpperCase()}</div>`;
      }
    });
  }
});
