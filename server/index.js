const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'alternate-secret-change-this';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// File upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Database
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

// === Database Schema ===
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT DEFAULT '',
        password_hash TEXT NOT NULL,
        display_name TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        pronouns TEXT DEFAULT '',
        location TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        banner_url TEXT DEFAULT '',
        background_url TEXT DEFAULT '',
        background_type TEXT DEFAULT 'video',
        card_style TEXT DEFAULT 'compact',
        card_blur INTEGER DEFAULT 16,
        card_opacity INTEGER DEFAULT 60,
        card_radius INTEGER DEFAULT 16,
        accent_color TEXT DEFAULT '#ff6b8a',
        text_color TEXT DEFAULT '#ffffff',
        font_family TEXT DEFAULT 'Inter',
        cursor_type TEXT DEFAULT 'ring',
        cursor_url TEXT DEFAULT '',
        music_enabled INTEGER DEFAULT 0,
        music_url TEXT DEFAULT '',
        music_source TEXT DEFAULT 'file',
        song_title TEXT DEFAULT '',
        song_artist TEXT DEFAULT '',
        music_volume INTEGER DEFAULT 50,
        music_autoplay INTEGER DEFAULT 0,
        click_sound TEXT DEFAULT 'none',
        hover_sound TEXT DEFAULT 'none',
        particle_type TEXT DEFAULT 'none',
        particle_count INTEGER DEFAULT 50,
        particle_color TEXT DEFAULT '#ff6b8a',
        overlay_type TEXT DEFAULT 'none',
        card_animation TEXT DEFAULT 'fadeUp',
        tilt_enabled INTEGER DEFAULT 1,
        glow_enabled INTEGER DEFAULT 0,
        glitch_enabled INTEGER DEFAULT 0,
        typewriter_bio INTEGER DEFAULT 0,
        light_rays INTEGER DEFAULT 0,
        discord_enabled INTEGER DEFAULT 0,
        discord_id TEXT DEFAULT '',
        discord_show_activity INTEGER DEFAULT 1,
        discord_show_status INTEGER DEFAULT 1,
        discord_show_avatar INTEGER DEFAULT 0,
        spotify_enabled INTEGER DEFAULT 0,
        spotify_source TEXT DEFAULT 'lastfm',
        spotify_username TEXT DEFAULT '',
        spotify_style TEXT DEFAULT 'card',
        roblox_enabled INTEGER DEFAULT 0,
        roblox_username TEXT DEFAULT '',
        roblox_show_game INTEGER DEFAULT 1,
        roblox_show_status INTEGER DEFAULT 1,
        roblox_show_avatar INTEGER DEFAULT 0,
        show_views INTEGER DEFAULT 1,
        show_online INTEGER DEFAULT 1,
        page_active INTEGER DEFAULT 1,
        page_title TEXT DEFAULT '',
        meta_description TEXT DEFAULT '',
        og_image TEXT DEFAULT '',
        theme_color TEXT DEFAULT '#ff6b8a',
        custom_css TEXT DEFAULT '',
        name_effect TEXT DEFAULT 'none',
        avatar_effects TEXT DEFAULT '[]',
        socials TEXT DEFAULT '[]',
        buttons TEXT DEFAULT '[]',
        badges TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        viewer_ip TEXT DEFAULT '',
        user_agent TEXT DEFAULT '',
        referrer TEXT DEFAULT '',
        country TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS link_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        link_url TEXT NOT NULL,
        link_label TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS update_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_views_username ON page_views(username);
    CREATE INDEX IF NOT EXISTS idx_views_date ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS idx_clicks_username ON link_clicks(username);
