// Токен хранится в памяти (в замыкании/переменной), а не в localStorage
let currentAccessToken = null;
let countdownInterval = null;

const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginAlert = document.getElementById('loginAlert');
const dashAlert = document.getElementById('dashAlert');
const jwtTimer = document.getElementById('jwtTimer');

function showAlert(el, msg, type = 'danger') {
  el.textContent = msg;
  el.className = `alert show alert-${type}`;
}

function parseJwtPayload(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function startCountdown(expUnix) {
  if (countdownInterval) clearInterval(countdownInterval);
  function tick() {
    const left = Math.max(0, expUnix - Math.floor(Date.now() / 1000));
    jwtTimer.textContent = `TTL: ${left} сек`;
    if (left === 0) {
      clearInterval(countdownInterval);
      showAlert(dashAlert, 'Срок действия JWT истек (exp). Нажмите «Обновить защищенные данные», чтобы увидеть отказ сервера (401).', 'warning');
    }
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

async function fetchProtectedData() {
  const res = await fetch('/api/protected', {
    headers: currentAccessToken ? { Authorization: `Bearer ${currentAccessToken}` } : {}
  });
  const data = await res.json();

  if (!res.ok) {
    showAlert(dashAlert, `Сервер отклонил запрос (${res.status}): ${data.error}`, 'danger');
    return false;
  }

  document.getElementById('userName').textContent = data.user.name;
  document.getElementById('userRole').textContent = data.user.role;
  document.getElementById('userDept').textContent = data.user.department;
  document.getElementById('decodedClaimsBox').textContent = JSON.stringify(data.tokenClaims, null, 2);
  document.getElementById('rawTokenBox').textContent = currentAccessToken;

  loginSection.hidden = true;
  dashboardSection.hidden = false;
  showAlert(dashAlert, `${data.message} (Время сервера: ${data.serverTime})`, 'success');
  startCountdown(data.tokenClaims.exp);
  return true;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginAlert.className = 'alert';

  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
  const data = await res.json();

  if (!res.ok) {
    showAlert(loginAlert, `Ошибка входа (${res.status}): ${data.error}`, 'danger');
    return;
  }

  currentAccessToken = data.accessToken;
  document.getElementById('password').value = '';
  await fetchProtectedData();
});

document.getElementById('callWithoutTokenBtn').addEventListener('click', async () => {
  const res = await fetch('/api/protected');
  const data = await res.json();
  showAlert(loginAlert, `Ответ сервера (${res.status}): ${data.error}`, 'danger');
});

document.getElementById('refreshProtectedBtn').addEventListener('click', () => {
  fetchProtectedData();
});

// Имитация атаки: злоумышленник меняет role на teacher в payload, не зная секретного ключа
document.getElementById('tamperTokenBtn').addEventListener('click', async () => {
  if (!currentAccessToken) return;
  const parts = currentAccessToken.split('.');
  const claims = parseJwtPayload(currentAccessToken);
  claims.role = 'teacher';
  const forgedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(claims))))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const tamperedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;

  const res = await fetch('/api/protected', {
    headers: { Authorization: `Bearer ${tamperedToken}` }
  });
  const data = await res.json();
  showAlert(dashAlert, `Проверка подписи сработала! (${res.status}): ${data.error}`, 'danger');
});

document.getElementById('teacherRouteBtn').addEventListener('click', async () => {
  const res = await fetch('/api/teacher-only', {
    headers: { Authorization: `Bearer ${currentAccessToken}` }
  });
  const data = await res.json();
  if (!res.ok) {
    showAlert(dashAlert, `Проверка роли на сервере (${res.status}): ${data.error}`, 'danger');
  } else {
    showAlert(dashAlert, `${data.message} — ${data.secretKeyNote}`, 'success');
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (countdownInterval) clearInterval(countdownInterval);
  const res = await fetch('/api/logout', {
    method: 'POST',
    headers: currentAccessToken ? { Authorization: `Bearer ${currentAccessToken}` } : {}
  });
  const data = await res.json();
  currentAccessToken = null;
  dashboardSection.hidden = true;
  loginSection.hidden = false;
  showAlert(loginAlert, data.message || 'Выход выполнен.', 'success');
});
