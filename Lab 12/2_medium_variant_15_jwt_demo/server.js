const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Секретный ключ подписи HMAC-SHA256 (в продакшене хранится в переменных окружения)
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const JWT_ISSUER = 'edu-auth-server';
const JWT_AUDIENCE = 'lab12-client';
const JWT_TTL_SEC = 45; // Короткоживущий JWT (45 секунд для наглядной проверки истечения срока)

// Черный список отозванных токенов при выходе (jti blacklist)
const REVOKED_JTI = new Set();

const USERS = [
  {
    id: 'u-201',
    login: 'dev_arman',
    passwordHash: crypto.createHash('sha256').update('JwtSecret#1').digest('hex'),
    name: 'Арман Касымов',
    role: 'student',
    department: 'Кафедра программной инженерии'
  },
  {
    id: 'u-202',
    login: 'prof_dana',
    passwordHash: crypto.createHash('sha256').update('Teacher#2026').digest('hex'),
    name: 'Дана Омарова',
    role: 'teacher',
    department: 'Кафедра информационных систем'
  }
];

function base64urlEncode(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${signature}`;
}

function verifyJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Некорректный формат JWT (ожидается 3 части: header.payload.signature).');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  let header, payload;

  try {
    header = base64urlDecode(encodedHeader);
    payload = base64urlDecode(encodedPayload);
  } catch {
    throw new Error('Ошибка декодирования Base64URL в JWT.');
  }

  // 1. Строгая проверка алгоритма (защита от атаки alg: none)
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error(`Недопустимый алгоритм подписи: ${header.alg}. Ожидается HS256.`);
  }

  // 2. Проверка криптографической подписи (timingSafeEqual)
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Подпись JWT недействительна! Токен был подделан.');
  }

  // 3. Проверка срока действия (exp)
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || now >= payload.exp) {
    throw new Error('Срок действия JWT истек (claim exp).');
  }

  // 4. Проверка claims (iss, aud)
  if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) {
    throw new Error('Некорректные claims iss или aud.');
  }

  // 5. Проверка отзыва при выходе
  if (REVOKED_JTI.has(payload.jti)) {
    throw new Error('Токен был отозван сервером при выходе пользователя.');
  }

  return { header, payload };
}

// Middleware защиты JWT endpoint
function requireJwt(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Отсутствует заголовок Authorization: Bearer <token> (HTTP 401).'
    });
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = verifyJwt(token);
    req.jwt = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: `Ошибка проверки JWT (HTTP 401): ${err.message}`
    });
  }
}

// POST /api/login — Выдача короткоживущего JWT
app.post('/api/login', (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password || !login.trim() || !password.trim()) {
    return res.status(400).json({ error: 'Введите логин и пароль.' });
  }

  const user = USERS.find((u) => u.login === login.trim());
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (!user || user.passwordHash !== hash) {
    return res.status(401).json({ error: 'Неверные учетные данные (HTTP 401).' });
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    login: user.login,
    name: user.name,
    role: user.role,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    iat: now,
    exp: now + JWT_TTL_SEC,
    jti: crypto.randomUUID()
  };

  const token = signJwt(payload);

  return res.json({
    message: 'Короткоживущий JWT успешно выдан (срок действия 45 сек).',
    accessToken: token,
    expiresIn: JWT_TTL_SEC
  });
});

// GET /api/protected — Защищенный ресурс, проверяющий JWT на сервере
app.get('/api/protected', requireJwt, (req, res) => {
  const user = USERS.find((u) => u.id === req.jwt.payload.sub);
  return res.json({
    message: 'Подпись, алгоритм и срок действия JWT успешно подтверждены сервером.',
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      department: user.department
    },
    tokenClaims: req.jwt.payload,
    serverTime: new Date().toLocaleTimeString()
  });
});

// GET /api/teacher-only — Проверка авторизации по роли (HTTP 403 для студента)
app.get('/api/teacher-only', requireJwt, (req, res) => {
  if (req.jwt.payload.role !== 'teacher') {
    return res.status(403).json({
      error: `Доступ запрещен (HTTP 403): ваша роль "${req.jwt.payload.role}", требуется роль "teacher".`
    });
  }
  return res.json({
    message: 'Доступ к ведомости преподавателя разрешен (роль teacher подтверждена).',
    secretKeyNote: 'Код доступа к экзаменационной ведомости: EXAM-2026-KZ'
  });
});

// POST /api/logout — Отзыв JWT на сервере
app.post('/api/logout', requireJwt, (req, res) => {
  REVOKED_JTI.add(req.jwt.payload.jti);
  return res.json({
    message: 'Выход выполнен. Идентификатор токена (jti) добавлен в черный список на сервере.'
  });
});

app.listen(PORT, () => {
  console.log(`[Средний уровень — Вариант 15] JWT-сервер запущен: http://localhost:${PORT}`);
});
