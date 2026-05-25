const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        // Tổng số user
        const usersResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
        const totalUsers = parseInt(usersResult.rows[0].count);

        // Tổng số đơn hàng thành công
        const ordersResult = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'");
        const totalOrders = parseInt(ordersResult.rows[0].count);

        // Tổng doanh thu (Chỉ tính các đơn đã hoàn thành)
        const revenueResult = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'");
        const totalRevenue = revenueResult.rows[0].total ? parseFloat(revenueResult.rows[0].total) : 0;

        // Tổng sản phẩm
        const productsResult = await pool.query("SELECT COUNT(*) as count FROM products");
        const totalProducts = parseInt(productsResult.rows[0].count);

        res.status(200).json({
            totalUsers,
            totalOrders,
            totalRevenue,
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy thống kê dashboard", error: error.message });
    }
};

module.exports = { getDashboardStats };
