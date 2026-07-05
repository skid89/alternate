let currentPassword = '';

const SUPABASE_URL = 'https://snkcqfnzvjmjwltioomo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNua2NxZm56dmptandsdGlvb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTkxMDgsImV4cCI6MjA5ODc5NTEwOH0.Hn4fJzrdJ9bDaFLZMp-wkkVJUWvVwcnmwzHU6tKVAko';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Top Tab Switching Logic
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
});

// Sub Tab Switching Logic
document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-sub')).classList.add('active');
    });
});

async function loadDashboard() {
    try {
        // 1. Load Real Key Stock via RPC
        const { data: keysRemaining, error: keysError } = await supabaseClient.rpc('get_stock');
        if (!keysError) {
            document.getElementById('key-stock').innerText = keysRemaining || 0;
        }

        // 2. Load Stats for Overrides
        const { data: statsData } = await supabaseClient.from('stats').select('*').single();
        if (statsData) {
            document.getElementById('override-buyers').value = statsData.buyers || 0;
            document.getElementById('override-viewers').value = statsData.viewers || 0;
        }

        // 3. Load CMS Settings
        const { data: settingsData } = await supabaseClient.from('settings').select('*').single();
        if (settingsData) {
            document.getElementById('cms-showcase').value = settingsData.showcase_url || '';
            document.getElementById('cms-features').value = settingsData.features_html || '';
            document.getElementById('cms-executors').value = settingsData.executors_html || '';
            document.getElementById('cms-games').value = settingsData.games_html || '';
            
            document.getElementById('cms-crypto-btc').value = settingsData.crypto_btc || '';
            document.getElementById('cms-crypto-ltc').value = settingsData.crypto_ltc || '';
            document.getElementById('cms-crypto-eth').value = settingsData.crypto_eth || '';
        }

        // 4. Load All Keys for Key Manager
        const keysResponse = await fetch('/api/admin?action=get_keys', { headers: { 'password': currentPassword } });
        const keysData = await keysResponse.json();
        const tbody = document.getElementById('key-manager-list');
        
        if (keysData.keys && keysData.keys.length > 0) {
            tbody.innerHTML = keysData.keys.map(k => `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 10px; font-family: monospace;">${k.key_value}</td>
                    <td style="padding: 10px;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; background: ${k.used ? '#451a1a; color: #ef4444;' : '#143823; color: #4ade80;'}">
                            ${k.used ? 'USED' : 'AVAILABLE'}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="2" style="padding: 10px; text-align: center; color: #888;">No keys found.</td></tr>';
        }

    } catch (err) {
        console.error(err);
    }
}

// Bulk Upload Keys (Still requires Vercel for security)
document.getElementById('add-key-btn').addEventListener('click', async () => {
    const keyInput = document.getElementById('new-key-input').value;
    const btn = document.getElementById('add-key-btn');
    if (!keyInput.trim()) return;

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
            loadDashboard();
        } else {
            btn.innerText = 'Error';
        }
    } catch (err) {
        btn.innerText = 'Error';
    }
    setTimeout(() => btn.innerText = 'Upload Keys', 3000);
});


// Save CMS Settings
document.getElementById('save-cms-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-cms-btn');
    btn.innerText = 'Saving...';

    const payload = {
        showcase_url: document.getElementById('cms-showcase').value,
        features_html: document.getElementById('cms-features').value,
        executors_html: document.getElementById('cms-executors').value,
        games_html: document.getElementById('cms-games').value,
        crypto_btc: document.getElementById('cms-crypto-btc').value,
        crypto_ltc: document.getElementById('cms-crypto-ltc').value,
        crypto_eth: document.getElementById('cms-crypto-eth').value
    };

    try {
        const { data: settingsData } = await supabaseClient.from('settings').select('id').single();
        if (settingsData) {
            await supabaseClient.from('settings').update(payload).eq('id', settingsData.id);
            btn.innerText = 'Saved!';
        } else {
            // If row doesn't exist yet, insert it
            await supabaseClient.from('settings').insert([payload]);
            btn.innerText = 'Saved!';
        }
    } catch (e) {
        // Try inserting if single() fails because empty
        await supabaseClient.from('settings').insert([payload]);
        btn.innerText = 'Saved!';
    }
    setTimeout(() => btn.innerText = 'Save All Website Content', 2000);
});
