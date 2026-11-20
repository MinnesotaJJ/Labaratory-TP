let accessToken = null;
let timerId = null;

const loginCard = document.getElementById('loginCard');
const workspaceCard = document.getElementById('workspaceCard');
const loginAlert = document.getElementById('loginAlert');
const wsAlert = document.getElementById('wsAlert');
const accessTimer = document.getElementById('accessTimer');

function showAlert(el, text, type = 'danger') {
  el.textContent = text;
  el.className = `alert show alert-${type}`;
}

function startTimer(expUnix) {
  if (timerId) clearInterval(timerId);
  function tick() {
    const left = Math.max(0, expUnix - Math.floor(Date.now() / 1000));
    accessTimer.textContent = `Access TTL: ${left}с`;
    if (left === 0) {
      clearInterval(timerId);
      accessTimer.textContent = 'Access TTL: Истек (готов к ротации)';
    }
  }
  tick();
  timerId = setInterval(tick, 1000);
}

// Обертка fetch с прозрачным обновлением Access Token через HttpOnly Refresh Cookie
async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(url, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    const errData = await res.clone().json().catch(() => ({}));
    if (errData.code === 'ACCESS_EXPIRED' || !accessToken) {
      // Пытаемся обновить пару токенов через POST /api/refresh
      const refreshRes = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        accessToken = refreshData.accessToken;
        headers['Authorization'] = `Bearer ${accessToken}`;
        res = await fetch(url, { ...options, headers, credentials: 'include' });
      }
    }
  }
  return res;
}

async function loadWorkspace(silent = false) {
  const res = await authFetch('/api/workspace');
  const data = await res.json();

  if (!res.ok) {
    workspaceCard.hidden = true;
    loginCard.hidden = false;
    if (!silent) {
      showAlert(loginAlert, `Сессия неактивна (${res.status}): ${data.error}`, 'danger');
    }
    return false;
  }

  document.getElementById('wsUserName').textContent = data.user.fullName;
  document.getElementById('wsRole').textContent = data.user.role;
  document.getElementById('wsBalance').textContent = data.user.balance;
  document.getElementById('wsProjects').textContent = data.user.projects.join(', ');
  document.getElementById('wsJti').textContent = data.claims.jti;
  document.getElementById('accessTokenBox').textContent = accessToken;

  document.getElementById('rotationLogBody').innerHTML = data.rotationLog
    .map((r) => `<tr><td>${r.time}</td><td>${r.event}</td><td><code>${r.tokenPreview}</code></td><td><strong>${r.status}</strong></td></tr>`)
    .join('');

  loginCard.hidden = true;
  workspaceCard.hidden = false;
  startTimer(data.claims.exp);
  return true;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  loginAlert.className = 'alert';

  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ login, password })
  });
  const data = await res.json();

  if (!res.ok) {
    showAlert(loginAlert, `Ошибка (${res.status}): ${data.error}`, 'danger');
    return;
  }

  accessToken = data.accessToken;
  document.getElementById('password').value = '';
  await loadWorkspace();
  showAlert(wsAlert, data.message, 'success');
});

document.getElementById('fetchDataBtn').addEventListener('click', async () => {
  const ok = await loadWorkspace();
  if (ok) {
    showAlert(wsAlert, 'Данные успешно загружены (при истечении Access Token автоматически выполнена ротация Refresh Token).', 'success');
  }
});

document.getElementById('manualRotateBtn').addEventListener('click', async () => {
  const res = await fetch('/api/refresh', { method: 'POST', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) {
    showAlert(wsAlert, `Ошибка ротации (${res.status}): ${data.error}`, 'danger');
    return;
  }
  accessToken = data.accessToken;
  await loadWorkspace();
  showAlert(wsAlert, `${data.message} Новый Access Token и Refresh Token выпущены.`, 'success');
});

document.getElementById('unauthTestBtn').addEventListener('click', async () => {
  const res = await fetch('/api/workspace');
  const data = await res.json();
  showAlert(loginAlert, `Ответ сервера (${res.status}): ${data.error}`, 'danger');
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (timerId) clearInterval(timerId);
  const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  const data = await res.json();
  accessToken = null;
  workspaceCard.hidden = true;
  loginCard.hidden = false;
  showAlert(loginAlert, data.message, 'success');
});

// При обновлении страницы (F5) Access Token в памяти сбрасывается, но тихая ротация через HttpOnly Refresh Cookie восстанавливает сессию!
window.addEventListener('DOMContentLoaded', () => {
  loadWorkspace(true);
});
