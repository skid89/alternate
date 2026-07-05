// Initialize Supabase (You must replace these placeholders with your actual Supabase URL and Anon Key)
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('admin-dashboard');

    // Check if already logged in
    checkSession();

    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showDashboard();
        }
    }

    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            errorMsg.innerText = "Please enter both email and password.";
            errorMsg.style.display = "block";
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            errorMsg.innerText = error.message;
            errorMsg.style.display = "block";
        } else {
            errorMsg.style.display = "none";
            showDashboard();
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        hideDashboard();
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    }

    function hideDashboard() {
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        emailInput.value = '';
        passwordInput.value = '';
    }
});
