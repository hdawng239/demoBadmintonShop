const UserRepository = require('../repositories/userRepository');
const AuthService = require('./authService');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ: kiểm tra điều kiện, validation, điều phối repository.
// Không biết gì về req/res (HTTP).
const UserService = {
    getAllUsers: (page, limit, search) => UserRepository.findPaginated(page, limit, search),

    getUserById: async (id) => {
        const user = await UserRepository.findById(id);
        if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
        return user;
    },

    createUser: async (data) => {
        const { password, email, phone } = data;

        // Validate email
        if (!email || !email.endsWith('@gmail.com')) {
            throw new AppError(400, 'Email bắt buộc phải là định dạng @gmail.com');
        }

        // Validate phone
        if (phone && !/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
            throw new AppError(400, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
        }

        // Validate password
        if (!password) {
            throw new AppError(400, 'Mật khẩu là bắt buộc!');
        }

        // Check uniqueness
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

        // Hash password
        const hashedPassword = await AuthService.hashPassword(password);

        try {
            return await UserRepository.create({ ...data, password: hashedPassword });
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Email hoặc số điện thoại đã tồn tại!');
            throw err;
        }
    },

    updateUser: async (id, data, currentUser) => {
        const updateData = { ...data };

        // Validate email
        if (updateData.email && !updateData.email.endsWith('@gmail.com')) {
            throw new AppError(400, 'Email bắt buộc phải là định dạng @gmail.com');
        }

        // Validate phone
        if (updateData.phone && !/^0(3|5|7|8|9)\d{8}$/.test(updateData.phone)) {
            throw new AppError(400, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
        }

        // Chỉ admin mới được sửa role
        if (updateData.role && currentUser?.role !== 'admin') {
            delete updateData.role;
        }

        // Hash password nếu có
        if (updateData.password) {
            updateData.password_hash = await AuthService.hashPassword(updateData.password);
            delete updateData.password;
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
