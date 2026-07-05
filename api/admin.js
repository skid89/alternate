const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    const { password } = req.headers;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
        try {
            const { count: keysRemaining } = await supabase
                .from('keys')
                .select('*', { count: 'exact', head: true })
                .eq('used', false);
            
            const { data: statsData } = await supabase.from('stats').select('*').single();
            const viewers = statsData ? statsData.viewers : 0;
            const buyers = statsData ? statsData.buyers : 0;
            
            return res.status(200).json({ 
                keys_remaining: keysRemaining || 0,
                viewers: viewers,
                buyers: buyers
            });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    } 
    
    if (req.method === 'POST') {
        const { action, payload } = req.body;
        
        if (action === 'add_key') {
            const { keys } = payload;
            if (!keys || !Array.isArray(keys) || keys.length === 0) {
                return res.status(400).json({ error: 'No keys provided' });
            }

            const insertPayload = keys.map(k => ({ key_value: k, used: false }));
            
            const { error } = await supabase.from('keys').insert(insertPayload);
            if (error) return res.status(500).json({ error: error.message });

            return res.status(200).json({ success: true, count: keys.length });
        }

        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
