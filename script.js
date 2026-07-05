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

    // If crypto is selected, default to BTC
    if (method === 'crypto') {
        showCrypto('btc');
    }
}

// Crypto Data Placeholders
const cryptoData = {
    btc: { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
    ltc: { address: 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
    eth: { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
};

let currentQrcode = null;

function showCrypto(currency) {
    // Update active tab styling
    document.querySelectorAll('.crypto-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.innerText.toLowerCase() === currency) {
            tab.classList.add('active');
        }
    });

    const data = cryptoData[currency];
    document.getElementById('crypto-address').innerText = data.address;

    // Generate QR Code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ''; // Clear previous QR

    currentQrcode = new QRCode(qrContainer, {
        text: data.address,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
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
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Chart.js & Real Analytics Logic ---
async function fetchRealStats() {
    try {
        // Fetch current stats
        const { data: statsData, error: statsError } = await supabase.from('stats').select('*').single();
        if (statsError) throw statsError;

        // Fetch key stock securely using our custom SQL function so hackers can't read the keys table
        const { data: keysRemaining, error: keysError } = await supabase.rpc('get_stock');
        
        if (keysError) throw keysError;

        const stats = {
            viewers: (statsData.viewers || 0) + 1,
            buyers: statsData.buyers || 0,
            keys_remaining: keysRemaining || 0
        };

        // Increment view count silently
        supabase.from('stats').update({ viewers: stats.viewers }).eq('id', statsData.id).then();

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
