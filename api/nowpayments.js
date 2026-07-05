const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Validate NOWPayments IPN Signature
function verifySignature(payload, signature, ipnSecret) {
    const hmac = crypto.createHmac('sha512', ipnSecret);
    // Sort keys alphabetically
    const keys = Object.keys(payload).sort();
    const sortedPayload = {};
    for (const key of keys) {
        sortedPayload[key] = payload[key];
    }
    hmac.update(JSON.stringify(sortedPayload));
    const expectedSignature = hmac.digest('hex');
    return expectedSignature === signature;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const signature = req.headers['x-nowpayments-sig'];

        if (!ipnSecret || !supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Server misconfigured' });
        }

        if (!signature) {
            return res.status(401).json({ error: 'No signature' });
        }

        // 1. Verify Signature
        const isValid = verifySignature(req.body, signature, ipnSecret);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const { payment_status, order_id } = req.body; // order_id is our crypto_session_id

        if (!order_id) {
            return res.status(400).json({ error: 'Missing order_id' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Only dispense key if payment is "finished"
        if (payment_status === 'finished') {
            // Check if session is already paid to prevent double dispensing
            const { data: sessionData } = await supabase.from('crypto_sessions').select('status').eq('id', order_id).single();
            
            if (sessionData && sessionData.status === 'pending') {
                // Find a free key and update it atomically using RPC or update limit
                // Wait, since we are doing this in JS, we can just grab one, but a Postgres RPC is safer.
                // We'll assume the user hasn't made an RPC for dispense yet, so we'll do it manually.
                const { data: keysData, error: keysError } = await supabase
                    .from('keys')
                    .select('id, key_value')
                    .eq('used', false)
                    .limit(1);

                if (!keysError && keysData && keysData.length > 0) {
                    const assignedKey = keysData[0];
                    
                    // Mark key as used
                    await supabase.from('keys').update({ used: true }).eq('id', assignedKey.id);
                    
                    // Update session
                    await supabase.from('crypto_sessions').update({ 
                        status: 'paid', 
                        license_key: assignedKey.key_value 
                    }).eq('id', order_id);

                    // Update stats (add buyer)
                    const { data: statsData } = await supabase.from('stats').select('*').single();
                    if (statsData) {
                        await supabase.from('stats').update({ buyers: statsData.buyers + 1 }).eq('id', statsData.id);
                    }
                }
            }
        }

        return res.status(200).json({ success: true });

    } catch (e) {
        console.error("NOWPayments Webhook Error:", e);
        return res.status(500).json({ error: e.message });
    }
};
