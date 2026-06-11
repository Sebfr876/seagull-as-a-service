// Seagull-as-a-Service
// GET /seagull  ->  { "noise": "SKRAAAA!" }
// Built with Express. Inspired by no-as-a-service.

const express = require('express');
const fs = require('fs');
const path = require('path');

const NOISES = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seagull_noises.json'), 'utf8')
);

const PORT = process.env.PORT || 3000;
const app = express();

// Trust X-Forwarded-For so req.ip works behind a reverse proxy
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  next();
});

// --- Tiny fixed-window rate limiter: 120 requests/min per IP ---
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 120;
const hits = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { windowStart: now, count: 1 });
    return next();
  }
  entry.count += 1;
  if (entry.count > MAX_PER_WINDOW) {
    return res.status(429).json({
      error: 'SKRAAAA! Too many requests. Even seagulls need to breathe. Try again in a minute.',
    });
  }
  next();
}

// Clean out stale entries so the map doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now - entry.windowStart > WINDOW_MS) hits.delete(ip);
  }
}, WINDOW_MS).unref();

function randomNoise() {
  return NOISES[Math.floor(Math.random() * NOISES.length)];
}

app.get('/seagull', rateLimit, (req, res) => {
  const noise = randomNoise();
  const wantsPlainText =
    req.query.format === 'text' || (req.headers.accept || '').includes('text/plain');

  if (wantsPlainText) {
    return res.type('text/plain; charset=utf-8').send(noise + '\n');
  }
  res.json({ noise });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Seagull-as-a-Service',
    usage: 'GET /seagull',
    hint: 'Add ?format=text for plain text. SKRAAAA!',
  });
});

// Non-GET methods on known routes
app.all('/{*path}', (req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'SKRAA?! Only GET is allowed.' });
  }
  next();
});

// Everything else
app.use((req, res) => {
  res.status(404).json({ error: 'Kyow? Nothing here. Try GET /seagull.' });
});

app.listen(PORT, () => {
  console.log(`Seagull-as-a-Service is screeching on http://localhost:${PORT}/seagull`);
});
