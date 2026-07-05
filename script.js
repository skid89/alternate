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

    // Wait for the CSS animations to finish (approx 2.5s total), then fade out loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
        }, 800); // Wait for fade out transition
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
});




const SUPABASE_URL = 'https://snkcqfnzvjmjwltioomo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNua2NxZm56dmptandsdGlvb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTkxMDgsImV4cCI6MjA5ODc5NTEwOH0.Hn4fJzrdJ9bDaFLZMp-wkkVJUWvVwcnmwzHU6tKVAko';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Chart.js & Real Analytics Logic ---
async function fetchRealStats() {
    try {
        // Fetch CMS settings
        const { data: settingsData } = await supabaseClient.from('settings').select('*').single();
        if (settingsData) {
            if (settingsData.features_html) {
                document.getElementById('display-features').innerHTML = settingsData.features_html;
            } else {
                document.getElementById('display-features').innerHTML = '<li>No features listed yet.</li>';
            }
            if (settingsData.executors_html) {
                document.getElementById('display-executors').innerHTML = settingsData.executors_html;
            } else {
                document.getElementById('display-executors').innerHTML = '<li>No executors listed yet.</li>';
            }
            if (settingsData.games_html) {
                document.getElementById('display-games').innerHTML = settingsData.games_html;
            } else {
                document.getElementById('display-games').innerHTML = '<li>No games listed yet.</li>';
            }
            if (settingsData.showcase_url) {
                // If it's a youtube link, embed it properly
                const url = settingsData.showcase_url;
                let embedUrl = url;
                if (url.includes('youtube.com/watch?v=')) {
                    embedUrl = url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
                } else if (url.includes('youtu.be/')) {
                    embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
                }
                document.getElementById('display-showcase-container').innerHTML = `<iframe width="100%" height="250" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
            } else {
                document.getElementById('display-showcase-container').innerHTML = '<div style="padding: 40px; background: #111; text-align: center; border: 1px solid #333;">Video Coming Soon</div>';
            }
            
        } else {
            const el1 = document.getElementById('display-features');
            const el2 = document.getElementById('display-executors');
            const el3 = document.getElementById('display-games');
            const el4 = document.getElementById('display-showcase-container');
            if (el1) el1.innerHTML = '<li>No features listed yet.</li>';
            if (el2) el2.innerHTML = '<li>No executors listed yet.</li>';
            if (el3) el3.innerHTML = '<li>No games listed yet.</li>';
            if (el4) el4.innerHTML = '<div style="padding: 40px; background: #111; text-align: center; border: 1px solid #333;">Video Coming Soon</div>';
        }

        // Fetch stats from our backend (which now uses SellAuth API)
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();

        // Update Top Right Badges (if they exist)
        const badgeBuyers = document.getElementById('badge-buyers');
        const badgeStock = document.getElementById('badge-stock');
        if (badgeBuyers) badgeBuyers.innerText = stats.buyers;
        if (badgeStock) badgeStock.innerText = stats.keys_remaining;

        // Dynamic Stock Bar Logic
        const maxStock = 100;
        const currentStock = stats.keys_remaining || 0;
        const stockPercent = Math.min((currentStock / maxStock) * 100, 100);
        
        const stockText = document.getElementById('dynamic-stock-count');
        const stockFill = document.getElementById('stock-bar-fill');
        const stockWarning = document.getElementById('stock-warning-text');
        
        if (stockText) stockText.innerText = currentStock;
        if (stockFill) {
            stockFill.style.width = stockPercent + '%';
            if (currentStock <= 20) {
                stockFill.classList.add('low');
                if (stockWarning) stockWarning.style.display = 'block';
            } else {
                stockFill.classList.remove('low');
                if (stockWarning) stockWarning.style.display = 'none';
            }
        }

        // Live Total Sales Counter (Add the 8 manual ones)
        const totalSales = stats.buyers + 8;
        const salesNumberEl = document.getElementById('sales-number');
        const salesCounterEl = document.getElementById('sales-counter');
        if (salesNumberEl && salesCounterEl) {
            salesNumberEl.innerText = totalSales;
            salesCounterEl.style.display = 'block';
        }

        return stats;
    } catch (err) {
        console.error("Failed to load real stats", err);
        const fallback = { viewers: 0, buyers: 0, keys_remaining: 0 };
        
        const bBuyers = document.getElementById('badge-buyers');
        const bStock = document.getElementById('badge-stock');
        
        if (bBuyers) bBuyers.innerText = 0;
        if (bStock) bStock.innerText = 0;
        
        return fallback;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const stats = await fetchRealStats();

    const ctx = document.getElementById('analyticsChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    {
                        label: 'Key Stock',
                        // Dummy history ending in real current stock
                        data: [50, 45, 40, 35, 25, 20, stats.keys_remaining],
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
                        data: [0, 5, 10, 15, 25, 30, stats.buyers],
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
});
// --- FOMO Toasts Logic ---
const fakeBuyers = [
    { country: 'Australia', price: 5 },
    { country: 'USA', price: 5 },
    { country: 'Britain', price: 5 },
    { country: 'Britain', price: 5 },
    { country: 'USA', price: 5 },
    { country: 'Australia', price: 5 },
    { country: 'EU', price: 5 },
    { country: 'EU', price: 5 },
    { country: 'USA', price: 6 }
];

function showToast() {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const randomBuyer = fakeBuyers[Math.floor(Math.random() * fakeBuyers.length)];
    const toast = document.createElement('div');
    toast.className = 'fomo-toast';
    toast.innerHTML = <ion-icon name="cart" class="icon"></ion-icon> Someone from <span class="highlight"> + randomBuyer.country + </span> just bought a Lifetime Key for $<span class="highlight"> + randomBuyer.price + </span>!;
    
    toastContainer.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// Trigger toasts randomly every 12 to 25 seconds
function startToasts() {
    setTimeout(() => {
        showToast();
        startToasts();
    }, Math.floor(Math.random() * (25000 - 12000 + 1) + 12000));
}

// Start toasts slightly after load
setTimeout(startToasts, 5000);
