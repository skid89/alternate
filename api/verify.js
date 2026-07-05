const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id in URL.' });
    }

    if (!supabase || !process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Server misconfigured. Missing environment variables.' });
    }

    try {
        // 1. Verify the session with Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Payment not completed.' });
        }

        // 2. Check if we already claimed a key for this exact session
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('session_id', session_id)
            .single();

        if (existingOrder) {
            // Already dispensed a key for this payment, just return it again
            return res.status(200).json({ key: existingOrder.license_key });
        }

        // 3. Find an unused key
        const { data: availableKeys, error: keyError } = await supabase
            .from('keys')
            .select('*')
            .eq('used', false)
            .limit(1);

        if (keyError || !availableKeys || availableKeys.length === 0) {
            return res.status(500).json({ error: 'OUT OF STOCK! Please open a ticket in our Discord to claim your key manually.' });
        }

        const claimedKey = availableKeys[0];

        // 4. Mark key as used
        await supabase
            .from('keys')
            .update({ used: true })
            .eq('id', claimedKey.id);

        // 5. Record the order to prevent double-claiming
        await supabase
            .from('orders')
            .insert([{ session_id: session_id, license_key: claimedKey.key_value }]);

        // 6. Increment buyers stat
        try {
            const { data: stats } = await supabase.from('stats').select('*').single();
            if (stats) {
                await supabase.from('stats').update({ buyers: stats.buyers + 1 }).eq('id', stats.id);
            }
        } catch(e) {}

        // 7. Return the key!
        return res.status(200).json({ key: claimedKey.key_value });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
