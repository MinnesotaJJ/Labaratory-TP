const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Учебная база пользователей (пароли хранятся в виде SHA-256 хеша с солью)
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

const SALT_1 = 'edu_salt_2026_01';
const SALT_2 = 'edu_salt_2026_02';

const USERS = [
  {
    id: 101,
    login: 'student_alibek',
    passwordHash: hashPassword('Pass1234!', SALT_1),
    salt: SALT_1,
    fullName: 'Алибек Нурланов',
    group: 'ИС-23-2',
    gpa: '3.78',
    scholarship: '41 898 ₸',
    courses: [
      { code: 'CS304', name: 'Языки и технология программирования', grade: '95 (A)' },
      { code: 'DB201', name: 'Базы данных и SQL', grade: '91 (A-)' },
      { code: 'WB210', name: 'Веб-разработка', grade: '88 (B+)' }
    ]
  },
  {
    id: 102,
    login: 'student_madina',
    passwordHash: hashPassword('Study2026!', SALT_2),
    salt: SALT_2,
    fullName: 'Мадина Серикова',
    group: 'ВТиПО-23-1',
    gpa: '3.92',
    scholarship: '48 182 ₸',
    courses: [
      { code: 'CS304', name: 'Языки и технология программирования', grade: '98 (A)' },
      { code: 'AI310', name: 'Основы искусственного интеллекта', grade: '94 (A)' }
    ]
  }
];

// Хранилище серверных сессий (в памяти)
const SESSIONS = new Map();
const SESSION_TTL_MS = 2 * 60 * 1000; // 2 минуты для удобной демонстрации истечения сессии

// Журнал аудита попыток входа (Творческое задание)
const AUDIT_LOG = [];

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

// Middleware проверки серверной сессии
function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  const sid = cookies.sid;

  if (!sid || !SESSIONS.has(sid)) {
    return res.status(401).json({
      error: 'Требуется аутентификация (HTTP 401). Сессия не найдена.'
    });
  }

  const session = SESSIONS.get(sid);
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(sid);
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    return res.status(401).json({
      error: 'Срок действия сессии истек (HTTP 401). Выполните повторный вход.'
    });
  }

  req.session = session;
  req.sid = sid;
  next();
}

// POST /api/login — Вход пользователя
app.post('/api/login', (req, res) => {
  const { login, password } = req.body || {};

  if (!login || !password || !login.trim() || !password.trim()) {
    AUDIT_LOG.unshift({ time: new Date().toLocaleTimeString(), login: login || '(пусто)', status: 'Ошибка: пустые поля' });
    return res.status(400).json({ error: 'Заполните обязательные поля: логин и пароль.' });
  }

  const user = USERS.find((u) => u.login === login.trim());
  if (!user) {
    AUDIT_LOG.unshift({ time: new Date().toLocaleTimeString(), login: login.trim(), status: 'Отказ (401): неверный логин' });
    return res.status(401).json({ error: 'Неверный логин или пароль.' });
  }

  const candidateHash = hashPassword(password, user.salt);
  if (candidateHash !== user.passwordHash) {
    AUDIT_LOG.unshift({ time: new Date().toLocaleTimeString(), login: login.trim(), status: 'Отказ (401): неверный пароль' });
    return res.status(401).json({ error: 'Неверный логин или пароль.' });
  }

  // Создаем криптостойкий ID сессии
  const sid = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;

  SESSIONS.set(sid, {
    userId: user.id,
    login: user.login,
    createdAt: Date.now(),
    expiresAt
  });

  AUDIT_LOG.unshift({ time: new Date().toLocaleTimeString(), login: user.login, status: 'Успешный вход (200)' });

  // Устанавливаем защищенную HttpOnly + SameSite=Strict cookie
  res.setHeader(
    'Set-Cookie',
    `sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  );

  return res.json({
    message: 'Вход выполнен успешно. Создана серверная сессия.',
    expiresAt
  });
});

// GET /api/profile — Защищенный ресурс личного кабинета
app.get('/api/profile', requireAuth, (req, res) => {
  const user = USERS.find((u) => u.id === req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден.' });
  }

  return res.json({
    id: user.id,
    login: user.login,
    fullName: user.fullName,
    group: user.group,
    gpa: user.gpa,
    scholarship: user.scholarship,
    courses: user.courses,
    expiresAt: req.session.expiresAt,
    auditLog: AUDIT_LOG.slice(0, 6)
  });
});

// GET /api/student/:id — Проверка запрета горизонтального доступа (HTTP 403)
app.get('/api/student/:id', requireAuth, (req, res) => {
  const requestedId = Number(req.params.id);
  if (requestedId !== req.session.userId) {
    return res.status(403).json({
      error: `Доступ запрещен (HTTP 403): вы не можете просматривать зачетную книжку студента ID=${requestedId}.`
    });
  }
  const user = USERS.find((u) => u.id === requestedId);
  return res.json({ message: 'Доступ разрешен', fullName: user.fullName, gpa: user.gpa });
});

// POST /api/logout — Выход и уничтожение сессии
app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req);
  if (cookies.sid && SESSIONS.has(cookies.sid)) {
    const sess = SESSIONS.get(cookies.sid);
    AUDIT_LOG.unshift({ time: new Date().toLocaleTimeString(), login: sess.login, status: 'Выход из системы' });
    SESSIONS.delete(cookies.sid);
  }
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  return res.json({ message: 'Вы вышли из системы. Серверная сессия закрыта.' });
});

app.listen(PORT, () => {
  console.log(`[Базовый уровень — Вариант 1] Сервер запущен: http://localhost:${PORT}`);
});
