const pool = require('../config/db');

// REPOSITORY = tầng truy cập dữ liệu cho thống kê dashboard admin.
const AdminRepository = {
    countUsers: async () => {
        const result = await pool.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
        return parseInt(result.rows[0].count);
    },

    countNewUsers: async (start, end) => {
        const result = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND created_at BETWEEN $1 AND $2",
            [start, end]
        );
        return parseInt(result.rows[0].count);
    },

    countCompletedOrders: async (start, end) => {
        const result = await pool.query(
            "SELECT COUNT(*) as count FROM orders WHERE status = 'completed' AND created_at BETWEEN $1 AND $2",
            [start, end]
        );
        return parseInt(result.rows[0].count);
    },

    sumCompletedRevenue: async (start, end) => {
        const result = await pool.query(
            "SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed' AND created_at BETWEEN $1 AND $2",
            [start, end]
        );
        return result.rows[0].total ? parseFloat(result.rows[0].total) : 0;
    },

    countProducts: async () => {
        const result = await pool.query('SELECT COUNT(*) as count FROM products');
        return parseInt(result.rows[0].count);
    },

    sumProductsSold: async (start, end) => {
        const result = await pool.query(
            `SELECT SUM(oi.quantity) as count
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.status = 'completed' AND o.created_at BETWEEN $1 AND $2`,
            [start, end]
        );
        return result.rows[0].count ? parseInt(result.rows[0].count) : 0;
    },

    getChartData: async (start, end, groupByMonth) => {
        let query;
        if (groupByMonth) {
            query = `
                SELECT TO_CHAR(created_at, 'MM/YYYY') as label,
                       SUM(total_amount) as revenue,
                       COUNT(*) as orders
                FROM orders
                WHERE status = 'completed' AND created_at BETWEEN $1 AND $2
                GROUP BY TO_CHAR(created_at, 'MM/YYYY'), DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at) ASC
            `;
        } else {
            query = `
                SELECT TO_CHAR(created_at, 'DD/MM') as label,
                       SUM(total_amount) as revenue,
                       COUNT(*) as orders
                FROM orders
                WHERE status = 'completed' AND created_at BETWEEN $1 AND $2
                GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE_TRUNC('day', created_at)
                ORDER BY DATE_TRUNC('day', created_at) ASC
            `;
        }
        const result = await pool.query(query, [start, end]);
        return result.rows;
    },

    getTopCustomers: async (start, end) => {
        const query = `
            SELECT u.id, u.full_name, u.email,
                   COALESCE(SUM(o.total_amount), 0) as total_spent,
                   COUNT(o.id) as total_orders
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.status = 'completed' AND o.created_at BETWEEN $1 AND $2
            GROUP BY u.id, u.full_name, u.email
            ORDER BY total_spent DESC
            LIMIT 3
        `;
        const result = await pool.query(query, [start, end]);
        return result.rows.map((row) => ({
            id: row.id,
            fullName: row.full_name,
            email: row.email,
            totalSpent: parseFloat(row.total_spent),
            totalOrders: parseInt(row.total_orders),
        }));
    },

    getTopProducts: async (start, end) => {
        const query = `
            SELECT p.id, p.name, p.image_url,
                   SUM(oi.quantity) as total_sold,
                   SUM(oi.quantity * oi.price_at_time) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE o.status = 'completed' AND o.created_at BETWEEN $1 AND $2
            GROUP BY p.id, p.name, p.image_url
            ORDER BY total_sold DESC
            LIMIT 3
        `;
        const result = await pool.query(query, [start, end]);
        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            imageUrl: row.image_url,
            totalSold: parseInt(row.total_sold),
            totalRevenue: parseFloat(row.total_revenue),
        }));
    },
};

module.exports = AdminRepository;
