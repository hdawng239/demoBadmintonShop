const User = require('../models/userModel');
const AuthService = require('../services/authService');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

        // 2. Kiểm tra xem số điện thoại đã tồn tại chưa
        const existingPhone = await User.getByIdentifierForLogin(phone);
        if (existingPhone) {
            return res.status(400).json({ message: "Số điện thoại này đã được sử dụng!" });
        }

        // 3. Đưa mật khẩu trần qua máy băm
        const hashedPassword = await AuthService.hashPassword(password);

        // 4. Lưu vào Database với mật khẩu đã băm nát
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

        // 1. Tìm user theo email hoặc số điện thoại
        const user = await User.getByIdentifierForLogin(email);
        if (!user) {
            return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không chính xác!" });
        }

        // 2. So sánh mật khẩu khách gõ với mật khẩu băm trong DB
        const isMatch = await AuthService.comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không chính xác!" });
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

const generateRandomString = (length) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Bỏ 0, O, 1, I để tránh nhầm lẫn
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getCaptcha = async (req, res) => {
    try {
        const length = Math.floor(Math.random() * 3) + 4; // Từ 4 đến 6 ký tự
        const question = generateRandomString(length);
        const answer = question.toUpperCase(); // Lưu dạng chữ hoa để so sánh case-insensitive

        const captchaToken = jwt.sign(
            { answer: answer },
            process.env.JWT_SECRET,
            { expiresIn: '3m' } // Captcha có hiệu lực trong 3 phút
        );

        res.status(200).json({
            question,
            captchaToken
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi tạo Captcha", error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, captchaAnswer, captchaToken } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email của bạn!" });
        }

        // 1. Xác thực Captcha
        if (!captchaToken || captchaAnswer === undefined || captchaAnswer === "") {
            return res.status(400).json({ message: "Vui lòng hoàn thành mã Captcha!" });
        }

        try {
            const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
            if (captchaAnswer.trim().toUpperCase() !== decoded.answer) {
                return res.status(400).json({ message: "Mã Captcha không chính xác!" });
            }
        } catch (err) {
            return res.status(400).json({ message: "Mã Captcha đã hết hạn hoặc không hợp lệ, vui lòng thử lại!" });
        }

        // 2. Tìm kiếm user
        const user = await User.getByEmailForLogin(email);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản nào liên kết với email này!" });
        }

        // 3. Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

        await User.updateOTP(email, otp, expires);

        // 4. Gửi email qua Nodemailer
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log(`\n======================================================`);
            console.log(`[TEST MODE] OTP khôi phục mật khẩu cho ${email} là: ${otp}`);
            console.log(`======================================================\n`);
            return res.status(200).json({
                message: "Mã OTP đã được tạo (Chế độ thử nghiệm: chưa cấu hình Gmail trong .env).",
                testMode: true,
                otp: otp
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: `"Cửa hàng Badminton Shop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã xác nhận khôi phục mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 0 auto; border-radius: 10px;">
                    <h2 style="color: #ea580c; text-align: center; text-transform: uppercase;">Khôi Phục Mật Khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã gửi yêu cầu khôi phục mật khẩu tài khoản của mình trên hệ thống của chúng tôi.</p>
                    <div style="background-color: #fff7ed; border: 1px dashed #ea580c; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <span style="font-size: 24px; font-weight: bold; color: #ea580c; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p>Mã xác nhận (OTP) này có hiệu lực trong vòng <b>5 phút</b>. Sau thời gian này, mã sẽ không còn tác dụng.</p>
                    <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn sẽ được giữ nguyên.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến!"
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi gửi mã OTP", error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ các thông tin bắt buộc!" });
        }

        // 1. Tìm user theo email
        const user = await User.getByEmailForLogin(email);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản tương ứng!" });
        }

        // 2. Kiểm tra OTP
        if (!user.otp_code || user.otp_code !== otp) {
            return res.status(400).json({ message: "Mã xác nhận (OTP) không chính xác!" });
        }

        // 3. Kiểm tra thời hạn OTP
        const now = new Date();
        const otpExpires = new Date(user.otp_expires);
        if (now > otpExpires) {
            return res.status(400).json({ message: "Mã OTP đã hết hiệu lực, vui lòng lấy mã mới!" });
        }

        // 4. Mã hóa mật khẩu mới và cập nhật
        const hashedPassword = await AuthService.hashPassword(newPassword);
        await User.resetPasswordWithOTP(email, hashedPassword);

        return res.status(200).json({
            message: "Khôi phục mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập."
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi khôi phục mật khẩu", error: error.message });
    }
};

module.exports = { register, login, getCaptcha, forgotPassword, resetPassword };