import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            // Fallback for development if keys aren't set in .env
            return res.status(200).json({ viewers: 142000, buyers: 10000, keys_remaining: 15 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        if (req.method === 'POST') {
            const { action } = req.body;
            
            const { data, error } = await supabase.from('stats').select('*').single();
            if (error) throw error;

            let newViewers = data.viewers;
            let newBuyers = data.buyers;

            if (action === 'view') newViewers += 1;
            if (action === 'buy') newBuyers += 1;

            await supabase.from('stats').update({ viewers: newViewers, buyers: newBuyers }).eq('id', data.id);
            const { count: keysRemaining } = await supabase.from('keys').select('*', { count: 'exact', head: true }).eq('used', false);
            
            return res.status(200).json({ viewers: newViewers, buyers: newBuyers, keys_remaining: keysRemaining || 0 });
        } else {
            // GET
            const { data, error } = await supabase.from('stats').select('*').single();
            if (error) throw error;
            
            const { count: keysRemaining } = await supabase.from('keys').select('*', { count: 'exact', head: true }).eq('used', false);
            
            return res.status(200).json({ viewers: data.viewers, buyers: data.buyers, keys_remaining: keysRemaining || 0 });
        }
    } catch (err) {
        // Fallback on error
        res.status(500).json({ error: err.message, viewers: 142000, buyers: 10000, keys_remaining: 15 });
    }
}
