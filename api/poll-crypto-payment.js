const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Missing session_id' });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Server misconfigured.' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: sessionData, error } = await supabase
            .from('crypto_sessions')
            .select('status, license_key')
            .eq('id', session_id)
            .single();

        if (error || !sessionData) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        return res.status(200).json({ 
            status: sessionData.status,
            license_key: sessionData.license_key 
        });

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
