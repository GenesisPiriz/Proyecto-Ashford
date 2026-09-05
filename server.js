const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const sessions = new Map();
const sessionDurationMs = 1000 * 60 * 60 * 8;
const loginAttempts = new Map();
const maxLoginAttempts = 5;
const loginWindowMs = 15 * 60 * 1000;

function getClientAddress(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0].trim() || request.socket.remoteAddress || "unknown";
}

function isRateLimited(request) {
  const key = getClientAddress(request);
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt <= now) {
    loginAttempts.set(key, { count: 0, resetAt: now + loginWindowMs });
    return false;
  }
  return record.count >= maxLoginAttempts;
}

function recordFailedLogin(request) {
  const key = getClientAddress(request);
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + loginWindowMs });
    return;
  }
  record.count += 1;
}

function clearLoginAttempts(request) {
  loginAttempts.delete(getClientAddress(request));
}

function isSecureRequest(request) {
  return request.socket.encrypted || request.headers["x-forwarded-proto"] === "https";
}

function getSecurityHeaders(request) {
  const cookieSecure = isSecureRequest(request) ? "; Secure" : "";
  return {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:; connect-src 'self' https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'; form-action 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
    "Cache-Control": "no-store",
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function verifyPassword(password, storedHash) {
  const [salt, expectedHex] = String(storedHash || "").split(":");
  if (!salt || !expectedHex) return false;
  const actual = await hashPassword(password, salt);
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const actualBuffer = Buffer.from(actual.split(":")[1], "hex");
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), { mode: 0o600 });
}

async function ensureUsers() {
  const users = readUsers();
  if (users.length) return users;
  const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "ashford");
  const managerPassword = process.env.MANAGER_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "123456789");
  if (!adminPassword || !managerPassword) {
    throw new Error("ADMIN_PASSWORD y MANAGER_PASSWORD son obligatorias en producción.");
  }
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ashford.local";
  const managerEmail = process.env.MANAGER_EMAIL || "joyeriagenesis.uy@gmail.com";
  const seeded = [
    { id: "usr-admin", name: "Administrador", email: adminEmail, passwordHash: await hashPassword(adminPassword), role: "Administrador", createdBy: "Sistema" },
    { id: "usr-manager", name: "Genesis Joyería", email: managerEmail, passwordHash: await hashPassword(managerPassword), role: "Gerencial", active: true, createdBy: "Sistema" },
  ];
  writeUsers(seeded);
  return seeded;
}

function parseCookies(request) {
  return Object.fromEntries(String(request.headers.cookie || "").split(";").filter(Boolean).map((cookie) => {
    const index = cookie.indexOf("=");
    return [cookie.slice(0, index).trim(), decodeURIComponent(cookie.slice(index + 1).trim())];
  }));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active !== false, createdBy: user.createdBy || "Sistema" };
}

function getSessionUser(request, users) {
  const token = parseCookies(request).ashford_session;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return users.find((user) => user.id === session.userId) || null;
}

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) reject(new Error("Payload demasiado grande"));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const requested = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(ROOT + path.sep) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };
  response.writeHead(200, {
    "Content-Type": `${types[path.extname(filePath)] || "application/octet-stream"}; charset=utf-8`,
    ...getSecurityHeaders(request),
  });
  fs.createReadStream(filePath).pipe(response);
}

