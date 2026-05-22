const User = require('../models/userModel');
// [MỚI] Thêm máy băm mật khẩu vào
const AuthService = require('../services/authService'); 

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.getById(req.params.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { password, ...otherData } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Mật khẩu là bắt buộc!" });
        }
        const hashedPassword = await AuthService.hashPassword(password);
        const newUserData = {
            ...otherData,
            password: hashedPassword 
        };

        const newUser = await User.create(newUserData);
        res.status(201).json({ message: "Tạo tài khoản thành công", data: newUser });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: "Email này đã được sử dụng!" });
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // [MỚI] Nếu Admin muốn đổi mật khẩu cho user, phải băm nó ra
        if (updateData.password) {
            updateData.password_hash = await AuthService.hashPassword(updateData.password);
            delete updateData.password; // Xóa chữ "password" trần đi để tránh lưu nhầm
        }

        const updated = await User.update(req.params.id, updateData);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.status(200).json({ message: "Cập nhật thành công", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const deleted = await User.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.status(200).json({ message: "Đã xóa tài khoản", data: deleted });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };