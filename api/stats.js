module.exports = async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const SELLAUTH_API_KEY = process.env.SELLAUTH_API_KEY;
        const SHOP_ID = process.env.SELLAUTH_SHOP_ID;
        const PRODUCT_ID = process.env.SELLAUTH_PRODUCT_ID;

        if (!SELLAUTH_API_KEY || !SHOP_ID || !PRODUCT_ID) {
            return res.status(500).json({ error: 'SellAuth credentials not configured' });
        }

        const response = await fetch(`https://api.sellauth.com/v1/shops/${SHOP_ID}/products/${PRODUCT_ID}`, {
            headers: {
                'Authorization': `Bearer ${SELLAUTH_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`SellAuth API error: ${response.statusText}`);
        }

        const productData = await response.json();
        
        const stock = productData.stock_count || 0;
        const sold = productData.products_sold || 0;

        return res.status(200).json({ 
            buyers: sold, 
            keys_remaining: stock 
        });

    } catch (err) {
        res.status(500).json({ error: err.message, buyers: 0, keys_remaining: 0 });
    }
}
