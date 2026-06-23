const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/orderModel');

// REPOSITORY = tầng truy cập dữ liệu cho orders và order_items.
// Bao gồm transaction cho createWithItems và cancelById.
const OrderRepository = {
    findPaginated: async (page, limit) => {
        const offset = (page - 1) * limit;

        const countResult = await pool.query(`SELECT COUNT(*) FROM ${TABLE}`);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const dataResult = await pool.query(
            `SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            data: dataResult.rows,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    },

    findById: async (id) => {
        const orderResult = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        const order = mapRow(orderResult.rows[0]);
        if (!order) return null;

        order.items = await OrderRepository._findItemsByOrderId(id);
        return order;
    },

    findByUserId: async (userId) => {
        const result = await pool.query(
            `SELECT * FROM ${TABLE} WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        const orders = result.rows.map(mapRow);

        for (const order of orders) {
            order.items = await OrderRepository._findItemsByOrderId(order.id);
        }
        return orders;
    },

    _findItemsByOrderId: async (orderId) => {
        const query = `
            SELECT oi.*, p.name AS product_name, pv.variant_name, p.image_url, p.technical_specs
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const result = await pool.query(query, [orderId]);
        return result.rows;
    },

    // Transaction: tạo đơn hàng + items + trừ kho + tăng lượt dùng voucher
    createWithItems: async (orderData, cartItems) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert order
            const insertOrderQuery = `
                INSERT INTO ${TABLE} (user_id, payment_method, total_amount, shipping_name, shipping_phone, shipping_address, to_district_id, to_ward_code, voucher_code, discount_amount)
                VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 1442), COALESCE($8, '21012'), $9, $10) RETURNING id
            `;
            const orderValues = [
                orderData.user_id, orderData.payment_method, orderData.total_amount,
                orderData.shipping_name, orderData.shipping_phone, orderData.shipping_address,
                orderData.to_district_id || null, orderData.to_ward_code || null,
                orderData.voucher_code || null, parseFloat(orderData.discount_amount || 0),
            ];
            const orderResult = await client.query(insertOrderQuery, orderValues);
            const newOrderId = orderResult.rows[0].id;

            // 1b. Tăng used_count voucher
            if (orderData.voucher_code) {
                await client.query(
                    'UPDATE vouchers SET used_count = used_count + 1 WHERE UPPER(code) = UPPER($1)',
                    [orderData.voucher_code]
                );
            }

            // 2. Insert order_items và trừ kho
            const checkStockQuery = `
                SELECT pv.variant_name, pv.stock_quantity, p.is_active, p.name AS product_name
                FROM product_variants pv
                JOIN products p ON pv.product_id = p.id
                WHERE pv.id = $1 FOR UPDATE
            `;
            const updateStockQuery = 'UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2';
            const insertItemsQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, price_at_time)
                VALUES ($1, $2, $3, $4)
            `;

            for (const item of cartItems) {
                const stockRes = await client.query(checkStockQuery, [item.variant_id]);
                if (stockRes.rows.length === 0) {
                    throw new Error(`Sản phẩm phân loại ID ${item.variant_id} không tồn tại.`);
                }

                const variantInfo = stockRes.rows[0];
                if (variantInfo.is_active === false) {
                    throw new Error(`Sản phẩm "${variantInfo.product_name}" đã ngừng kinh doanh.`);
                }

                if (variantInfo.stock_quantity < item.quantity) {
                    throw new Error(`Sản phẩm "${variantInfo.product_name} (${variantInfo.variant_name})" chỉ còn ${variantInfo.stock_quantity} cái.`);
                }

                await client.query(updateStockQuery, [item.quantity, item.variant_id]);
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
        const { query, values } = generateDynamicUpdate(TABLE, data, id, UPDATABLE_FIELDS);
        if (!query) return null;
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    // Transaction: hủy đơn + hoàn kho + giảm used_count voucher
    cancelById: async (id) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Lấy trạng thái hiện tại
            const orderRes = await client.query(
                `SELECT status, payment_status, voucher_code FROM ${TABLE} WHERE id = $1 FOR UPDATE`,
                [id]
            );
            if (orderRes.rows.length === 0) {
                throw new Error('Không tìm thấy đơn hàng');
            }
            const order = orderRes.rows[0];

            if (order.status !== 'pending') {
                throw new Error('Đơn hàng không thể hủy ở trạng thái hiện tại');
            }

            // 2. Cập nhật trạng thái
            let finalPaymentStatus = order.payment_status;
            if (order.payment_status === 'paid') {
                finalPaymentStatus = 'refunded';
            }
            await client.query(
                `UPDATE ${TABLE} SET status = 'cancelled', payment_status = $1 WHERE id = $2`,
                [finalPaymentStatus, id]
            );

            // 3. Hoàn tồn kho
            const itemsRes = await client.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [id]);
            for (const item of itemsRes.rows) {
                await client.query(
                    'UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [item.quantity, item.variant_id]
                );
            }

            // 4. Giảm used_count voucher
            if (order.voucher_code) {
                await client.query(
                    'UPDATE vouchers SET used_count = GREATEST(0, used_count - 1) WHERE UPPER(code) = UPPER($1)',
                    [order.voucher_code]
                );
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    countPendingUnpaidByUser: async (userId) => {
        const result = await pool.query(
            `SELECT COUNT(*) FROM ${TABLE}
             WHERE user_id = $1 AND status = 'pending' AND payment_status = 'unpaid'`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },

    // Tìm đơn QR quá hạn 2 phút (cho scheduler)
    findExpiredQR: async () => {
        const result = await pool.query(
            `SELECT id FROM ${TABLE}
             WHERE LOWER(payment_method) = 'qr'
               AND payment_status = 'unpaid'
               AND status = 'pending'
               AND created_at < NOW() - INTERVAL '2 minutes'`
        );
        return result.rows.map((r) => r.id);
    },
};

module.exports = OrderRepository;
