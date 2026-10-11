// Development-only stand-in for the Spring Boot auth API. In-memory, no dependencies (Node 18+).
// Implements the contract in docs/AUTH_API.md so the UI can be built and tested before the real backend exists.
//   npm run mock:api            (listens on :8080; run `npm run dev` in another terminal)
import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT) || 8080;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const SECRET = process.env.JWT_SECRET || 'dev-only-secret';
const ACCESS_TTL = 15 * 60; // seconds

const users = new Map(); // id -> user
const byEmail = new Map(); // email -> id
const refresh = new Map(); // token -> { uid, exp }
const resets = new Map(); // token -> { uid, exp }
const attempts = new Map(); // ip -> { n, at }

const b64 = (b) => Buffer.from(b).toString('base64url');
const sign = (payload) => {
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify(payload));
  return `${h}.${body}.${crypto.createHmac('sha256', SECRET).update(`${h}.${body}`).digest('base64url')}`;
};
function verify(token) {
  const [h, b, s] = (token || '').split('.');
  if (!s || crypto.createHmac('sha256', SECRET).update(`${h}.${b}`).digest('base64url') !== s) return null;
  const p = JSON.parse(Buffer.from(b, 'base64url').toString());
  return p.exp > Date.now() / 1000 ? p : null;
}
const hashPw = (pw) => {
  const salt = crypto.randomBytes(16);
  return `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 32).toString('hex')}`;
};
const checkPw = (pw, stored) => {
  const [s, k] = stored.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(pw, Buffer.from(s, 'hex'), 32), Buffer.from(k, 'hex'));
};
let nextId = 1;
const iso = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const pub = (u) => ({ id: u.id, name: u.name, email: u.email, provider: u.provider.toUpperCase(), 'create-time-stamp': u.createdAt, 'update-time-stamp': u.createdAt });

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((c) => c[0]));
}
function refreshCookie(token, maxAge) {
  return `fq_refresh=${token}; HttpOnly; Path=/api/v1/auth; SameSite=Lax; Max-Age=${maxAge}`;
}
function startSession(uid, remember = true) {
  const token = crypto.randomBytes(32).toString('hex');
  const ttl = remember ? 30 * 86400 : 0;
  refresh.set(token, { uid, exp: Date.now() + (ttl || 86400) * 1000 });
  const now = Math.floor(Date.now() / 1000);
  const accessToken = sign({ sub: uid, iat: now, exp: now + ACCESS_TTL });
  return { token, ttl, body: { accessToken, expiresIn: ACCESS_TTL, user: pub(users.get(uid)) } };
}
function send(res, status, data, extra = {}) {
  const body = data === undefined ? '' : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json', ...extra });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => {
      s += c;
      if (s.length > 20000) reject(new Error('too large'));
    });
    req.on('end', () => {
      try {
        resolve(s ? JSON.parse(s) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const strong = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 72 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const origin = req.headers.origin;
  if (origin && origin === APP_URL) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return send(res, 204);

  // OAuth2 (mock): Spring Security would redirect to the provider; here we sign in a demo user straight away.
  const oauth = url.pathname.match(/^\/api\/v1\/auth\/oauth2\/authorization\/(\w+)$/);
  if (oauth) {
    const provider = oauth[1];
    const email = `demo@${provider}.example`;
    let uid = byEmail.get(email);
    if (!uid) {
      uid = nextId++;
      users.set(uid, { id: uid, name: `${provider} demo`, email, provider, createdAt: iso(new Date()) });
      byEmail.set(email, uid);
    }
    const s = startSession(uid);
    res.writeHead(302, { Location: `${APP_URL}/?auth=success`, 'Set-Cookie': refreshCookie(s.token, s.ttl) });
    return res.end();
  }

  try {
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/signup') {
      const { name, email, password } = await readBody(req);
      const errors = {};
      if (!name || name.trim().length < 2) errors.name = 'Enter at least 2 characters.';
      if (!EMAIL.test(email || '')) errors.email = 'That email does not look right.';
      if (!strong(password)) errors.password = 'Use 8+ characters with upper and lower case letters and a number.';
      if (Object.keys(errors).length) return send(res, 422, { message: 'Please check the highlighted fields.', errors });
      if (byEmail.has(email.toLowerCase())) return send(res, 409, { message: 'That email is already registered.', errors: { email: 'That email is already registered.' } });
      const uid = nextId++;
      users.set(uid, { id: uid, name: name.trim(), email: email.toLowerCase(), provider: 'local', passwordHash: hashPw(password), createdAt: iso(new Date()) });
      byEmail.set(email.toLowerCase(), uid);
      const s = startSession(uid);
      return send(res, 201, s.body, { 'Set-Cookie': refreshCookie(s.token, s.ttl) });
    }
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/login') {
      const ip = req.socket.remoteAddress;
      const a = attempts.get(ip) || { n: 0, at: Date.now() };
      if (Date.now() - a.at > 60000) Object.assign(a, { n: 0, at: Date.now() });
      if (a.n >= 8) return send(res, 429, { message: 'Too many attempts. Please wait a minute and try again.' });
      const { email, password, remember } = await readBody(req);
      const u = users.get(byEmail.get((email || '').toLowerCase()));
      if (!u || !u.passwordHash || !checkPw(password || '', u.passwordHash)) {
        a.n += 1;
        attempts.set(ip, a);
        return send(res, 401, { message: 'Incorrect email or password.' });
      }
      attempts.delete(ip);
      const s = startSession(u.id, remember !== false);
      return send(res, 200, s.body, { 'Set-Cookie': refreshCookie(s.token, s.ttl) });
    }
    if (req.method === 'POST' && (url.pathname === '/api/v1/auth/refresh' || url.pathname === '/api/v1/auth/logout')) {
      if (req.headers['x-requested-with'] !== 'XMLHttpRequest') return send(res, 403, { message: 'Missing X-Requested-With header.' });
      const old = cookies(req).fq_refresh;
      const rec = old && refresh.get(old);
      if (url.pathname.endsWith('/logout')) {
        if (old) refresh.delete(old);
        return send(res, 204, undefined, { 'Set-Cookie': refreshCookie('', 0) });
      }
      if (!rec || rec.exp < Date.now() || !users.has(rec.uid)) return send(res, 401, { message: 'Session expired.' }, { 'Set-Cookie': refreshCookie('', 0) });
      refresh.delete(old); // rotation
      const s = startSession(rec.uid);
      return send(res, 200, s.body, { 'Set-Cookie': refreshCookie(s.token, s.ttl) });
    }
    if (req.method === 'GET' && url.pathname === '/api/v1/auth/me') {
      const p = verify((req.headers.authorization || '').replace(/^Bearer /, ''));
      return p && users.has(p.sub) ? send(res, 200, pub(users.get(p.sub))) : send(res, 401, { message: 'Not signed in.' });
    }
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/forgot-password') {
      const { email } = await readBody(req);
      const uid = byEmail.get((email || '').toLowerCase());
      if (uid && users.get(uid).passwordHash) {
        const token = crypto.randomBytes(24).toString('base64url');
        resets.set(token, { uid, exp: Date.now() + 15 * 60000 });
        console.log(`\n[mock SMTP] password reset for ${email}:\n  ${APP_URL}/?reset=${token}\n`);
      }
      return send(res, 202, { message: 'If that account exists, an email is on its way.' }); // never reveal whether it exists
    }
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/reset-password') {
      const { token, password } = await readBody(req);
      const r = resets.get(token);
      if (!r || r.exp < Date.now()) return send(res, 400, { message: 'This reset link is invalid or has expired.' });
      if (!strong(password)) return send(res, 422, { message: 'Please check the highlighted fields.', errors: { password: 'Use 8+ characters with upper and lower case letters and a number.' } });
      users.get(r.uid).passwordHash = hashPw(password);
      resets.delete(token);
      for (const [t, v] of refresh) if (v.uid === r.uid) refresh.delete(t); // sign out everywhere
      return send(res, 204);
    }
    send(res, 404, { message: 'Not found.' });
  } catch (e) {
    send(res, 400, { message: 'Bad request.' });
  }
});
server.listen(PORT, () => console.log(`Mock auth API on http://localhost:${PORT} (app: ${APP_URL})`));
