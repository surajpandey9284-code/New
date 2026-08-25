const express = require('express');
const session = require('express-session');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');
const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics.json');

// ---------- helpers ----------
function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    return fallback;
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
if (!fs.existsSync(MESSAGES_FILE)) writeJSON(MESSAGES_FILE, []);
if (!fs.existsSync(ANALYTICS_FILE)) writeJSON(ANALYTICS_FILE, { totalVisits: 0, byDate: {}, byPage: {} });

// ---------- middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

// ---------- mailer ----------
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  transporter.verify((err) => {
    if (err) console.error('Email transporter error — check EMAIL_USER / EMAIL_PASS in .env:', err.message);
    else console.log('Email transporter ready');
  });
} else {
  console.warn('EMAIL_USER / EMAIL_PASS not set — contact form will only save messages, not send email.');
}

// =====================================================
// ANALYTICS (lightweight, built-in — no third-party account needed)
// =====================================================

app.post('/api/track', (req, res) => {
  const page = (req.body && req.body.page) || 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  const analytics = readJSON(ANALYTICS_FILE, { totalVisits: 0, byDate: {}, byPage: {} });
  analytics.totalVisits += 1;
  analytics.byDate[today] = (analytics.byDate[today] || 0) + 1;
  analytics.byPage[page] = (analytics.byPage[page] || 0) + 1;
  writeJSON(ANALYTICS_FILE, analytics);
  res.json({ success: true });
});

app.get('/api/admin/analytics', requireAuth, (req, res) => {
  res.json(readJSON(ANALYTICS_FILE, { totalVisits: 0, byDate: {}, byPage: {} }));
});

// =====================================================
// SEO — sitemap & robots
// =====================================================

app.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/#about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${base}/#experience</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${base}/#projects</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/#skills</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${base}/#education</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${base}/#contact</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`;
  res.type('application/xml').send(xml);
});

app.get('/robots.txt', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`);
});

// =====================================================
// PUBLIC API
// =====================================================

// Get all portfolio content
app.get('/api/data', (req, res) => {
  const data = readJSON(DATA_FILE, {});
  res.json(data);
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const entry = { name, email, subject: subject || '', message, receivedAt: new Date().toISOString() };
  const messages = readJSON(MESSAGES_FILE, []);
  messages.unshift(entry);
  writeJSON(MESSAGES_FILE, messages);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: subject ? `Portfolio: ${subject}` : `New portfolio message from ${name}`, 
        text: `From: ${name} <${email}>\n\n${message}`
      });
    } catch (err) {
      console.error('Failed to send contact email:', err.message);
      // message is still saved even if email fails
    }
  }

  res.json({ success: true });
});

// =====================================================
// AUTH
// =====================================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = (process.env.ADMIN_USER || '').trim();
  const validPass = (process.env.ADMIN_PASS || '').trim();

  if (!validUser || !validPass) {
    return res.status(500).json({ error: 'Admin credentials not configured on server.' });
  }

  if (username === validUser && password === validPass) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid username or password.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/admin/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// =====================================================
// ADMIN API (protected)
// =====================================================

app.get('/api/admin/data', requireAuth, (req, res) => {
  res.json(readJSON(DATA_FILE, {}));
});

app.put('/api/admin/data', requireAuth, (req, res) => {
  writeJSON(DATA_FILE, req.body);
  res.json({ success: true });
});

app.get('/api/admin/messages', requireAuth, (req, res) => {
  res.json(readJSON(MESSAGES_FILE, []));
});

app.delete('/api/admin/messages/:index', requireAuth, (req, res) => {
  const messages = readJSON(MESSAGES_FILE, []);
  const idx = parseInt(req.params.index, 10);
  if (idx >= 0 && idx < messages.length) {
    messages.splice(idx, 1);
    writeJSON(MESSAGES_FILE, messages);
  }
  res.json({ success: true });
});

// =====================================================
app.get('/health', (req, res) => res.json({ ok: true, adminConfigured: Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASS), env: process.env.NODE_ENV || 'development' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
