const pool = require('../config/db');

const CartItem = {
    createOrUpdate: async (data) => {
        const { cart_id, variant_id, quantity } = data;
        // Kỹ thuật Upsert (Nếu có rồi thì cộng dồn số lượng, chưa có thì thêm mới)
        const query = `
            INSERT INTO cart_items (cart_id, variant_id, quantity) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (cart_id, variant_id) 
            DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity 
            RETURNING *
        `;
        const result = await pool.query(query, [cart_id, variant_id, quantity || 1]);
        return result.rows[0];
    },
    updateQuantity: async (id, quantity) => {
        const query = `UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *`;
        const result = await pool.query(query, [quantity, id]);
        return result.rows[0];
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = CartItem;