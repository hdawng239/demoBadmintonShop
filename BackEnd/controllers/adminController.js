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

        // Mock data cho biểu đồ 6 tháng gần nhất (Kết hợp dữ liệu thật của tháng hiện tại)
        const chartData = [
            { name: 'Th 12', revenue: 12500000, orders: 30 },
            { name: 'Th 1', revenue: 15000000, orders: 40 },
            { name: 'Th 2', revenue: 22000000, orders: 55 },
            { name: 'Th 3', revenue: 18000000, orders: 48 },
            { name: 'Th 4', revenue: 25000000, orders: 62 },
            { name: 'Th 5 (Hiện tại)', revenue: totalRevenue > 0 ? totalRevenue : 19000000, orders: totalOrders > 0 ? totalOrders : 50 }
        ];

        res.status(200).json({
            totalUsers,
            totalOrders,
            totalRevenue,
            totalProducts,
            chartData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy thống kê dashboard", error: error.message });
    }
};

module.exports = { getDashboardStats };
