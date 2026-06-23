const pool = require('../config/db');
const CartModel = require('../models/cartModel');
const CartItemModel = require('../models/cartItemModel');

// REPOSITORY = tầng truy cập dữ liệu cho carts và cart_items.
const CartRepository = {
    // ── Cart ────────────────────────────────────────────────
    findByUserId: async (userId) => {
        const result = await pool.query(
            `SELECT * FROM ${CartModel.TABLE} WHERE user_id = $1`,
            [userId]
        );
        const cart = CartModel.mapRow(result.rows[0]);
        if (cart) {
            const itemQuery = `
                SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity, ci.created_at,
                       p.name AS product_name,
                       p.base_price,
                       p.image_url,
                       p.technical_specs,
                       p.is_active,
                       pv.variant_name,
                       pv.price_modifier,
                       pv.stock_quantity,
                       p.id AS product_id
                FROM ${CartItemModel.TABLE} ci
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

    createCart: async (userId) => {
        const result = await pool.query(
            `INSERT INTO ${CartModel.TABLE} (user_id) VALUES ($1) RETURNING *`,
            [userId]
        );
        return CartModel.mapRow(result.rows[0]);
    },

    removeCart: async (id) => {
        const result = await pool.query(
            `DELETE FROM ${CartModel.TABLE} WHERE id = $1 RETURNING *`,
            [id]
        );
        return CartModel.mapRow(result.rows[0]);
    },

    // ── CartItem ────────────────────────────────────────────
    upsertItem: async ({ cart_id, variant_id, quantity }) => {
        const query = `
            INSERT INTO ${CartItemModel.TABLE} (cart_id, variant_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (cart_id, variant_id)
            DO UPDATE SET quantity = ${CartItemModel.TABLE}.quantity + EXCLUDED.quantity
            RETURNING *
        `;
        const result = await pool.query(query, [cart_id, variant_id, quantity || 1]);
        return CartItemModel.mapRow(result.rows[0]);
    },

    updateItemQuantity: async (id, quantity) => {
        const result = await pool.query(
            `UPDATE ${CartItemModel.TABLE} SET quantity = $1 WHERE id = $2 RETURNING *`,
            [quantity, id]
        );
        return CartItemModel.mapRow(result.rows[0]);
    },

    removeItem: async (id) => {
        const result = await pool.query(
            `DELETE FROM ${CartItemModel.TABLE} WHERE id = $1 RETURNING *`,
            [id]
        );
        return CartItemModel.mapRow(result.rows[0]);
    },
};

module.exports = CartRepository;
