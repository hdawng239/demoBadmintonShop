const asyncHandler = require('../utils/asyncHandler');
const UserService = require('../services/userService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
// Không chứa business logic, không truy cập DB trực tiếp.
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const usersData = await UserService.getAllUsers(page, limit, search);
    res.status(200).json(usersData);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json(user);
});

const createUser = asyncHandler(async (req, res) => {
    const newUser = await UserService.createUser(req.body);
    res.status(201).json({ message: 'Tạo tài khoản thành công', data: newUser });
});

const updateUser = asyncHandler(async (req, res) => {
    const updated = await UserService.updateUser(req.params.id, req.body, req.user);
    res.status(200).json({ message: 'Cập nhật thành công', data: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
    const deleted = await UserService.deleteUser(req.params.id);
    res.status(200).json({ message: 'Đã xóa tài khoản', data: deleted });
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
