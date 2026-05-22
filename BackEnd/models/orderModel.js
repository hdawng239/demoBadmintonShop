const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const Order = {
    getAll: async (page, limit) => {
        const offset = (page - 1) * limit;
        
        const countResult = await pool.query('SELECT COUNT(*) FROM orders');
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const dataQuery = `
            SELECT * 
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(dataQuery, [limit, offset]);
        
        return {
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        };
    },
    getById: async (id) => {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        return result.rows[0];
    },
    // Hàm bọc gói giao dịch phức tạp liên bảng
    createWithItems: async (orderData, cartItems) => {
        const client = await pool.connect(); // Lấy 1 client riêng để làm Transaction
        try {
            await client.query('BEGIN');

            // 1. Chèn bảng orders
            const insertOrderQuery = `
                INSERT INTO orders (user_id, payment_method, total_amount, shipping_name, shipping_phone, shipping_address)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
            `;
            const orderValues = [
                orderData.user_id, orderData.payment_method, orderData.total_amount, 
                orderData.shipping_name, orderData.shipping_phone, orderData.shipping_address
            ];
            const orderResult = await client.query(insertOrderQuery, orderValues);
            const newOrderId = orderResult.rows[0].id;

            // 2. Vòng lặp chèn bảng order_items
            const insertItemsQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, price_at_time) 
                VALUES ($1, $2, $3, $4)
            `;
            for (let item of cartItems) {
                await client.query(insertItemsQuery, [newOrderId, item.variant_id, item.quantity, item.price]);
            }

            await client.query('COMMIT');
            return newOrderId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    update: async (id, data) => {
        // Tự động sinh SQL cho bảng 'orders'
        const { query, values } = generateDynamicUpdate('orders', data, id);
        
        if (!query) throw new Error("Không có dữ liệu hợp lệ để cập nhật");

        const result = await pool.query(query, values);
        return result.rows[0];
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Order;