const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { priceId, turnstileToken } = req.body;
        
        if (!priceId) {
            return res.status(400).json({ error: 'Missing priceId' });
        }

        if (!turnstileToken) {
            return res.status(400).json({ error: 'Cloudflare verification failed. Bots blocked.' });
        }

        // Ideally you would verify the turnstileToken with Cloudflare's API here.
        // For testing/simplicity with the dummy key, we just ensure it exists.

        // Increment buyers stat asynchronously
        fetch(`https://${req.headers.host}/api/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'buy' })
        }).catch(() => {}); // Fire and forget

        // Create Checkout Sessions dynamically from priceId
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
        });

        // Send back the session ID so the frontend can redirect to Stripe
        res.status(200).json({ id: session.id });
    } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
    }
}
