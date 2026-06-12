const pool = require('../config/db');

// Helper to get all dates between two dates
function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const tempEnd = new Date(endDate);
    while (currentDate <= tempEnd) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

// Helper to get all months between two dates
function getMonthsInRange(startDate, endDate) {
    const months = [];
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const targetEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (currentDate <= targetEnd) {
        months.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
}

const getDashboardStats = async (req, res) => {
    try {
        const { timeframe = 'month', startDate, endDate } = req.query;
        
        let start, end;
        const now = new Date();

        if (timeframe === 'week') {
            start = new Date();
            start.setDate(now.getDate() - 7);
            end = now;
        } else if (timeframe === 'month') {
            start = new Date();
            start.setDate(now.getDate() - 30);
            end = now;
        } else if (timeframe === 'year') {
            start = new Date(now.getFullYear(), 0, 1); // January 1st of current year
            end = now;
        } else if (timeframe === 'custom') {
            start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            end = endDate ? new Date(endDate) : now;
            end.setHours(23, 59, 59, 999);
        } else {
            // Default to month
            start = new Date();
            start.setDate(now.getDate() - 30);
            end = now;
        }

        // 1. Tổng số user trong DB
        const usersResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
        const totalUsers = parseInt(usersResult.rows[0].count);

        // 2. Số user đăng ký mới trong khoảng thời gian
        const newUsersResult = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND created_at BETWEEN $1 AND $2",
            [start, end]
        );
        const newUsers = parseInt(newUsersResult.rows[0].count);

        // 3. Tổng đơn hàng thành công trong khoảng thời gian
        const ordersResult = await pool.query(
            "SELECT COUNT(*) as count FROM orders WHERE status = 'completed' AND created_at BETWEEN $1 AND $2",
            [start, end]
        );
        const totalOrders = parseInt(ordersResult.rows[0].count);

        // 4. Tổng doanh thu thành công trong khoảng thời gian
        const revenueResult = await pool.query(
            "SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed' AND created_at BETWEEN $1 AND $2",
            [start, end]
        );
        const totalRevenue = revenueResult.rows[0].total ? parseFloat(revenueResult.rows[0].total) : 0;

        // 5. Tổng số sản phẩm trong danh mục
        const productsResult = await pool.query("SELECT COUNT(*) as count FROM products");
        const totalProducts = parseInt(productsResult.rows[0].count);

        // 6. Số lượng sản phẩm đã bán trong khoảng thời gian
        const soldResult = await pool.query(
            `SELECT SUM(oi.quantity) as count 
             FROM order_items oi 
             JOIN orders o ON oi.order_id = o.id 
             WHERE o.status = 'completed' AND o.created_at BETWEEN $1 AND $2`,
            [start, end]
        );
        const totalProductsSold = soldResult.rows[0].count ? parseInt(soldResult.rows[0].count) : 0;

        // 7. Truy vấn dữ liệu biểu đồ doanh thu theo thời gian
        let chartQuery = '';
        const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (timeframe === 'year' || durationDays > 60) {
            // Gom nhóm theo Tháng nếu lọc theo năm hoặc khoảng tùy chọn > 60 ngày
            chartQuery = `
                SELECT TO_CHAR(created_at, 'MM/YYYY') as label,
                       SUM(total_amount) as revenue,
                       COUNT(*) as orders
                FROM orders
                WHERE status = 'completed' AND created_at BETWEEN $1 AND $2
                GROUP BY TO_CHAR(created_at, 'MM/YYYY'), DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at) ASC
            `;
        } else {
            // Gom nhóm theo Ngày
            chartQuery = `
                SELECT TO_CHAR(created_at, 'DD/MM') as label,
                       SUM(total_amount) as revenue,
                       COUNT(*) as orders
                FROM orders
                WHERE status = 'completed' AND created_at BETWEEN $1 AND $2
                GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE_TRUNC('day', created_at)
                ORDER BY DATE_TRUNC('day', created_at) ASC
            `;
        }
        
        const chartResult = await pool.query(chartQuery, [start, end]);
        
        let chartData = [];
        if (timeframe === 'year' || durationDays > 60) {
            const months = getMonthsInRange(start, end);
            chartData = months.map(m => {
                const padMonth = String(m.getMonth() + 1).padStart(2, '0');
                const label = `${padMonth}/${m.getFullYear()}`;
                const dbRow = chartResult.rows.find(row => row.label === label);
                return {
                    name: label,
                    revenue: dbRow ? parseFloat(dbRow.revenue || 0) : 0,
                    orders: dbRow ? parseInt(dbRow.orders || 0) : 0
                };
            });
        } else {
            const dates = getDatesInRange(start, end);
            chartData = dates.map(d => {
                const padDay = String(d.getDate()).padStart(2, '0');
                const padMonth = String(d.getMonth() + 1).padStart(2, '0');
                const label = `${padDay}/${padMonth}`;
                const dbRow = chartResult.rows.find(row => row.label === label);
                return {
                    name: label,
                    revenue: dbRow ? parseFloat(dbRow.revenue || 0) : 0,
                    orders: dbRow ? parseInt(dbRow.orders || 0) : 0
                };
            });
        }

        // 8. Top 3 Khách hàng chi tiêu nhiều nhất
        const topCustomersQuery = `
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
        const topCustomersResult = await pool.query(topCustomersQuery, [start, end]);
        const topCustomers = topCustomersResult.rows.map(row => ({
            id: row.id,
            fullName: row.full_name,
            email: row.email,
            totalSpent: parseFloat(row.total_spent),
            totalOrders: parseInt(row.total_orders)
        }));

        // 9. Top 3 Sản phẩm bán chạy nhất
        const topProductsQuery = `
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
        const topProductsResult = await pool.query(topProductsQuery, [start, end]);
        const topProducts = topProductsResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            imageUrl: row.image_url,
            totalSold: parseInt(row.total_sold),
            totalRevenue: parseFloat(row.total_revenue)
        }));

        res.status(200).json({
            totalUsers,
            newUsers,
            totalOrders,
            totalRevenue,
            totalProducts,
            totalProductsSold,
            chartData,
            topCustomers,
            topProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy thống kê dashboard", error: error.message });
    }
};

module.exports = { getDashboardStats };
