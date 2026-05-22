const pool = require('../config/db');

const Cart = {
    getByUserId: async (user_id) => {
        const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [user_id]);
        const cart = cartResult.rows[0];
        if (cart) {
            const itemQuery = `
                SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity, ci.created_at,
                       p.name AS product_name, 
                       p.base_price,
                       p.image_url,
                       p.technical_specs,
                       pv.id AS variant_id
                FROM cart_items ci
                LEFT JOIN product_variants pv ON ci.variant_id = pv.id
                LEFT JOIN products p ON pv.product_id = p.id
                WHERE ci.cart_id = $1
                ORDER BY ci.created_at DESC
            `;
            const items = await pool.query(itemQuery, [cart.id]);
            cart.items = items.rows;
        }
        return cart;
    },
    create: async (user_id) => {
        const result = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [user_id]);
        return result.rows[0];
    },
    clearCart: async (id) => {
        // Xóa giỏ hàng sẽ tự động xóa sạch các cart_items bên trong nhờ ON DELETE CASCADE
        const result = await pool.query('DELETE FROM carts WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Cart;