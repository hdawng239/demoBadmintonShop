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
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) return null;
        
        const order = orderResult.rows[0];
        
        const itemsQuery = `
            SELECT oi.*, p.name as product_name, pv.variant_name, p.image_url, p.technical_specs 
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const itemsResult = await pool.query(itemsQuery, [id]);
        order.items = itemsResult.rows;
        
        return order;
    },
    getByUserId: async (userId) => {
        const dataQuery = `
            SELECT * 
            FROM orders 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(dataQuery, [userId]);
        const orders = result.rows;
        
        for (let order of orders) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, pv.variant_name, p.image_url, p.technical_specs 
                FROM order_items oi
                JOIN product_variants pv ON oi.variant_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE oi.order_id = $1
            `;
            const itemsResult = await pool.query(itemsQuery, [order.id]);
            order.items = itemsResult.rows;
        }
        return orders;
    },
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

            // 2. Vòng lặp chèn bảng order_items và trừ kho
            const checkStockQuery = `SELECT variant_name, stock_quantity FROM product_variants WHERE id = $1 FOR UPDATE`;
            const updateStockQuery = `UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2`;
            const insertItemsQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, price_at_time) 
                VALUES ($1, $2, $3, $4)
            `;

            for (let item of cartItems) {
                // Kiểm tra tồn kho trước khi đặt
                const stockRes = await client.query(checkStockQuery, [item.variant_id]);
                if (stockRes.rows.length === 0) {
                    throw new Error(`Sản phẩm phân loại ID ${item.variant_id} không tồn tại.`);
                }
                
                const currentStock = stockRes.rows[0].stock_quantity;
                if (currentStock < item.quantity) {
                    throw new Error(`Sản phẩm "${stockRes.rows[0].variant_name}" chỉ còn ${currentStock} cái. Vui lòng giảm số lượng!`);
                }

                // Trừ số lượng tồn kho
                await client.query(updateStockQuery, [item.quantity, item.variant_id]);

                // Chèn vào order_items
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