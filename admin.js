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

// Save Stats Overrides
document.getElementById('save-stats-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-stats-btn');
    btn.innerText = 'Saving...';
    
    const newBuyers = parseInt(document.getElementById('override-buyers').value);
    const newViewers = parseInt(document.getElementById('override-viewers').value);

    try {
        // Because stats has only 1 row, we just fetch it first to get the ID, then update
        const { data: statsData } = await supabaseClient.from('stats').select('id').single();
        if (statsData) {
            await supabaseClient.from('stats').update({ buyers: newBuyers, viewers: newViewers }).eq('id', statsData.id);
            btn.innerText = 'Saved!';
        } else {
            btn.innerText = 'Error';
        }
    } catch (e) {
        btn.innerText = 'Error';
    }
    setTimeout(() => btn.innerText = 'Override Analytics', 2000);
});

// Save CMS Settings
document.getElementById('save-cms-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-cms-btn');
    btn.innerText = 'Saving...';

    const payload = {
        showcase_url: document.getElementById('cms-showcase').value,
        features_html: document.getElementById('cms-features').value,
        executors_html: document.getElementById('cms-executors').value,
        games_html: document.getElementById('cms-games').value
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
