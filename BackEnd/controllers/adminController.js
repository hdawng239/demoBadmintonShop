const asyncHandler = require('../utils/asyncHandler');
const AdminService = require('../services/adminService');

const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await AdminService.getDashboardStats(req.query);
    res.status(200).json(stats);
});

module.exports = { getDashboardStats };
