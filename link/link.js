// Link page - connects to API
const API = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

// Custom cursor
(function(){
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    document.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
    document.querySelectorAll('a, button, .social-icon').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
})();

// Music player
(function(){
    const btn = document.getElementById('musicBtn');
    const audio = document.getElementById('audio');
    const progress = document.getElementById('musicProgress');
    if (!btn || !audio) return;
    let playing = false;
    btn.addEventListener('click', () => {
        if (playing) { audio.pause(); btn.innerHTML = '<i class="fas fa-play"></i>'; }
        else { audio.play().catch(()=>{}); btn.innerHTML = '<i class="fas fa-pause"></i>'; }
        playing = !playing;
    });
    audio.addEventListener('timeupdate', () => { if(audio.duration && progress) progress.style.width = (audio.currentTime/audio.duration*100)+'%'; });
})();

// Alias checker (real API)
(function(){
    const input = document.getElementById('aliasInput');
    const result = document.getElementById('aliasResult');
    if (!input || !result) return;
    let timer = null;

    input.addEventListener('input', () => {
        clearTimeout(timer);
        const val = input.value.trim();
        if (!val) { result.textContent = ''; result.className = 'alias-result'; return; }
        if (!/^[a-zA-Z0-9_]+$/.test(val)) { result.textContent = 'invalid'; result.className = 'alias-result no'; return; }
        if (val.length < 3) { result.textContent = 'too short'; result.className = 'alias-result no'; return; }

        result.textContent = '...'; result.className = 'alias-result wait';
        timer = setTimeout(async () => {
            try {
                const res = await fetch(`${API}/api/alias/check/${val}`);
                const data = await res.json();
                if (data.available) { result.textContent = 'available'; result.className = 'alias-result ok'; }
                else { result.textContent = data.reason || 'taken'; result.className = 'alias-result no'; }
            } catch(e) {
                result.textContent = 'error'; result.className = 'alias-result no';
            }
        }, 300);
    });
})();

// Load recent users
(function(){
    const list = document.getElementById('recentUsers');
    if (!list) return;
    fetch(`${API}/api/users/recent`).then(r=>r.json()).then(users => {
        list.innerHTML = '';
        users.forEach(u => {
            const el = document.createElement('div');
            el.className = 'recent-user';
            el.innerHTML = `<span>${u.display_name || u.username}</span>`;
            list.appendChild(el);
        });
    }).catch(()=>{});
})();

// External link handler
document.addEventListener('click', e => {
    const ext = e.target.closest('[data-external]');
    if (ext) { e.preventDefault(); window.open(ext.dataset.external, '_blank'); }
});

// Parallax on card
(function(){
    const card = document.getElementById('linkCard');
    if (!card) return;
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y*-6}deg) rotateY(${x*6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
})();


// Login modal
(function(){
    const modal = document.getElementById('loginModal');
    const openBtn = document.getElementById('loginBtn');
    const closeBtn = document.getElementById('closeLogin');
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('loginError');

    openBtn?.addEventListener('click', () => modal.classList.add('active'));
    closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async e => {
        e.preventDefault();
        errorEl.textContent = '';
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;

        try {
            const res = await fetch(`${API}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) { errorEl.textContent = data.error || 'Login failed'; return; }
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = 'dashboard.html';
        } catch(e) {
            errorEl.textContent = 'Connection error';
        }
    });

    // If already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
        // verify token is still valid
        fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
            .then(r => { if(r.ok) window.location.href = 'dashboard.html'; else localStorage.removeItem('token'); })
            .catch(() => {});
    }
})();
