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
                INSERT INTO orders (user_id, payment_method, total_amount, shipping_name, shipping_phone, shipping_address, to_district_id, to_ward_code, voucher_code, discount_amount)
                VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 1442), COALESCE($8, '21012'), $9, $10) RETURNING id
            `;
            const orderValues = [
                orderData.user_id, orderData.payment_method, orderData.total_amount, 
                orderData.shipping_name, orderData.shipping_phone, orderData.shipping_address,
                orderData.to_district_id || null, orderData.to_ward_code || null,
                orderData.voucher_code || null, parseFloat(orderData.discount_amount || 0)
            ];
            const orderResult = await client.query(insertOrderQuery, orderValues);
            const newOrderId = orderResult.rows[0].id;

            // 1b. Tăng lượt dùng voucher nếu có áp dụng
            if (orderData.voucher_code) {
                const updateVoucherQuery = `
                    UPDATE vouchers 
                    SET used_count = used_count + 1 
                    WHERE UPPER(code) = UPPER($1)
                `;
                await client.query(updateVoucherQuery, [orderData.voucher_code]);
            }

            // 2. Vòng lặp chèn bảng order_items và trừ kho
            const checkStockQuery = `
                SELECT pv.variant_name, pv.stock_quantity, p.is_active, p.name AS product_name
                FROM product_variants pv
                JOIN products p ON pv.product_id = p.id
                WHERE pv.id = $1 FOR UPDATE
            `;
            const updateStockQuery = `UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2`;
            const insertItemsQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, price_at_time) 
                VALUES ($1, $2, $3, $4)
            `;

            for (let item of cartItems) {
                // Kiểm tra tồn kho và trạng thái kinh doanh trước khi đặt
                const stockRes = await client.query(checkStockQuery, [item.variant_id]);
                if (stockRes.rows.length === 0) {
                    throw new Error(`Sản phẩm phân loại ID ${item.variant_id} không tồn tại.`);
                }
                
                const variantInfo = stockRes.rows[0];
                if (variantInfo.is_active === false) {
                    throw new Error(`Sản phẩm "${variantInfo.product_name}" đã ngừng kinh doanh. Vui lòng bỏ chọn hoặc xóa khỏi giỏ hàng!`);
                }
                
                const currentStock = variantInfo.stock_quantity;
                if (currentStock < item.quantity) {
                    throw new Error(`Sản phẩm "${variantInfo.product_name} (${variantInfo.variant_name})" chỉ còn ${currentStock} cái. Vui lòng giảm số lượng!`);
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
    cancelOrderById: async (id) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Lấy trạng thái hiện tại của đơn hàng
            const orderRes = await client.query('SELECT status, payment_status, voucher_code FROM orders WHERE id = $1 FOR UPDATE', [id]);
            if (orderRes.rows.length === 0) {
                throw new Error("Không tìm thấy đơn hàng");
            }
            const order = orderRes.rows[0];

            // Cho phép hủy khi đơn ở trạng thái pending (kể cả đã thanh toán qua QR)
            if (order.status !== 'pending') {
                throw new Error("Đơn hàng không thể hủy ở trạng thái hiện tại");
            }

            // 2. Cập nhật trạng thái đơn hàng thành 'cancelled' và cập nhật trạng thái thanh toán
            // Nếu đã thanh toán ('paid') thì chuyển sang 'refunded' (hoàn tiền)
            let finalPaymentStatus = order.payment_status;
            if (order.payment_status === 'paid') {
                finalPaymentStatus = 'refunded';
            }
            await client.query("UPDATE orders SET status = 'cancelled', payment_status = $1 WHERE id = $2", [finalPaymentStatus, id]);

            // 3. Phục hồi tồn kho sản phẩm
            const itemsRes = await client.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [id]);
            const updateStockQuery = `UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2`;
            for (let item of itemsRes.rows) {
                await client.query(updateStockQuery, [item.quantity, item.variant_id]);
            }

            // 4. Hoàn trả lại lượt dùng voucher (giảm used_count đi 1)
            if (order.voucher_code) {
                await client.query(
                    "UPDATE vouchers SET used_count = GREATEST(0, used_count - 1) WHERE UPPER(code) = UPPER($1)",
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
    countPendingOrdersByUser: async (userId) => {
        const query = `
            SELECT COUNT(*) FROM orders 
            WHERE user_id = $1 
              AND status = 'pending' 
              AND payment_status = 'unpaid'
        `;
        const res = await pool.query(query, [userId]);
        return parseInt(res.rows[0].count);
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Order;