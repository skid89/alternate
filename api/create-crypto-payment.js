const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const nowPaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;

        if (!supabaseUrl || !supabaseKey || !nowPaymentsApiKey) {
            return res.status(500).json({ error: 'Server misconfigured. Missing API keys.' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Create a session ID
        const crypto_session_id = crypto.randomUUID();
        
        // Ensure success URL points to success.html with session_id query param
        const host = req.headers.host || 'alternate.lol';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const successUrl = `${protocol}://${host}/success.html?crypto_session_id=${crypto_session_id}`;

        // 2. Call NOWPayments API to create an invoice
        const nowPaymentsPayload = {
            price_amount: 10.00, // $10.00 USD
            price_currency: 'usd',
            order_id: crypto_session_id,
            order_description: 'alternate.lol Lifetime License',
            success_url: successUrl,
            cancel_url: `${protocol}://${host}/`
        };

        const nowPaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': nowPaymentsApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nowPaymentsPayload)
        });

        const npData = await nowPaymentsResponse.json();

        if (!nowPaymentsResponse.ok || !npData.invoice_url) {
            console.error("NOWPayments Error:", npData);
            return res.status(500).json({ error: 'Failed to generate crypto invoice.' });
        }

        // 3. Save session to Supabase
        const { error: dbError } = await supabase.from('crypto_sessions').insert([
            {
                id: crypto_session_id,
                status: 'pending',
                nowpayments_invoice_id: npData.id,
                license_key: null
            }
        ]);

        if (dbError) {
            return res.status(500).json({ error: 'Failed to create payment session.', details: dbError.message });
        }

        // 4. Return invoice URL
        return res.status(200).json({ invoice_url: npData.invoice_url });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
};
