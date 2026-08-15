const UserRepository = require('../repositories/userRepository');
const AuthService = require('./authService');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ: xử lý logic, kiểm tra quyền, hash password, validate nghiệp vụ.
const UserService = {
    getAllUsers: async (page = 1, limit = 10, search = null) => {
        const offset = (page - 1) * limit;
        return await UserRepository.findAll(limit, offset, search);
    },

    getUserById: async (id) => {
        const user = await UserRepository.findById(id);
        if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
        return user;
    },

    createUser: async (data, currentUser) => {
        if (currentUser.role !== 'admin') {
            throw new AppError(403, 'Chỉ quản trị viên mới có quyền tạo người dùng trực tiếp!');
        }

        if (!data.username || !data.email || !data.password || !data.full_name) {
            throw new AppError(400, 'Vui lòng điền đầy đủ các thông tin bắt buộc (username, email, password, full_name)!');
        }

        if (!data.email.endsWith('@gmail.com')) {
            throw new AppError(400, 'Email bắt buộc phải là định dạng @gmail.com');
        }

        if (data.phone && !/^0(3|5|7|8|9)\d{8}$/.test(data.phone)) {
            throw new AppError(400, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
        }

        const role = data.role && ['customer', 'admin'].includes(data.role) ? data.role : 'customer';

        if (data.password.length < 6) {
            throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự!');
        }

        const hashedPassword = await AuthService.hashPassword(data.password);

        try {
            return await UserRepository.create({ ...data, role, password: hashedPassword });
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Email hoặc số điện thoại đã tồn tại!');
            throw err;
        }
    },

    updateUser: async (id, data, currentUser) => {
        if (currentUser.role !== 'admin' && currentUser.id !== parseInt(id)) {
            throw new AppError(403, 'Bạn không có quyền chỉnh sửa thông tin của người dùng này!');
        }

        const updateData = { ...data };

        if (updateData.email && !updateData.email.endsWith('@gmail.com')) {
            throw new AppError(400, 'Email bắt buộc phải là định dạng @gmail.com');
        }
        if (updateData.phone && !/^0(3|5|7|8|9)\d{8}$/.test(updateData.phone)) {
            throw new AppError(400, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
        }

        // Chỉ admin mới được đổi role
        if (updateData.role && currentUser?.role !== 'admin') {
            delete updateData.role;
        }

        // Đổi mật khẩu an toàn
        if (updateData.password) {
            // Kiểm tra độ dài tối thiểu
            if (updateData.password.length < 6) {
                throw new AppError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự!');
            }

            // Nếu người dùng cung cấp mật khẩu hiện tại
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

            updateData.password_hash = await AuthService.hashPassword(updateData.password);
            delete updateData.password;
            delete updateData.currentPassword;
        }

        try {
            const updated = await UserRepository.update(id, updateData);
            if (!updated) throw new AppError(404, 'Không tìm thấy người dùng');
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

        const deleted = await UserRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy người dùng');
        return deleted;
    },
};

module.exports = UserService;