async function handleApi(request, response, users) {
  const url = new URL(request.url, `http://${HOST}`);
  const origin = request.headers.origin;
  const allowedOrigins = ["capacitor://localhost", "http://localhost", "https://localhost", process.env.APP_ORIGIN].filter(Boolean);
  if (allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  }
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "ashford", timestamp: new Date().toISOString() });
    return;
  }
  const user = getSessionUser(request, users);
  if (request.method === "GET" && url.pathname === "/api/auth/me") {
    sendJson(response, 200, { user: user ? publicUser(user) : null });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    if (isRateLimited(request)) {
      sendJson(response, 429, { error: "Demasiados intentos. Volvé a intentar en unos minutos." }, { "Retry-After": "900" });
      return;
    }
    const body = await readJson(request);
    const found = users.find((item) => item.email.toLowerCase() === String(body.email || "").trim().toLowerCase());
    if (found?.active === false) {
      sendJson(response, 403, { error: "La cuenta está inactiva. Contactá a un usuario Gerencial." });
      return;
    }
    if (!found || !(await verifyPassword(String(body.password || ""), found.passwordHash))) {
      recordFailedLogin(request);
      sendJson(response, 401, { error: "Correo o contraseña incorrectos." });
      return;
    }
    clearLoginAttempts(request);
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { userId: found.id, expiresAt: Date.now() + sessionDurationMs });
    const secure = isSecureRequest(request) ? "; Secure" : "";
    sendJson(response, 200, { user: publicUser(found) }, { "Set-Cookie": `ashford_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDurationMs / 1000}${secure}` });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = parseCookies(request).ashford_session;
    sessions.delete(token);
    const secure = isSecureRequest(request) ? "; Secure" : "";
    sendJson(response, 200, { ok: true }, { "Set-Cookie": `ashford_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}` });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/auth/password") {
    if (!user) {
      sendJson(response, 401, { error: "La sesión no es válida." });
      return;
    }
    const body = await readJson(request);
    if (String(body.newPassword || "").length < 4) {
      sendJson(response, 400, { error: "La nueva contraseña debe tener al menos 4 caracteres." });
      return;
    }
    if (!(await verifyPassword(String(body.currentPassword || ""), user.passwordHash))) {
      sendJson(response, 400, { error: "La contraseña actual no es correcta." });
      return;
    }
    user.passwordHash = await hashPassword(String(body.newPassword));
    writeUsers(users);
    sendJson(response, 200, { ok: true });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/users") {
    if (!user || user.role !== "Gerencial") {
      sendJson(response, 403, { error: "Solo un usuario Gerencial puede consultar usuarios." });
      return;
    }
    sendJson(response, 200, { users: users.map(publicUser) });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/users") {
    if (!user || user.role !== "Gerencial") {
      sendJson(response, 403, { error: "Solo un usuario Gerencial puede dar de alta usuarios." });
      return;
    }
    const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase();
    const role = body.role === "Gerencial" ? "Gerencial" : "Administrador";
    if (!body.name || !email || String(body.password || "").length < 4) {
      sendJson(response, 400, { error: "Nombre, correo y contraseña son obligatorios." });
      return;
    }
    if (users.some((item) => item.email.toLowerCase() === email)) {
      sendJson(response, 409, { error: "Ese correo ya tiene una cuenta." });
      return;
    }
    const created = { id: `usr-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`, name: String(body.name).trim(), email, passwordHash: await hashPassword(String(body.password)), role, active: true, createdBy: user.name };
    users.push(created);
    writeUsers(users);
    sendJson(response, 201, { user: publicUser(created) });
    return;
  }
  if (request.method === "PATCH" && url.pathname.startsWith("/api/users/")) {
    if (!user || user.role !== "Gerencial") {
      sendJson(response, 403, { error: "Solo un usuario Gerencial puede modificar usuarios." });
      return;
    }
    const targetId = decodeURIComponent(url.pathname.slice("/api/users/".length));
    const target = users.find((item) => item.id === targetId);
    if (!target) {
      sendJson(response, 404, { error: "Usuario no encontrado." });
      return;
    }
    if (target.role !== "Administrador") {
      sendJson(response, 403, { error: "Solo se pueden modificar o inactivar usuarios Administradores." });
      return;
    }
    const body = await readJson(request);
    if (body.name !== undefined) {
      if (!String(body.name).trim()) {
        sendJson(response, 400, { error: "El nombre no puede quedar vacío." });
        return;
      }
      target.name = String(body.name).trim();
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!email || users.some((item) => item.id !== target.id && item.email.toLowerCase() === email)) {
        sendJson(response, 400, { error: "El correo no es válido o ya está registrado." });
        return;
      }
      target.email = email;
    }
    if (body.active !== undefined) target.active = Boolean(body.active);
    if (body.password !== undefined) {
      if (String(body.password).length < 4) {
        sendJson(response, 400, { error: "La contraseña debe tener al menos 4 caracteres." });
        return;
      }
      target.passwordHash = await hashPassword(String(body.password));
    }
    writeUsers(users);
    sendJson(response, 200, { user: publicUser(target) });
    return;
  }
  sendJson(response, 404, { error: "Ruta no encontrada." });
}

(async () => {
  const users = await ensureUsers();
  const server = http.createServer(async (request, response) => {
    try {
      Object.entries(getSecurityHeaders(request)).forEach(([name, value]) => response.setHeader(name, value));
      if (isSecureRequest(request)) response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      if (request.url.startsWith("/api/")) await handleApi(request, response, users);
      else if (request.method === "GET" || request.method === "HEAD") serveStatic(request, response);
      else sendJson(response, 405, { error: "Método no permitido." });
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Solicitud inválida." });
    }
  });
  server.listen(PORT, HOST, () => console.log(`Ashford escuchando en http://${HOST}:${PORT}`));
})();
