const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'alternate.lol Lifetime Script',
                        },
                        unit_amount: 1500, // $15.00
                    },
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
