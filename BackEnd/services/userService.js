const UserRepository = require('../repositories/userRepository');
const AuthService = require('./authService');
const AppError = require('../utils/AppError');

const UserService = {
    getAllUsers: (page, limit, search) => UserRepository.findPaginated(page, limit, search),

    getUserById: async (id, currentUser) => {
        if (currentUser.role !== 'admin' && currentUser.id !== parseInt(id)) {
            throw new AppError(403, 'Bạn không có quyền xem thông tin của người dùng này!');
        }
        const user = await UserRepository.findById(id);
        if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
        return user;
    },

    createUser: async (data) => {
        const { password, email, phone } = data;

        if (!email || !email.endsWith('@gmail.com')) {
            throw new AppError(400, 'Email bắt buộc phải là định dạng @gmail.com');
        }
        if (phone && !/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
            throw new AppError(400, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
        }
        if (!password) {
            throw new AppError(400, 'Mật khẩu là bắt buộc!');
        }

        const existingEmail = await UserRepository.findByEmail(email);
        if (existingEmail) {
            throw new AppError(409, 'Email này đã được sử dụng!');
        }
        if (phone) {
            const existingPhone = await UserRepository.findByIdentifier(phone);
            if (existingPhone) {
                throw new AppError(409, 'Số điện thoại này đã được sử dụng!');
            }
        }

        const hashedPassword = await AuthService.hashPassword(password);

        try {
            return await UserRepository.create({ ...data, password: hashedPassword });
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

            // Nếu không phải Admin, bắt buộc phải cung cấp mật khẩu hiện tại để xác minh danh tính
            if (currentUser.role !== 'admin') {
                if (!data.currentPassword) {
                    throw new AppError(400, 'Vui lòng cung cấp mật khẩu hiện tại để đổi mật khẩu mới!');
                }
                const user = await UserRepository.findByEmail(currentUser.email);
                if (!user) throw new AppError(404, 'Tài khoản không tồn tại!');
                const isMatch = await AuthService.comparePassword(data.currentPassword, user.password_hash);
                if (!isMatch) {
                    throw new AppError(400, 'Mật khẩu hiện tại không chính xác!');
                }
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

    deleteUser: async (id) => {
        const deleted = await UserRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy người dùng');
        return deleted;
    },
};

module.exports = UserService;
