const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/orderModel');
const AppError = require('../utils/AppError');
const { calculateDiscounts, calculateTotal } = require('../utils/pricing');
const { validateTransition } = require('../utils/orderState');

const OrderRepository = {
    withLockedOrder: async (id, operation) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query("SET LOCAL lock_timeout = '10s'");
            const result = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
            if (!result.rowCount) throw new AppError(404, 'Không tìm thấy đơn hàng');
            const order = result.rows[0];
            order.items = await OrderRepository._findItemsByOrderId(id, client);
            const value = await operation(order, client);
            await client.query('COMMIT');
            return value;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally { client.release(); }
    },
    // Lưu ý định tạo vận đơn trước khi gọi GHN; chỉ cho hủy sau khi đối soát.
    markShippingRequested: (id) => OrderRepository.withLockedOrder(id, async (order, client) => {
        validateTransition(order, 'shipping');
        if (order.payment_method !== 'store') {
            await client.query('UPDATE orders SET shipping_requested = TRUE, shipping_client_code = COALESCE(shipping_client_code, $2) WHERE id = $1', [id, `${process.env.GHN_CLIENT_PREFIX || 'NARO'}-${id}`]);
        }
    }),
    findPaginated: async (page, limit) => {
        const offset = (page - 1) * limit;

        const countResult = await pool.query(`SELECT COUNT(*) FROM ${TABLE} WHERE archived_at IS NULL`);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const dataResult = await pool.query(
            `SELECT * FROM ${TABLE} WHERE archived_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
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
        if (orders.length === 0) return orders;

        const orderIds = orders.map((o) => o.id);
        const items = await OrderRepository._findItemsByOrderIds(orderIds);

        const itemsByOrder = new Map();
        for (const item of items) {
            if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
            itemsByOrder.get(item.order_id).push(item);
        }
        for (const order of orders) {
            order.items = itemsByOrder.get(order.id) || [];
        }
        return orders;
    },

    _findItemsByOrderId: async (orderId, executor = pool) => {
        const query = `
            SELECT oi.*, p.name AS product_name, pv.variant_name, p.image_url, p.technical_specs
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const result = await executor.query(query, [orderId]);
        return result.rows;
    },

    _findItemsByOrderIds: async (orderIds) => {
        const query = `
            SELECT oi.*, p.name AS product_name, pv.variant_name, p.image_url, p.technical_specs
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE oi.order_id = ANY($1)
        `;
        const result = await pool.query(query, [orderIds]);
        return result.rows;
    },

    findItemsForShipping: async (cartItems) => {
        const errors = require('../validations/orderValidation').validateCartItems(cartItems);
        if (errors.length) throw new AppError(400, errors.join('; '));
        const quantities = new Map(cartItems.map((item) => [Number(item.variant_id), Number(item.quantity)]));
        const ids = [...quantities.keys()];
        const result = await pool.query(
            `SELECT pv.id AS variant_id, p.name AS product_name, p.technical_specs
             FROM product_variants pv
             JOIN products p ON p.id = pv.product_id
             WHERE pv.id = ANY($1::int[]) AND p.is_active = TRUE`,
            [ids]
        );
        if (result.rows.length !== ids.length) throw new AppError(400, 'Giỏ hàng chứa sản phẩm không hợp lệ.');
        return result.rows.map((row) => ({ ...row, quantity: quantities.get(row.variant_id) }));
    },

    // Tạo đơn, trừ kho và dùng voucher trong cùng giao dịch.
    createWithItems: async (orderData, cartItems) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query("SET LOCAL lock_timeout = '10s'");
            const owner = await client.query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [orderData.user_id]);
            if (!owner.rowCount) throw new AppError(401, 'Tài khoản không còn hoạt động.');
            const pending = await client.query("SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status IN ('pending', 'processing') AND payment_status = 'unpaid'", [orderData.user_id]);
            if (Number(pending.rows[0].count) >= 3) throw new AppError(429, 'Bạn đã có tối đa 3 đơn chờ thanh toán.');

            const defaultDistrictId = process.env.SHOP_DISTRICT_ID || null;
            const defaultWardCode = process.env.SHOP_WARD_CODE || null;

            const checkStockQuery = `
                SELECT pv.id, pv.variant_name, pv.stock_quantity, pv.price_modifier,
                       p.base_price, p.is_active, p.name AS product_name
                FROM product_variants pv
                JOIN products p ON pv.product_id = p.id
                WHERE pv.id = $1 FOR UPDATE
            `;
            const updateStockQuery = 'UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2';

            const preparedItems = [];
            let subtotal = 0;

            for (const item of [...cartItems].sort((a, b) => Number(a.variant_id) - Number(b.variant_id))) {
                const quantity = Number(item.quantity);
                const stockRes = await client.query(checkStockQuery, [item.variant_id]);
                if (stockRes.rows.length === 0) {
                    throw new AppError(400, `Sản phẩm phân loại ID ${item.variant_id} không tồn tại.`);
                }

                const variantInfo = stockRes.rows[0];
                if (variantInfo.is_active === false) {
                    throw new AppError(400, `Sản phẩm "${variantInfo.product_name}" đã ngừng kinh doanh.`);
                }

                if (variantInfo.stock_quantity < quantity) {
                    throw new AppError(400, `Sản phẩm "${variantInfo.product_name} (${variantInfo.variant_name})" chỉ còn ${variantInfo.stock_quantity} cái.`);
                }

                const basePrice = parseFloat(variantInfo.base_price) || 0;
                const priceModifier = parseFloat(variantInfo.price_modifier) || 0;
                const trueItemPrice = Math.max(0, basePrice + priceModifier);

                subtotal += trueItemPrice * quantity;
                preparedItems.push({
                    variant_id: item.variant_id,
                    quantity,
                    price_at_time: trueItemPrice,
                });

                await client.query(updateStockQuery, [quantity, item.variant_id]);
            }

            let orderDiscountAmount = 0;
            let shippingDiscountAmount = 0;
            let validVoucherCode = null;
            const shippingFee = Number(orderData.shipping_fee || 0);

            if (orderData.voucher_code && String(orderData.voucher_code).trim() !== '') {
                const voucherCodeClean = String(orderData.voucher_code).trim().toUpperCase();
                const voucherRes = await client.query(
                    'SELECT * FROM vouchers WHERE UPPER(code) = UPPER($1) FOR UPDATE',
                    [voucherCodeClean]
                );

                if (voucherRes.rows.length === 0) {
                    throw new AppError(400, 'Mã giảm giá không tồn tại.');
                }

                const voucher = voucherRes.rows[0];
                if (!voucher.is_active) {
                    throw new AppError(400, 'Mã giảm giá hiện tại đang bị khóa.');
                }

                const now = new Date();
                if (now < new Date(voucher.start_date)) {
                    throw new AppError(400, 'Mã giảm giá chưa đến thời gian áp dụng.');
                }
                if (now > new Date(voucher.end_date)) {
                    throw new AppError(400, 'Mã giảm giá đã hết hạn sử dụng.');
                }

                if (parseInt(voucher.used_count) >= parseInt(voucher.usage_limit)) {
                    throw new AppError(400, 'Mã giảm giá đã hết lượt sử dụng trên hệ thống.');
                }

                const minVal = parseFloat(voucher.min_order_value || 0);
                if (subtotal < minVal) {
                    throw new AppError(400, `Đơn hàng tối thiểu phải đạt ${minVal.toLocaleString()} ₫ để áp dụng mã giảm giá này.`);
                }

                const discounts = calculateDiscounts({ voucher, subtotal, shippingFee });
                orderDiscountAmount = discounts.orderDiscount;
                shippingDiscountAmount = discounts.shippingDiscount;

                validVoucherCode = voucher.code;

                await client.query(
                    'UPDATE vouchers SET used_count = used_count + 1 WHERE id = $1',
                    [voucher.id]
                );
            }

            const finalTotalAmount = calculateTotal({ subtotal, shippingFee, orderDiscount: orderDiscountAmount, shippingDiscount: shippingDiscountAmount });

            const insertOrderQuery = `
                INSERT INTO ${TABLE} (user_id, payment_method, total_amount, shipping_name, shipping_phone, shipping_address, to_district_id, to_ward_code, voucher_code, discount_amount, shipping_fee, shipping_discount)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
            `;
            const orderValues = [
                orderData.user_id,
                orderData.payment_method || 'cod',
                finalTotalAmount,
                orderData.shipping_name,
                orderData.shipping_phone,
                orderData.shipping_address,
                orderData.to_district_id || defaultDistrictId,
                orderData.to_ward_code || defaultWardCode,
                validVoucherCode,
                orderDiscountAmount + shippingDiscountAmount,
                shippingFee,
                shippingDiscountAmount,
            ];
            const orderResult = await client.query(insertOrderQuery, orderValues);
            const newOrder = mapRow(orderResult.rows[0]);
            const newOrderId = newOrder.id;

            const insertItemsQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, price_at_time)
                VALUES ($1, $2, $3, $4)
            `;
            for (const item of preparedItems) {
                await client.query(insertItemsQuery, [newOrderId, item.variant_id, item.quantity, item.price_at_time]);
            }

            await client.query('COMMIT');
            return newOrder;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    update: async (id, data, executor = pool) => {
        const { query, values } = generateDynamicUpdate(TABLE, data, id, UPDATABLE_FIELDS);
        if (!query) return null;
        const result = await executor.query(query, values);
        return mapRow(result.rows[0]);
    },

    syncShippingOrder: async (id, trackingCode, executor = pool) => {
        const result = await executor.query(
            `UPDATE ${TABLE}
             SET tracking_code = $2, status = 'shipping', shipping_requested = TRUE
             WHERE id = $1
             RETURNING *`,
            [id, trackingCode]
        );
        return mapRow(result.rows[0]);
    },

    releaseShippingRequest: async (id, executor = pool) => {
        const result = await executor.query(
            `UPDATE ${TABLE}
             SET shipping_requested = FALSE
             WHERE id = $1 AND tracking_code IS NULL
             RETURNING *`,
            [id]
        );
        return mapRow(result.rows[0]);
    },

    processSepayPayment: async ({ orderId, amount, eventId, payloadHash, payload }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const eventResult = await client.query(
                `INSERT INTO payment_events (provider, provider_event_id, order_id, amount, payload_hash, raw_payload, status)
                 VALUES ('sepay', $1, $2, $3, $4, $5, 'received')
                 ON CONFLICT (provider, provider_event_id) DO NOTHING
                 RETURNING id`,
                [eventId, orderId, amount, payloadHash, payload]
            );
            let event = eventResult.rows[0];
            if (!event) {
                const existing = await client.query("SELECT * FROM payment_events WHERE provider = 'sepay' AND provider_event_id = $1 FOR UPDATE", [eventId]);
                event = existing.rows[0];
                if (!event || event.payload_hash !== payloadHash || Number(event.order_id) !== Number(orderId) || Number(event.amount) !== amount) {
                    throw new AppError(409, 'Mã giao dịch trùng nhưng nội dung không khớp. Cần đối soát.');
                }
                if (event.status !== 'rejected') {
                    await client.query('ROLLBACK');
                    return { processed: false, duplicate: true, message: 'Webhook đã được xử lý trước đó' };
                }
            }

            const orderResult = await client.query(`SELECT * FROM ${TABLE} WHERE id = $1 FOR UPDATE`, [orderId]);
            const order = orderResult.rows[0];
            let rejectionReason = null;
            if (!order) rejectionReason = 'order_not_found';
            else if (String(order.payment_method).toLowerCase() !== 'qr') rejectionReason = 'not_qr_order';
            else if (!['pending', 'processing'].includes(order.status)) rejectionReason = `invalid_status:${order.status}`;
            else if (order.payment_status !== 'unpaid') rejectionReason = `invalid_payment_status:${order.payment_status}`;
            else if (amount < Number(order.total_amount)) rejectionReason = 'insufficient_amount';

            if (rejectionReason) {
                await client.query(
                    `UPDATE payment_events SET status = 'rejected', rejection_reason = $1 WHERE id = $2`,
                    [rejectionReason, event.id]
                );
                await client.query('COMMIT');
                return { processed: false, message: rejectionReason };
            }

            await client.query(
                `UPDATE ${TABLE} SET payment_status = 'paid', paid_at = NOW() WHERE id = $1`,
                [orderId]
            );
            await client.query(
                `UPDATE payment_events SET status = 'processed', rejection_reason = NULL, processed_at = NOW() WHERE id = $1`,
                [event.id]
            );
            await client.query('COMMIT');
            return { processed: true, message: 'Payment successful, order marked as paid' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    listRejectedPayments: async () => {
        const result = await pool.query("SELECT id, provider_event_id, order_id, amount, rejection_reason, created_at FROM payment_events WHERE provider = 'sepay' AND status = 'rejected' ORDER BY created_at DESC LIMIT 100");
        return result.rows;
    },
    retryPayment: async (id) => {
        const result = await pool.query("SELECT * FROM payment_events WHERE id = $1 AND provider = 'sepay'", [id]);
        const event = result.rows[0];
        if (!event) throw new AppError(404, 'Không tìm thấy giao dịch.');
        return OrderRepository.processSepayPayment({ orderId: event.order_id, amount: Number(event.amount),
            eventId: event.provider_event_id, payloadHash: event.payload_hash, payload: event.raw_payload });
    },

    // Hủy đơn, hoàn kho và hoàn lượt voucher trong cùng giao dịch.
    cancelById: async (id, { expiredOnly = false } = {}) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderRes = await client.query(
                `SELECT status, payment_status, voucher_code, shipping_requested, payment_method,
                    created_at < NOW() - INTERVAL '5 minutes' AS expired FROM ${TABLE} WHERE id = $1 FOR UPDATE`,
                [id]
            );
            if (orderRes.rows.length === 0) {
                throw new AppError(404, 'Không tìm thấy đơn hàng');
            }
            const order = orderRes.rows[0];
            if (order.shipping_requested) throw new AppError(409, 'Đơn đã yêu cầu vận đơn; cần đối soát GHN trước khi hủy.');
            if (expiredOnly && (order.payment_method.toLowerCase() !== 'qr' || !order.expired)) {
                throw new AppError(409, 'Đơn chưa hết thời hạn thanh toán.');
            }

            if (!['pending', 'processing'].includes(order.status)) {
                throw new AppError(400, 'Đơn hàng không thể hủy ở trạng thái hiện tại');
            }

            if (order.payment_status !== 'unpaid') {
                throw new AppError(400, 'Đơn đã thanh toán cần quy trình hoàn tiền riêng');
            }
            await client.query(
                `UPDATE ${TABLE} SET status = 'cancelled' WHERE id = $1`,
                [id]
            );

            const itemsRes = await client.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1 ORDER BY variant_id', [id]);
            for (const item of itemsRes.rows) {
                await client.query(
                    'UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [item.quantity, item.variant_id]
                );
            }

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
             WHERE user_id = $1 AND status IN ('pending', 'processing') AND payment_status = 'unpaid'`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    },

    remove: async (id) => {
        const result = await pool.query(
            `UPDATE ${TABLE} SET archived_at = NOW() WHERE id = $1 AND status = 'cancelled' RETURNING *`,
            [id]
        );
        return mapRow(result.rows[0]);
    },

    findExpiredQR: async () => {
        const result = await pool.query(
            `SELECT id FROM ${TABLE}
             WHERE LOWER(payment_method) = 'qr'
               AND payment_status = 'unpaid'
               AND status IN ('pending', 'processing')
               AND shipping_requested = FALSE
               AND created_at < NOW() - INTERVAL '5 minutes'`
        );
        return result.rows.map((r) => r.id);
    },
};

module.exports = OrderRepository;
