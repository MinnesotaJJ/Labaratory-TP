const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const cabinetCard = document.getElementById('cabinetCard');
const statusAlert = document.getElementById('statusAlert');
const cabinetAlert = document.getElementById('cabinetAlert');
const logoutBtn = document.getElementById('logoutBtn');
const testUnauthorizedBtn = document.getElementById('testUnauthorizedBtn');
const testForeignBtn = document.getElementById('testForeignBtn');
const sessionTimerEl = document.getElementById('sessionTimer');

let timerInterval = null;

function showAlert(el, message, type = 'danger') {
  el.textContent = message;
  el.className = `alert show alert-${type}`;
}

function hideAlert(el) {
  el.className = 'alert';
}

function startSessionCountdown(expiresAt) {
  if (timerInterval) clearInterval(timerInterval);
  function update() {
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const min = String(Math.floor(remaining / 60)).padStart(2, '0');
    const sec = String(remaining % 60).padStart(2, '0');
    sessionTimerEl.textContent = `Сессия: ${min}:${sec}`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      cabinetCard.hidden = true;
      loginCard.hidden = false;
      showAlert(statusAlert, 'Срок действия сессии истек. Пожалуйста, войдите снова.', 'warning');
    }
  }
  update();
  timerInterval = setInterval(update, 1000);
}

async function loadProfile() {
  const res = await fetch('/api/profile', { credentials: 'include' });
  const data = await res.json();

  if (!res.ok) {
    cabinetCard.hidden = true;
    loginCard.hidden = false;
    return false;
  }

  document.getElementById('studentName').textContent = data.fullName;
  document.getElementById('infoId').textContent = data.id;
  document.getElementById('infoLogin').textContent = data.login;
  document.getElementById('infoGroup').textContent = data.group;
  document.getElementById('infoGpa').textContent = data.gpa;
  document.getElementById('infoScholarship').textContent = data.scholarship;

  const coursesBody = document.getElementById('coursesBody');
  coursesBody.innerHTML = data.courses
    .map((c) => `<tr><td>${c.code}</td><td>${c.name}</td><td><strong>${c.grade}</strong></td></tr>`)
    .join('');

  const auditBody = document.getElementById('auditBody');
  auditBody.innerHTML = data.auditLog
    .map((a) => `<tr><td>${a.time}</td><td>${a.login}</td><td>${a.status}</td></tr>`)
    .join('');

  loginCard.hidden = true;
  cabinetCard.hidden = false;
  hideAlert(statusAlert);
  hideAlert(cabinetAlert);
  startSessionCountdown(data.expiresAt);
  return true;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert(statusAlert);

  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(statusAlert, `Ошибка (${res.status}): ${data.error}`, 'danger');
      return;
    }

    document.getElementById('password').value = '';
    await loadProfile();
  } catch (err) {
    showAlert(statusAlert, 'Сетевая ошибка при обращении к серверу.', 'danger');
  }
});

logoutBtn.addEventListener('click', async () => {
  if (!confirm('Вы действительно хотите завершить текущую сессию?')) return;

  const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  const data = await res.json();

  if (timerInterval) clearInterval(timerInterval);
  cabinetCard.hidden = true;
  loginCard.hidden = false;
  showAlert(statusAlert, data.message, 'success');
});

testUnauthorizedBtn.addEventListener('click', async () => {
  const res = await fetch('/api/profile', { credentials: 'include' });
  const data = await res.json();
  showAlert(statusAlert, `Ответ сервера (${res.status}): ${data.error}`, 'danger');
});

testForeignBtn.addEventListener('click', async () => {
  const currentId = Number(document.getElementById('infoId').textContent);
  const targetId = currentId === 101 ? 102 : 101;
  const res = await fetch(`/api/student/${targetId}`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) {
    showAlert(cabinetAlert, `Ответ сервера (${res.status}): ${data.error}`, 'danger');
  } else {
    showAlert(cabinetAlert, data.message, 'success');
  }
});

// Проверка активной сессии при обновлении страницы (Тест №8)
window.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});
