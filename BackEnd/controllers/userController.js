const User = require('../models/userModel');
// [MỚI] Thêm máy băm mật khẩu vào
const AuthService = require('../services/authService'); 

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const usersData = await User.getAll(page, limit);
        res.status(200).json(usersData);
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
        const { password, email, phone, ...otherData } = req.body;
        
        if (!email || !email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: "Email bắt buộc phải là định dạng @gmail.com" });
        }
        if (phone && !/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
            return res.status(400).json({ message: "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0" });
        }
        
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

        if (updateData.email && !updateData.email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: "Email bắt buộc phải là định dạng @gmail.com" });
        }
        if (updateData.phone && !/^0(3|5|7|8|9)\d{8}$/.test(updateData.phone)) {
            return res.status(400).json({ message: "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0" });
        }

        // Nếu khách hàng thường muốn tự đổi role thành admin -> Chặn ngay
        if (updateData.role && req.user.role !== 'admin') {
            delete updateData.role;
        }

        // Nếu có update password, phải băm nó ra
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