`);

// Seed update logs if empty
const logCount = db.prepare('SELECT COUNT(*) as c FROM update_logs').get();
if (logCount.c === 0) {
    const insert = db.prepare('INSERT INTO update_logs (date, text) VALUES (?, ?)');
    insert.run('2026-08-01', 'Performance fixes & bug patches');
    insert.run('2026-07-28', 'New aimbot settings added');
    insert.run('2026-07-25', 'ESP visuals overhaul');
    insert.run('2026-07-20', 'Hood Customs full support');
    insert.run('2026-07-15', 'Silent aim improvements');
}

// === Auth Middleware ===
function auth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// === Auth Routes ===
app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 chars' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username: letters, numbers, underscores only' });

    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username.toLowerCase());
    if (exists) return res.status(409).json({ error: 'Username taken' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)').run(username.toLowerCase(), email || '', hash, username);

    const token = jwt.sign({ id: result.lastInsertRowid, username: username.toLowerCase() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: username.toLowerCase() });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: user.username });
});

// === Alias / Profile Check ===
app.get('/api/alias/check/:alias', (req, res) => {
    const alias = req.params.alias.toLowerCase();
    if (!alias || alias.length < 3 || alias.length > 20) return res.json({ available: false, reason: 'length' });
    if (!/^[a-zA-Z0-9_]+$/.test(alias)) return res.json({ available: false, reason: 'invalid_chars' });
    const reserved = ['admin', 'api', 'login', 'register', 'dashboard', 'link', 'status', 'features', 'alternate'];
    if (reserved.includes(alias)) return res.json({ available: false, reason: 'reserved' });
    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(alias);
    res.json({ available: !exists });
});

// === Profile Routes ===
app.get('/api/profile/:username', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username.toLowerCase());
    if (!user || !user.page_active) return res.status(404).json({ error: 'Not found' });

    // Track view
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    const ref = req.headers.referer || '';
    db.prepare('INSERT INTO page_views (username, viewer_ip, user_agent, referrer) VALUES (?, ?, ?, ?)').run(user.username, ip, ua, ref);

    // Return public profile (exclude password)
    const { password_hash, ...profile } = user;
    profile.socials = JSON.parse(profile.socials || '[]');
    profile.buttons = JSON.parse(profile.buttons || '[]');
    profile.badges = JSON.parse(profile.badges || '[]');
    profile.avatar_effects = JSON.parse(profile.avatar_effects || '[]');

    // Get view count
    const views = db.prepare('SELECT COUNT(*) as c FROM page_views WHERE username = ?').get(user.username);
    profile.view_count = views.c;

    res.json(profile);
});

// Get own profile (authed)
app.get('/api/me', auth, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { password_hash, ...profile } = user;
    profile.socials = JSON.parse(profile.socials || '[]');
    profile.buttons = JSON.parse(profile.buttons || '[]');
    profile.badges = JSON.parse(profile.badges || '[]');
    profile.avatar_effects = JSON.parse(profile.avatar_effects || '[]');
    res.json(profile);
});

// Update profile
app.put('/api/me', auth, (req, res) => {
    const fields = [
        'display_name','bio','pronouns','location','avatar_url','banner_url','background_url',
        'background_type','card_style','card_blur','card_opacity','card_radius','accent_color',
        'text_color','font_family','cursor_type','cursor_url','music_enabled','music_url',
        'music_source','song_title','song_artist','music_volume','music_autoplay','click_sound',
        'hover_sound','particle_type','particle_count','particle_color','overlay_type',
        'card_animation','tilt_enabled','glow_enabled','glitch_enabled','typewriter_bio',
        'light_rays','discord_enabled','discord_id','discord_show_activity','discord_show_status',
        'discord_show_avatar','spotify_enabled','spotify_source','spotify_username','spotify_style',
        'roblox_enabled','roblox_username','roblox_show_game','roblox_show_status','roblox_show_avatar',
        'show_views','show_online','page_active','page_title','meta_description','og_image',
        'theme_color','custom_css','name_effect','card_style'
    ];

    const sets = [];
    const vals = [];
    for (const f of fields) {
        if (req.body[f] !== undefined) {
            sets.push(`${f} = ?`);
            vals.push(req.body[f]);
        }
    }
    // Handle JSON fields
    if (req.body.socials !== undefined) { sets.push('socials = ?'); vals.push(JSON.stringify(req.body.socials)); }
    if (req.body.buttons !== undefined) { sets.push('buttons = ?'); vals.push(JSON.stringify(req.body.buttons)); }
    if (req.body.badges !== undefined) { sets.push('badges = ?'); vals.push(JSON.stringify(req.body.badges)); }
    if (req.body.avatar_effects !== undefined) { sets.push('avatar_effects = ?'); vals.push(JSON.stringify(req.body.avatar_effects)); }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(req.user.id);

    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    res.json({ ok: true });
});

// === File Upload ===
app.post('/api/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
});

// === Analytics ===
app.get('/api/analytics', auth, (req, res) => {
    const username = req.user.username;

    const total = db.prepare('SELECT COUNT(*) as c FROM page_views WHERE username = ?').get(username);
    const today = db.prepare("SELECT COUNT(*) as c FROM page_views WHERE username = ? AND created_at >= date('now')").get(username);
    const week = db.prepare("SELECT COUNT(*) as c FROM page_views WHERE username = ? AND created_at >= date('now', '-7 days')").get(username);
    const month = db.prepare("SELECT COUNT(*) as c FROM page_views WHERE username = ? AND created_at >= date('now', '-30 days')").get(username);
    const clicks = db.prepare('SELECT COUNT(*) as c FROM link_clicks WHERE username = ?').get(username);

    const daily = db.prepare(`
        SELECT date(created_at) as day, COUNT(*) as views
        FROM page_views WHERE username = ? AND created_at >= date('now', '-30 days')
        GROUP BY date(created_at) ORDER BY day DESC
    `).all(username);

    const topLinks = db.prepare(`
        SELECT link_url, link_label, COUNT(*) as clicks
        FROM link_clicks WHERE username = ?
        GROUP BY link_url ORDER BY clicks DESC LIMIT 10
    `).all(username);

    const topReferrers = db.prepare(`
        SELECT referrer, COUNT(*) as count
        FROM page_views WHERE username = ? AND referrer != ''
        GROUP BY referrer ORDER BY count DESC LIMIT 10
    `).all(username);

    const uniqueVisitors = db.prepare('SELECT COUNT(DISTINCT viewer_ip) as c FROM page_views WHERE username = ?').get(username);

    res.json({
        views: { total: total.c, today: today.c, week: week.c, month: month.c },
        clicks: { total: clicks.c, topLinks },
        unique_visitors: uniqueVisitors.c,
        daily,
        topReferrers
    });
});

// Track link click
app.post('/api/click', (req, res) => {
    const { username, url, label } = req.body;
    if (!username || !url) return res.status(400).json({ error: 'username and url required' });
    db.prepare('INSERT INTO link_clicks (username, link_url, link_label) VALUES (?, ?, ?)').run(username, url, label || '');
    res.json({ ok: true });
});

// === Public Routes ===
app.get('/api/status', (req, res) => {
    res.json({ bot: 'online', script: 'working', website: 'online', roblox_version: 'Latest' });
});

app.get('/api/logs', (req, res) => {
    const logs = db.prepare('SELECT date, text FROM update_logs ORDER BY id DESC LIMIT 10').all();
    res.json(logs);
});

// Get recent signups (for landing page)
app.get('/api/users/recent', (req, res) => {
    const users = db.prepare('SELECT username, display_name, avatar_url, created_at FROM users ORDER BY id ASC LIMIT 5').all();
    res.json(users);
});

// === Serve frontend in production ===
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`alternate API running on :${PORT}`);
});
