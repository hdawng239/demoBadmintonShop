const User = require('../models/userModel');
const AuthService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { full_name, email, password, phone, address } = req.body;

        if (!email || !email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: "Email bắt buộc phải là định dạng @gmail.com" });
        }
        if (!phone || !/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
            return res.status(400).json({ message: "Số điện thoại bắt buộc phải có 10 chữ số và bắt đầu bằng số 0" });
        }
        if (!address || address.trim() === '') {
            return res.status(400).json({ message: "Địa chỉ là bắt buộc" });
        }

        // 1. Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.getByEmailForLogin(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // 2. Đưa mật khẩu trần qua máy băm
        const hashedPassword = await AuthService.hashPassword(password);

        // 3. Lưu vào Database với mật khẩu đã băm nát
        const newUser = await User.create({
            full_name,
            email,
            password: hashedPassword, // Lưu mật khẩu băm, không lưu pass gốc!
            role: 'customer', // Mặc định tạo tài khoản là khách hàng
            phone,
            address
        });

        res.status(201).json({ message: "Đăng ký tài khoản thành công!", data: newUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Tìm user theo email
        const user = await User.getByEmailForLogin(email);
        if (!user) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác!" });
        }

        // 2. So sánh mật khẩu khách gõ với mật khẩu băm trong DB
        const isMatch = await AuthService.comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác!" });
        }

        // 3. Đúng mật khẩu -> Chế tạo thẻ JWT
        const token = AuthService.generateToken(user);

        // Trả thẻ và thông tin cơ bản về cho FrontEnd
        res.status(200).json({
            message: "Đăng nhập thành công!",
            token: token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { register, login };