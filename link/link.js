// Link page logic

// Custom cursor
(function() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .social-icon').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
})();

// Music player
(function() {
    const btn = document.getElementById('musicBtn');
    const audio = document.getElementById('audio');
    const progress = document.getElementById('musicProgress');
    if (!btn || !audio) return;

    let playing = false;

    btn.addEventListener('click', () => {
        if (playing) {
            audio.pause();
            btn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audio.play().catch(() => {});
            btn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        playing = !playing;
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
        }
    });
})();

// Alias checker
(function() {
    const input = document.getElementById('aliasInput');
    const result = document.getElementById('aliasResult');
    if (!input || !result) return;

    let timer = null;
    const taken = ['admin', 'alternate', 'koni', 'test', 'user', 'root'];

    input.addEventListener('input', () => {
        clearTimeout(timer);
        const val = input.value.trim();

        if (!val) { result.textContent = ''; result.className = 'alias-result'; return; }
        if (!/^[a-zA-Z0-9_]+$/.test(val)) {
            result.textContent = 'invalid';
            result.className = 'alias-result no';
            return;
        }
        if (val.length < 3) {
            result.textContent = 'too short';
            result.className = 'alias-result no';
            return;
        }

        result.textContent = '...';
        result.className = 'alias-result wait';

        timer = setTimeout(() => {
            if (taken.includes(val.toLowerCase())) {
                result.textContent = 'taken';
                result.className = 'alias-result no';
            } else {
                result.textContent = 'available';
                result.className = 'alias-result ok';
            }
        }, 400);
    });
})();

// External link handler
document.addEventListener('click', e => {
    const ext = e.target.closest('[data-external]');
    if (ext) {
        e.preventDefault();
        window.open(ext.getAttribute('data-external'), '_blank');
    }
});
