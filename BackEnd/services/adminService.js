const AdminRepository = require('../repositories/adminRepository');

// Helpers thuần (không DB)
const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

const getMonthsInRange = (startDate, endDate) => {
    const months = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= end) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }
    return months;
};

// SERVICE = tầng nghiệp vụ: tính toán timeframe, điều phối repository, merge dữ liệu biểu đồ.
const AdminService = {
    getDashboardStats: async ({ timeframe, startDate, endDate }) => {
        const now = new Date();
        let start, end;

        switch (timeframe) {
            case 'week':
                start = new Date();
                start.setDate(now.getDate() - 7);
                end = now;
                break;
            case 'month':
                start = new Date();
                start.setDate(now.getDate() - 30);
                end = now;
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                end = now;
                break;
            case 'custom':
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
                start.setHours(0, 0, 0, 0);
                end = endDate ? new Date(endDate) : now;
                end.setHours(23, 59, 59, 999);
                break;
            default:
                start = new Date();
                start.setDate(now.getDate() - 30);
                end = now;
        }

        // Chạy song song tất cả query
        const [
            totalUsers,
            newUsers,
            totalOrders,
            totalRevenue,
            totalProducts,
            totalProductsSold,
            chartRows,
            topCustomers,
            topProducts,
        ] = await Promise.all([
            AdminRepository.countUsers(),
            AdminRepository.countNewUsers(start, end),
            AdminRepository.countCompletedOrders(start, end),
            AdminRepository.sumCompletedRevenue(start, end),
            AdminRepository.countProducts(),
            AdminRepository.sumProductsSold(start, end),
            AdminRepository.getChartData(start, end, timeframe === 'year' || (end - start) / (1000 * 60 * 60 * 24) > 60),
            AdminRepository.getTopCustomers(start, end),
            AdminRepository.getTopProducts(start, end),
        ]);

        // Merge chart data với fill ngày/tháng trống
        const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const groupByMonth = timeframe === 'year' || durationDays > 60;

        let chartData;
        if (groupByMonth) {
            const months = getMonthsInRange(start, end);
            chartData = months.map((m) => {
                const padMonth = String(m.getMonth() + 1).padStart(2, '0');
                const label = `${padMonth}/${m.getFullYear()}`;
                const dbRow = chartRows.find((r) => r.label === label);
                return {
                    name: label,
                    revenue: dbRow ? parseFloat(dbRow.revenue || 0) : 0,
                    orders: dbRow ? parseInt(dbRow.orders || 0) : 0,
                };
            });
        } else {
            const dates = getDatesInRange(start, end);
            chartData = dates.map((d) => {
                const padDay = String(d.getDate()).padStart(2, '0');
                const padMonth = String(d.getMonth() + 1).padStart(2, '0');
                const label = `${padDay}/${padMonth}`;
                const dbRow = chartRows.find((r) => r.label === label);
                return {
                    name: label,
                    revenue: dbRow ? parseFloat(dbRow.revenue || 0) : 0,
                    orders: dbRow ? parseInt(dbRow.orders || 0) : 0,
                };
            });
        }

        return {
            totalUsers,
            newUsers,
            totalOrders,
            totalRevenue,
            totalProducts,
            totalProductsSold,
            chartData,
            topCustomers,
            topProducts,
        };
    },
};

module.exports = AdminService;
