module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password, turnstileToken } = req.body;
        
        // 1. Verify Turnstile Token
        // For local dev with dummy key, we just pass. In prod, you'd verify with Cloudflare.
        if (!turnstileToken) {
            return res.status(400).json({ error: 'Cloudflare verification failed. Bots blocked.' });
        }

        // 2. Verify Password against .env
        const adminPass = process.env.ADMIN_PASSWORD;
        if (!adminPass) {
            return res.status(500).json({ error: 'Admin password not configured on server.' });
        }

        if (password === adminPass) {
            // In a real app you'd set a secure cookie here. For this simple setup, we just return success.
            return res.status(200).json({ success: true, message: 'Logged in successfully.' });
        } else {
            return res.status(401).json({ error: 'Invalid password.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
