document.addEventListener('DOMContentLoaded', () => {
    // Mouse Glow Logic (same as main site)
    const mouseGlow = document.getElementById('mouse-glow');
    document.addEventListener('mousemove', (e) => {
        if (mouseGlow) {
            mouseGlow.style.left = e.clientX + 'px';
            mouseGlow.style.top = e.clientY + 'px';
        }
    });

    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('admin-dashboard');

    // Simple session check (localStorage for demo purposes)
    if (localStorage.getItem('admin_logged_in') === 'true') {
        showDashboard();
    }

    loginBtn.addEventListener('click', async () => {
        const password = passwordInput.value;
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;

        if (!password) {
            errorMsg.innerText = "Please enter password.";
            errorMsg.style.display = "block";
            return;
        }
        
        if (!turnstileResponse) {
            errorMsg.innerText = "Please complete the Cloudflare challenge.";
            errorMsg.style.display = "block";
            return;
        }

        loginBtn.innerText = 'Verifying...';

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    password: password,
                    turnstileToken: turnstileResponse 
                })
            });

            const data = await res.json();

            if (data.error) {
                errorMsg.innerText = data.error;
                errorMsg.style.display = "block";
                loginBtn.innerText = 'Secure Login';
                // Reset turnstile widget on failure
                if (typeof turnstile !== 'undefined') turnstile.reset();
            } else {
                errorMsg.style.display = "none";
                localStorage.setItem('admin_logged_in', 'true');
                showDashboard();
                loginBtn.innerText = 'Secure Login';
            }
        } catch (err) {
            errorMsg.innerText = "Server error.";
            errorMsg.style.display = "block";
            loginBtn.innerText = 'Secure Login';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('admin_logged_in');
        hideDashboard();
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    }

    function hideDashboard() {
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        passwordInput.value = '';
    }
});
