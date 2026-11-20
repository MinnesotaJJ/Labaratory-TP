const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ACCESS_SECRET = crypto.randomBytes(32).toString('hex');
const ACCESS_TTL_SEC = 20; // Короткоживущий access token (20 сек для наглядности автообновления)
const REFRESH_TTL_MS = 10 * 60 * 1000; // 10 минут

// Хранилище семейств refresh-токенов (Token Family для обнаружения компрометации)
// refreshToken -> { familyId, userId, used: boolean, revoked: boolean, expiresAt, createdAt }
const REFRESH_STORE = new Map();

// Журнал ротации токенов (для демонстрации безопасности на защите)
const ROTATION_LOG = [];

const USERS = [
  {
    id: 501,
    login: 'senior_timur',
    passwordHash: crypto.createHash('sha256').update('RotatePass#2026').digest('hex'),
    fullName: 'Тимур Жумабаев',
    role: 'architect',
    balance: '245 000 ₸',
    projects: ['Платформа микросервисов', 'Шлюз аутентификации OIDC']
  },
  {
    id: 502,
    login: 'analyst_asel',
    passwordHash: crypto.createHash('sha256').update('AselSecure!9').digest('hex'),
    fullName: 'Асель Болатова',
    role: 'analyst',
    balance: '180 500 ₸',
    projects: ['Аудит информационной безопасности']
  }
];

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function unb64url(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function createAccessToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    login: user.login,
    role: user.role,
    iat: now,
    exp: now + ACCESS_TTL_SEC,
    jti: crypto.randomBytes(8).toString('hex')
  };
  const data = `${b64url(header)}.${b64url(payload)}`;
  const sig = crypto
    .createHmac('sha256', ACCESS_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return { token: `${data}.${sig}`, payload };
}

function verifyAccessToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Некорректный формат Access Token.');
  const [h, p, s] = parts;
  const header = unb64url(h);
  const payload = unb64url(p);

  if (header.alg !== 'HS256') throw new Error('Недопустимый алгоритм подписи.');
  const expected = crypto
    .createHmac('sha256', ACCESS_SECRET)
    .update(`${h}.${p}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (s !== expected) throw new Error('Подпись Access Token нарушена.');
  if (Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error('ACCESS_EXPIRED');
  }
  return payload;
}

function issueRefreshToken(userId, familyId = crypto.randomUUID()) {
  const token = crypto.randomBytes(32).toString('hex');
  REFRESH_STORE.set(token, {
    familyId,
    userId,
    used: false,
    revoked: false,
    expiresAt: Date.now() + REFRESH_TTL_MS,
    createdAt: new Date().toLocaleTimeString()
  });
  return token;
}

function revokeFamily(familyId) {
  for (const [, record] of REFRESH_STORE.entries()) {
    if (record.familyId === familyId) {
      record.revoked = true;
    }
  }
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach((c) => {
    const parts = c.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

function setRefreshCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `refresh_token=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${Math.floor(REFRESH_TTL_MS / 1000)}`
  );
}

function clearRefreshCookie(res) {
  res.setHeader('Set-Cookie', 'refresh_token=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0');
}

function requireAccessAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Отсутствует Access Token (HTTP 401).' });
  }
  try {
    req.userPayload = verifyAccessToken(auth.slice(7));
    next();
  } catch (err) {
    if (err.message === 'ACCESS_EXPIRED') {
      return res.status(401).json({
        code: 'ACCESS_EXPIRED',
        error: 'Срок действия короткого Access Token истек (HTTP 401). Требуется ротация через /api/refresh.'
      });
    }
    return res.status(401).json({ error: `Ошибка Access Token (HTTP 401): ${err.message}` });
  }
}

// POST /api/login — Выдача пары Access Token (JSON) + Refresh Token (HttpOnly Cookie)
app.post('/api/login', (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password || !login.trim() || !password.trim()) {
    return res.status(400).json({ error: 'Заполните логин и пароль.' });
  }

  const user = USERS.find((u) => u.login === login.trim());
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (!user || user.passwordHash !== hash) {
    return res.status(401).json({ error: 'Неверный логин или пароль (HTTP 401).' });
  }

  const access = createAccessToken(user);
  const refresh = issueRefreshToken(user.id);
  setRefreshCookie(res, refresh);

  ROTATION_LOG.unshift({
    time: new Date().toLocaleTimeString(),
    event: 'LOGIN — Выдана новая пара токенов',
    tokenPreview: refresh.slice(0, 12) + '...',
    status: 'Активен'
  });

  return res.json({
    message: 'Аутентификация пройдена. Выдан короткий Access Token (20с) и Refresh Token в HttpOnly cookie.',
    accessToken: access.token,
    claims: access.payload
  });
});

// POST /api/refresh — Безопасная ротация Refresh Token (Одноразовое использование + Reuse Detection)
app.post('/api/refresh', (req, res) => {
  const cookies = parseCookies(req);
  const incomingRefresh = cookies.refresh_token;

  if (!incomingRefresh || !REFRESH_STORE.has(incomingRefresh)) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Refresh Token отсутствует или недействителен (HTTP 401).' });
  }

  const record = REFRESH_STORE.get(incomingRefresh);

  // КРИТИЧЕСКАЯ ПРОВЕРКА: Обнаружение повторного использования (Refresh Token Reuse Detection)
  if (record.used || record.revoked) {
    revokeFamily(record.familyId);
    clearRefreshCookie(res);
    ROTATION_LOG.unshift({
      time: new Date().toLocaleTimeString(),
      event: 'SECURITY ALERT — Повторное использование старого Refresh Token!',
      tokenPreview: incomingRefresh.slice(0, 12) + '...',
      status: 'Семейство отозвано (403)'
    });
    return res.status(403).json({
      error: 'Обнаружена попытка повторного использования Refresh Token! Вся цепочка сессий аннулирована (HTTP 403).'
    });
  }

  if (Date.now() > record.expiresAt) {
    REFRESH_STORE.delete(incomingRefresh);
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Срок действия Refresh Token истек (HTTP 401).' });
  }

  const user = USERS.find((u) => u.id === record.userId);
  if (!user) {
    return res.status(401).json({ error: 'Пользователь не найден.' });
  }

  // Помечаем старый refresh token как использованный и выпускаем новый в том же семействе
  record.used = true;
  const nextRefresh = issueRefreshToken(user.id, record.familyId);
  const nextAccess = createAccessToken(user);

  setRefreshCookie(res, nextRefresh);

  ROTATION_LOG.unshift({
    time: new Date().toLocaleTimeString(),
    event: 'ROTATE — Старый Refresh погашен, выдан новый',
    tokenPreview: `${incomingRefresh.slice(0, 8)}... -> ${nextRefresh.slice(0, 8)}...`,
    status: 'Успешно (200)'
  });

  return res.json({
    message: 'Ротация токенов выполнена успешно.',
    accessToken: nextAccess.token,
    claims: nextAccess.payload
  });
});

// GET /api/workspace — Защищенный ресурс
app.get('/api/workspace', requireAccessAuth, (req, res) => {
  const user = USERS.find((u) => u.id === req.userPayload.sub);
  return res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      balance: user.balance,
      projects: user.projects
    },
    claims: req.userPayload,
    rotationLog: ROTATION_LOG.slice(0, 8)
  });
});

// POST /api/logout — Безопасный выход и отзыв всего семейства токенов
app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req);
  const incomingRefresh = cookies.refresh_token;
  if (incomingRefresh && REFRESH_STORE.has(incomingRefresh)) {
    const record = REFRESH_STORE.get(incomingRefresh);
    revokeFamily(record.familyId);
    ROTATION_LOG.unshift({
      time: new Date().toLocaleTimeString(),
      event: 'LOGOUT — Семейство токенов отозвано',
      tokenPreview: incomingRefresh.slice(0, 12) + '...',
      status: 'Завершено'
    });
  }
  clearRefreshCookie(res);
  return res.json({ message: 'Выход выполнен. Refresh Token отозван на сервере, cookie удалена.' });
});

app.listen(PORT, () => {
  console.log(`[Повышенный уровень — Вариант 17] Сервер ротации JWT запущен: http://localhost:${PORT}`);
});
