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

async function loadDashboard() {
    try {
        const response = await fetch('/api/admin', {
            headers: { 'password': currentPassword }
        });
        const data = await response.json();
        if (data.keys_remaining !== undefined) {
            document.getElementById('key-stock').innerText = data.keys_remaining;
        }
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('add-key-btn').addEventListener('click', async () => {
    const keyInput = document.getElementById('new-key-input').value;
    const btn = document.getElementById('add-key-btn');
    if (!keyInput) return;

    btn.innerText = 'Adding...';
    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'password': currentPassword
            },
            body: JSON.stringify({ action: 'add_key', payload: { key_value: keyInput } })
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('new-key-input').value = '';
            btn.innerText = 'Success!';
            loadDashboard(); // Refresh stock
        } else {
            btn.innerText = 'Error';
        }
    } catch (err) {
        btn.innerText = 'Error';
    }
    setTimeout(() => btn.innerText = 'Add Key', 2000);
});

document.getElementById('save-settings-btn').addEventListener('click', () => {
    // For a future update if they want to save settings to DB.
    // Right now it just shows a success message.
    const btn = document.getElementById('save-settings-btn');
    btn.innerText = 'Saved!';
    setTimeout(() => btn.innerText = 'Save Settings', 2000);
});
