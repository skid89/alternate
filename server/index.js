const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        config TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event TEXT NOT NULL,
        data TEXT DEFAULT '{}',
        ip TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        viewer_ip TEXT DEFAULT '',
        page TEXT DEFAULT 'profile',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS link_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        link_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS aliases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

// === Routes ===

// Check alias availability
app.get('/api/alias/check/:alias', (req, res) => {
    const { alias } = req.params;
    if (!alias || alias.length < 3 || alias.length > 20) {
        return res.json({ available: false, reason: 'invalid' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(alias)) {
        return res.json({ available: false, reason: 'invalid_chars' });
    }
    const existing = db.prepare('SELECT id FROM aliases WHERE username = ?').get(alias.toLowerCase());
    const userExists = db.prepare('SELECT id FROM users WHERE username = ?').get(alias.toLowerCase());
    res.json({ available: !existing && !userExists });
});

// Track page view
app.post('/api/view', (req, res) => {
    const { username, page } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (!username) return res.status(400).json({ error: 'username required' });

    db.prepare('INSERT INTO page_views (username, viewer_ip, page) VALUES (?, ?, ?)').run(username, ip, page || 'profile');
    res.json({ ok: true });
});

// Track link click
app.post('/api/click', (req, res) => {
    const { username, url } = req.body;
    if (!username || !url) return res.status(400).json({ error: 'username and url required' });

    db.prepare('INSERT INTO link_clicks (username, link_url) VALUES (?, ?)').run(username, url);
    res.json({ ok: true });
});

// Get analytics for a user
app.get('/api/analytics/:username', (req, res) => {
    const { username } = req.params;

    const totalViews = db.prepare('SELECT COUNT(*) as count FROM page_views WHERE username = ?').get(username);
    const todayViews = db.prepare("SELECT COUNT(*) as count FROM page_views WHERE username = ? AND created_at >= date('now')").get(username);
    const weekViews = db.prepare("SELECT COUNT(*) as count FROM page_views WHERE username = ? AND created_at >= date('now', '-7 days')").get(username);
    const totalClicks = db.prepare('SELECT COUNT(*) as count FROM link_clicks WHERE username = ?').get(username);

    // Views per day (last 30 days)
    const dailyViews = db.prepare(`
        SELECT date(created_at) as day, COUNT(*) as count
        FROM page_views
        WHERE username = ? AND created_at >= date('now', '-30 days')
        GROUP BY date(created_at)
        ORDER BY day DESC
    `).all(username);

    // Top clicked links
    const topLinks = db.prepare(`
        SELECT link_url, COUNT(*) as clicks
        FROM link_clicks
        WHERE username = ?
        GROUP BY link_url
        ORDER BY clicks DESC
        LIMIT 10
    `).all(username);

    res.json({
        views: {
            total: totalViews?.count || 0,
            today: todayViews?.count || 0,
            week: weekViews?.count || 0
        },
        clicks: {
            total: totalClicks?.count || 0,
            topLinks
        },
        dailyViews
    });
});

// Get status (for main site)
app.get('/api/status', (req, res) => {
    res.json({
        bot: 'online',
        script: 'working',
        website: 'online',
        roblox_version: 'Latest',
        last_update: new Date().toISOString()
    });
});

// Get update logs
app.get('/api/logs', (req, res) => {
    // In production, these would come from a database/config
    res.json([
        { date: '2026-08-01', text: 'Performance fixes & bug patches' },
        { date: '2026-07-28', text: 'New aimbot settings added' },
        { date: '2026-07-25', text: 'ESP visuals overhaul' },
        { date: '2026-07-20', text: 'Hood Customs full support' },
        { date: '2026-07-15', text: 'Silent aim improvements' }
    ]);
});

app.listen(PORT, () => {
    console.log(`alternate API running on port ${PORT}`);
});
