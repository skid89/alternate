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
const stripeProductSelect = document.getElementById('stripe-product-select');

if (stripeCheckoutBtn && stripeProductSelect) {
    stripeCheckoutBtn.addEventListener('click', async () => {
        const selectedPriceId = stripeProductSelect.value;
        const turnstileResponse = document.querySelector('#stripe-info [name="cf-turnstile-response"]')?.value;

        if (!turnstileResponse) {
            stripeCheckoutBtn.innerText = 'Please complete CAPTCHA';
            return;
        }

        stripeCheckoutBtn.innerText = 'Loading...';
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: selectedPriceId,
                    turnstileToken: turnstileResponse
                })
            });
            const session = await response.json();

            if (session.error) {
                console.error(session.error);
                stripeCheckoutBtn.innerText = 'Error: ' + session.error;
                return;
            }

            // Replace with your real public stripe key
            const stripe = Stripe('pk_live_51SKTKz2OaP3owCzDs5rWpsYEoOmAZLtSPFnR7GFg9vGkBvbXdTwAQgbJG6npYaMQpwoQEGmBLJJAbVQFt2jkeSEo00pQn7pgwY');
            await stripe.redirectToCheckout({ sessionId: session.id });
        } catch (error) {
            console.error('Error:', error);
            stripeCheckoutBtn.innerText = 'Error loading Stripe';
        }
    });
}

// --- Chart.js & Real Analytics Logic ---
async function fetchRealStats() {
    try {
        // Increment view count when they hit the site
        const res = await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'view' })
        });

        const stats = await res.json();

        // Update DOM numbers
        document.getElementById('total-buyers-text').innerText = stats.buyers || 10000;
        document.getElementById('total-viewers-text').innerText = stats.viewers || 142000;

        return stats;
    } catch (err) {
        console.error("Failed to load real stats", err);
        return { viewers: 142000, buyers: 10000 };
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
                        label: 'Total Viewers',
                        // Just a dummy growth curve ending in their real stat
                        data: [20000, 35000, 50000, 75000, 100000, 120000, stats.viewers],
                        borderColor: '#888888',
                        backgroundColor: 'rgba(136, 136, 136, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Total Buyers',
                        data: [500, 1200, 2500, 4800, 7000, 8500, stats.buyers],
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: { ticks: { color: '#888888' }, grid: { color: '#333333' } },
                    y: { ticks: { color: '#888888' }, grid: { color: '#333333' } }
                }
            }
        });
    }
});
