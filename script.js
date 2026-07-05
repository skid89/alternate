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

// --- Pricing Panel Logic ---
function showPaymentMethod(method) {
    // Hide all payment infos
    document.querySelectorAll('.payment-info').forEach(el => el.classList.add('hidden'));

    // Show selected payment info
    const selected = document.getElementById(`${method}-info`);
    if (selected) {
        selected.classList.remove('hidden');
    }

    // If crypto is selected, nothing special needed
}

// NOWPayments Checkout Logic
const npBtn = document.getElementById('nowpayments-btn');
if (npBtn) {
    npBtn.addEventListener('click', async () => {
        const errText = document.getElementById('crypto-error');
        errText.style.display = 'none';
        npBtn.innerText = 'Creating Invoice...';
        
        try {
            const res = await fetch('/api/create-crypto-payment', { method: 'POST' });
            const data = await res.json();
            
            if (data.invoice_url) {
                window.location.href = data.invoice_url;
            } else {
                errText.innerText = data.error || 'Failed to connect to NOWPayments';
                errText.style.display = 'block';
                npBtn.innerText = 'Pay with Crypto';
            }
        } catch (e) {
            errText.innerText = 'Server error. Please try again later.';
            errText.style.display = 'block';
            npBtn.innerText = 'Pay with Crypto';
        }
    });
}

// Copy Address Logic
document.querySelector('.copy-btn').addEventListener('click', () => {
    const address = document.getElementById('crypto-address').innerText;
    navigator.clipboard.writeText(address).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    });
});

// --- Stripe Checkout Logic ---
const stripeCheckoutBtn = document.getElementById('stripe-checkout-btn');

if (stripeCheckoutBtn) {
    stripeCheckoutBtn.addEventListener('click', async () => {
        stripeCheckoutBtn.innerText = 'Redirecting...';
        
        // Ping analytics silently
        fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'buy' })
        }).catch(() => {});

        // Redirect to Stripe Payment Link
        window.location.href = "https://buy.stripe.com/aFa8wI2jI7QgajdaqR1Fe00";
    });
}

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

        // Fetch current stats
        const { data: statsData, error: statsError } = await supabaseClient.from('stats').select('*').single();
        if (statsError) throw statsError;

        // Fetch key stock securely using our custom SQL function so hackers can't read the keys table
        const { data: keysRemaining, error: keysError } = await supabaseClient.rpc('get_stock');
        
        if (keysError) throw keysError;

        const stats = {
            viewers: (statsData.viewers || 0) + 1,
            buyers: statsData.buyers || 0,
            keys_remaining: keysRemaining || 0
        };

        // Increment view count silently
        supabaseClient.from('stats').update({ viewers: stats.viewers }).eq('id', statsData.id).then();

        // Update DOM numbers for panels
        document.getElementById('total-buyers-text').innerText = stats.buyers;
        document.getElementById('total-stock-text').innerText = stats.keys_remaining;

        // Update Top Right Badges
        const badgeBuyers = document.getElementById('badge-buyers');
        const badgeStock = document.getElementById('badge-stock');
        if (badgeBuyers) badgeBuyers.innerText = stats.buyers;
        if (badgeStock) badgeStock.innerText = stats.keys_remaining;

        // Out of stock logic
        if (stats.keys_remaining <= 0) {
            const stripeContainer = document.getElementById('stripe-embed-container');
            const oosMsg = document.getElementById('out-of-stock-msg');
            if (stripeContainer && oosMsg) {
                stripeContainer.classList.add('hidden');
                oosMsg.classList.remove('hidden');
            }
        }

        return stats;
    } catch (err) {
        console.error("Failed to load real stats via Client Supabase", err);
        const fallback = { viewers: 0, buyers: 0, keys_remaining: 0 };
        
        const bBuyers = document.getElementById('badge-buyers');
        const bStock = document.getElementById('badge-stock');
        const tBuyers = document.getElementById('total-buyers-text');
        const tStock = document.getElementById('total-stock-text');
        
        if (bBuyers) bBuyers.innerText = 0;
        if (bStock) bStock.innerText = 0;
        if (tBuyers) tBuyers.innerText = 0;
        if (tStock) tStock.innerText = 0;
        
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
