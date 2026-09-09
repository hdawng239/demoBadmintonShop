const UserRepository = require('../repositories/userRepository');
const AuthService = require('./authService');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const RefreshTokenRepository = require('../repositories/refreshTokenRepository');

const UserService = {
    getAllUsers: async (page = 1, limit = 10, search = '') => {
        return await UserRepository.findPaginated(page, limit, search);
    },

    getUserById: async (id, currentUser) => {
        if (currentUser.role !== 'admin' && currentUser.id !== Number.parseInt(id, 10)) {
            throw new AppError(403, 'Bạn không có quyền xem thông tin người dùng này!');
        }
        const user = await UserRepository.findById(id);
        if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
        return user;
    },

    createUser: async (data, currentUser) => {
        if (currentUser.role !== 'admin') {
            throw new AppError(403, 'Chỉ quản trị viên mới có quyền tạo người dùng trực tiếp!');
        }

        if (typeof data.email !== 'string' || typeof data.password !== 'string' || typeof data.full_name !== 'string') {
            throw new AppError(400, 'Vui lòng điền đầy đủ email, mật khẩu và họ tên!');
        }

        const fullName = data.full_name.trim();
        const email = data.email.trim().toLowerCase();
        const phone = typeof data.phone === 'string' ? data.phone.trim() : data.phone;
        const address = typeof data.address === 'string' ? data.address.trim() : data.address;
        if (!fullName || fullName.length > 150 || email.length > 254) {
            throw new AppError(400, 'Họ tên hoặc email không hợp lệ!');
        }

        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
            throw new AppError(400, 'Email bắt buộc phải đúng định dạng @gmail.com (ví dụ: yourname@gmail.com)!');
        }

        if (phone && (typeof phone !== 'string' || !/^0(3|5|7|8|9)\d{8}$/.test(phone))) {
            throw new AppError(400, 'Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!');
        }
        if (address && (typeof address !== 'string' || address.length > 500)) {
            throw new AppError(400, 'Địa chỉ không hợp lệ hoặc vượt quá 500 ký tự!');
        }

        const role = data.role && ['customer', 'admin'].includes(data.role) ? data.role : 'customer';

        AuthService.validatePassword(data.password);

        const hashedPassword = await AuthService.hashPassword(data.password);

        try {
            return await UserRepository.create({
                full_name: fullName,
                email,
                phone: phone || null,
                address: address || null,
                role,
                password: hashedPassword,
            });
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Email hoặc số điện thoại đã tồn tại!');
            throw err;
        }
    },

    updateUser: async (id, data, currentUser) => {
        if (currentUser.role !== 'admin' && currentUser.id !== parseInt(id)) {
            throw new AppError(403, 'Bạn không có quyền chỉnh sửa thông tin của người dùng này!');
        }

        // Không nhận các trường nhạy cảm từ dữ liệu client.
        const updateData = {};
        for (const field of ['full_name', 'email', 'phone', 'address']) {
            if (Object.prototype.hasOwnProperty.call(data, field)) updateData[field] = data[field];
        }
        if (currentUser.role === 'admin' && Object.prototype.hasOwnProperty.call(data, 'role')) {
            updateData.role = data.role;
        }

        if (updateData.full_name !== undefined) {
            if (typeof updateData.full_name !== 'string' || !updateData.full_name.trim() || updateData.full_name.trim().length > 150) {
                throw new AppError(400, 'Họ tên không hợp lệ!');
            }
            updateData.full_name = updateData.full_name.trim();
        }
        if (updateData.email !== undefined) {
            if (typeof updateData.email !== 'string' || updateData.email.length > 254 || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(updateData.email.trim())) {
                throw new AppError(400, 'Email bắt buộc phải đúng định dạng @gmail.com (ví dụ: yourname@gmail.com)!');
            }
            updateData.email = updateData.email.trim().toLowerCase();
            const existing = await UserRepository.findById(id);
            if (!existing) throw new AppError(404, 'Không tìm thấy người dùng');
            if (updateData.email !== existing.email) {
                throw new AppError(400, 'Đổi email cần xác nhận trong trang tài khoản của chính người dùng.');
            }
            delete updateData.email;
        }
        if (updateData.phone !== undefined) {
            if (updateData.phone !== null && (typeof updateData.phone !== 'string' || !/^0(3|5|7|8|9)\d{8}$/.test(updateData.phone.trim()))) {
                throw new AppError(400, 'Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!');
            }
            updateData.phone = updateData.phone?.trim() || null;
        }
        if (updateData.address !== undefined) {
            if (updateData.address !== null && (typeof updateData.address !== 'string' || updateData.address.trim().length > 500)) {
                throw new AppError(400, 'Địa chỉ không hợp lệ hoặc vượt quá 500 ký tự!');
            }
            updateData.address = updateData.address?.trim() || null;
        }
        if (updateData.role !== undefined && !['customer', 'admin'].includes(updateData.role)) {
            throw new AppError(400, 'Vai trò người dùng không hợp lệ!');
        }

        if (Object.prototype.hasOwnProperty.call(data, 'password') && data.password) {
            AuthService.validatePassword(data.password);

            if (data.currentPassword) {
                const user = await UserRepository.findByIdInternal(id);
                if (!user) throw new AppError(404, 'Tài khoản không tồn tại!');
                const isMatch = await AuthService.comparePassword(data.currentPassword, user.password_hash);
                if (!isMatch) {
                    throw new AppError(400, 'Mật khẩu hiện tại không chính xác!');
                }
            } else if (currentUser.role !== 'admin' || currentUser.id === parseInt(id)) {
                throw new AppError(400, 'Vui lòng cung cấp mật khẩu hiện tại để đổi mật khẩu mới!');
            }

            updateData.password_hash = await AuthService.hashPassword(data.password);
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError(400, 'Không có trường hợp lệ để cập nhật!');
        }

        try {
            const updated = await UserRepository.update(id, updateData);
            if (!updated) throw new AppError(404, 'Không tìm thấy người dùng');
            if (updateData.password_hash || updateData.role !== undefined) {
                await RefreshTokenRepository.revokeAllByUser(id);
            }
            return updated;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') {
                if (err.detail?.includes('email')) {
                    throw new AppError(409, 'Email này đã được sử dụng bởi tài khoản khác!');
                }
                if (err.detail?.includes('phone')) {
                    throw new AppError(409, 'Số điện thoại này đã được sử dụng bởi tài khoản khác!');
                }
                throw new AppError(409, 'Thông tin email hoặc số điện thoại đã tồn tại!');
            }
            throw err;
        }
    },

    deleteUser: async (id, currentUser) => {
        if (currentUser.role !== 'admin') {
            throw new AppError(403, 'Chỉ quản trị viên mới có quyền xóa người dùng!');
        }
        if (currentUser.id === parseInt(id)) {
            throw new AppError(400, 'Không thể tự xóa chính tài khoản đang đăng nhập!');
        }

        const disabledPassword = await AuthService.hashPassword(crypto.randomBytes(32).toString('hex'));
        const deleted = await UserRepository.remove(id, disabledPassword);
        if (!deleted) throw new AppError(404, 'Không tìm thấy người dùng');
        await RefreshTokenRepository.revokeAllByUser(id);
        return deleted;
    },
};

module.exports = UserService;
