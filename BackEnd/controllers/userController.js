const asyncHandler = require('../utils/asyncHandler');
const UserService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

// getAll/getById giữ nguyên hình dạng cũ vì FE đọc trực tiếp
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const usersData = await UserService.getAllUsers(page, limit, search);
    res.status(200).json(usersData);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id, req.user);
    res.status(200).json(user);
});

const createUser = asyncHandler(async (req, res) => {
    const newUser = await UserService.createUser(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Tạo tài khoản thành công', data: newUser });
});

const updateUser = asyncHandler(async (req, res) => {
    const updated = await UserService.updateUser(req.params.id, req.body, req.user);
    sendSuccess(res, { message: 'Cập nhật thành công', data: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
    const deleted = await UserService.deleteUser(req.params.id);
    sendSuccess(res, { message: 'Đã xóa tài khoản', data: deleted });
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
