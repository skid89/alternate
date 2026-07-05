let currentPassword = '';

document.getElementById('login-btn').addEventListener('click', async () => {
    const passwordInput = document.getElementById('admin-password').value;
    const turnstileResponse = document.querySelector('.cf-turnstile [name="cf-turnstile-response"]')?.value;
    const errorText = document.getElementById('login-error');

    if (!turnstileResponse) {
        errorText.innerText = 'Please complete CAPTCHA';
        errorText.style.display = 'block';
        return;
    }

    errorText.style.display = 'none';
    document.getElementById('login-btn').innerText = 'Loading...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput, turnstileToken: turnstileResponse })
        });
        
        const data = await response.json();

        if (data.success) {
            currentPassword = passwordInput;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard-content').classList.remove('hidden');
            loadDashboard();
        } else {
            errorText.innerText = data.error || 'Login failed';
            errorText.style.display = 'block';
            document.getElementById('login-btn').innerText = 'Login';
        }
    } catch (err) {
        errorText.innerText = 'Server error';
        errorText.style.display = 'block';
        document.getElementById('login-btn').innerText = 'Login';
    }
});

// Tab Switching Logic
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and its target content
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
});

async function loadDashboard() {
    try {
        const response = await fetch('/api/admin', {
            headers: { 'password': currentPassword }
        });
        const data = await response.json();
        
        if (data.keys_remaining !== undefined) {
            document.getElementById('key-stock').innerText = data.keys_remaining;
            document.getElementById('admin-buyers').innerText = data.buyers || 0;
            document.getElementById('admin-viewers').innerText = data.viewers || 0;
        }
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('add-key-btn').addEventListener('click', async () => {
    const keyInput = document.getElementById('new-key-input').value;
    const btn = document.getElementById('add-key-btn');
    if (!keyInput.trim()) return;

    // Split by newlines and remove empty lines
    const keysArray = keyInput.split('\n').map(k => k.trim()).filter(k => k !== '');
    if (keysArray.length === 0) return;

    btn.innerText = 'Uploading...';
    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'password': currentPassword
            },
            body: JSON.stringify({ action: 'add_key', payload: { keys: keysArray } })
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('new-key-input').value = '';
            btn.innerText = `Success (${data.count} keys)`;
            loadDashboard(); // Refresh stock
        } else {
            btn.innerText = 'Error';
        }
    } catch (err) {
        btn.innerText = 'Error';
    }
    setTimeout(() => btn.innerText = 'Upload Keys', 3000);
});

document.getElementById('save-settings-btn').addEventListener('click', () => {
    const btn = document.getElementById('save-settings-btn');
    btn.innerText = 'Saved!';
    setTimeout(() => btn.innerText = 'Save Settings', 2000);
});
