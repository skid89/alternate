document.addEventListener('DOMContentLoaded', () => {
    // --- Mouse Glow Logic ---
    const mouseGlow = document.getElementById('mouse-glow');
    document.addEventListener('mousemove', (e) => {
        if (mouseGlow) {
            mouseGlow.style.left = e.clientX + 'px';
            mouseGlow.style.top = e.clientY + 'px';
        }
    });

    // --- Loading Screen Logic ---
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
        }, 800);
    }, 2800);

    // --- Sliding Panels Logic ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const closeButtons = document.querySelectorAll('.close-btn');
    const overlay = document.getElementById('overlay');
    let activePanel = null;

    function openPanel(targetId) {
        const panel = document.getElementById(`panel-${targetId}`);
        if (panel) {
            panel.classList.add('active');
            overlay.classList.add('active');
            activePanel = panel;
        }
    }

    function closePanel() {
        if (activePanel) {
            activePanel.classList.remove('active');
            overlay.classList.remove('active');
            activePanel = null;
        }
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            openPanel(target);
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', closePanel);
    });

    overlay.addEventListener('click', closePanel);

    // --- Info Sub-Tabs Logic ---
    document.querySelectorAll('.info-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.info-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.info-content').forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });
            
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
        });
    });

    // --- Stats & Chart ---
    loadStats();

    // --- 3D Video Slider ---
    initVideoSlider();

    // --- Minecraft Badge Context Menu ---
    initMCBadgeContextMenu();
});

function initVideoSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    if (!slides.length || !prevBtn || !nextBtn) return;

    let current = 0;
    let autoSlide;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function next() {
        current = (current + 1) % slides.length;
        showSlide(current);
    }

    function prev() {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    }

    function startAuto() {
        stopAuto();
        autoSlide = setInterval(next, 8000);
    }

    function stopAuto() {
        if (autoSlide) clearInterval(autoSlide);
    }

    prevBtn.addEventListener('click', () => {
        prev();
        startAuto();
    });

    nextBtn.addEventListener('click', () => {
        next();
        startAuto();
    });

    slides.forEach(slide => {
        slide.addEventListener('mouseenter', stopAuto);
        slide.addEventListener('mouseleave', startAuto);
    });

    showSlide(current);
    startAuto();
}

function initMCBadgeContextMenu() {
    const mcBadge = document.getElementById('mc-badge');
    const menu = document.getElementById('mc-context-menu');
    if (!mcBadge || !menu) return;

    mcBadge.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menu.style.top = e.clientY + 'px';
        menu.style.left = e.clientX + 'px';
        menu.classList.add('active');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !mcBadge.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            menu.classList.remove('active');
        }
    });
}

function closeMCBadge() {
    const mcBadge = document.getElementById('mc-badge');
    const menu = document.getElementById('mc-context-menu');
    if (mcBadge) mcBadge.style.display = 'none';
    if (menu) menu.classList.remove('active');
}

async function loadStats() {
    try {
        const statsRes = await fetch('/api/stats');
        if (!statsRes.ok) throw new Error('Stats API error');
        const stats = await statsRes.json();

        const buyers = stats.buyers || 0;
        const keysRemaining = stats.keys_remaining || 0;

        const badgeBuyers = document.getElementById('badge-buyers');
        const badgeStock = document.getElementById('badge-stock');
        if (badgeBuyers) badgeBuyers.textContent = buyers;
        if (badgeStock) badgeStock.textContent = keysRemaining;

        const maxStock = 100;
        const stockPercent = Math.min((keysRemaining / maxStock) * 100, 100);
        const stockText = document.getElementById('dynamic-stock-count');
        const stockFill = document.getElementById('stock-bar-fill');
        const stockWarning = document.getElementById('stock-warning-text');

        if (stockText) stockText.textContent = keysRemaining;
        if (stockFill) {
            stockFill.style.width = stockPercent + '%';
            if (keysRemaining <= 20) {
                stockFill.classList.add('low');
                if (stockWarning) stockWarning.style.display = 'block';
            } else {
                stockFill.classList.remove('low');
                if (stockWarning) stockWarning.style.display = 'none';
            }
        }

        const salesCounterEl = document.getElementById('sales-counter');
        if (salesCounterEl) {
            salesCounterEl.style.display = 'block';
        }

        renderChart(stats);
    } catch (err) {
        console.error('Failed to load stats', err);
        const bBuyers = document.getElementById('badge-buyers');
        const bStock = document.getElementById('badge-stock');
        if (bBuyers) bBuyers.textContent = '0';
        if (bStock) bStock.textContent = '0';
        const salesCounterEl = document.getElementById('sales-counter');
        if (salesCounterEl) salesCounterEl.style.display = 'block';
    }
}

function renderChart(stats) {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Key Stock',
                    data: [50, 45, 40, 35, 25, 20, stats.keys_remaining || 0],
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4ade80',
                    pointRadius: 4,
                    pointHoverRadius: 7
                },
                {
                    label: 'Total Buyers',
                    data: [0, 5, 10, 15, 25, 30, stats.buyers || 0],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointRadius: 4,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#333',
                    borderWidth: 1
                }
            },
            scales: {
                x: { ticks: { color: '#888888' }, grid: { color: '#222222' } },
                y: { ticks: { color: '#888888' }, grid: { color: '#222222' } }
            }
        }
    });
}

