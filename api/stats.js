module.exports = async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const SELLAUTH_API_KEY = '5912277|jm75V0YRt2JREdvXlFwqinEeqzrxwHtPlRWqAPQy5451ad08';
        const SHOP_ID = '250507';
        const PRODUCT_ID = '780475';

        // Fetch product details from SellAuth
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
        
        // Extract real stock and sold counts
        const stock = productData.stock_count || 0;
        const sold = productData.products_sold || 0;
        
        // We can still return a static or random viewer count since SellAuth doesn't track active viewers
        const fakeViewers = Math.floor(Math.random() * (1200 - 800 + 1) + 800); 

        return res.status(200).json({ 
            viewers: fakeViewers, 
            buyers: sold, 
            keys_remaining: stock 
        });

    } catch (err) {
        // Fallback on error
        res.status(500).json({ error: err.message, viewers: 800, buyers: 0, keys_remaining: 0 });
    }
}
