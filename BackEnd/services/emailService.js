const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : null;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Naro Badminton <onboarding@resend.dev>';
const EMAIL_ADMIN = process.env.EMAIL_ADMIN || 'dohaidang239@gmail.com';

const EmailService = {
    /**
     * Gửi mã OTP khôi phục mật khẩu qua Resend REST API
     * @param {string} toEmail - Địa chỉ email người nhận
     * @param {string} otp - Mã xác thực 6 chữ số
     */
    sendOtpEmail: async (toEmail, otp) => {
        // Nếu chưa cấu hình Resend API key, in OTP ra console để hỗ trợ dev test
        if (!resend) {
            console.log('\n======================================================');
            console.log(`[DEV TEST MODE] Mã OTP khôi phục mật khẩu cho [${toEmail}] là: ${otp}`);
            console.log('======================================================\n');
            return { sent: false, devMode: true };
        }

        try {
            const { data, error } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [toEmail],
                subject: 'Mã xác nhận khôi phục mật khẩu - Naro Badminton',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                            <tr>
                                <td align="center" style="padding: 40px 10px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #eaeaea;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background-color: #ea580c; padding: 28px 32px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                                                    🏸 NARO BADMINTON
                                                </h1>
                                            </td>
                                        </tr>
                                        <!-- Body Content -->
                                        <tr>
                                            <td style="padding: 36px 32px;">
                                                <h2 style="margin: 0 0 12px; color: #18181b; font-size: 18px; font-weight: 700;">
                                                    Yêu Cầu Đặt Lại Mật Khẩu
                                                </h2>
                                                <p style="margin: 0 0 20px; color: #52525b; font-size: 14px; line-height: 1.6;">
                                                    Xin chào, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này.
                                                </p>
                                                
                                                <!-- OTP Code Box -->
                                                <div style="background-color: #fff7ed; border: 1.5px dashed #ea580c; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                                                    <span style="font-size: 12px; font-weight: 700; color: #c2410c; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                                                        Mã Xác Thực Của Bạn
                                                    </span>
                                                    <span style="font-size: 32px; font-weight: 900; color: #ea580c; letter-spacing: 8px; font-family: monospace;">
                                                        ${otp}
                                                    </span>
                                                </div>

                                                <p style="margin: 0 0 12px; color: #71717a; font-size: 13px; line-height: 1.5;">
                                                    ⏱️ Mã xác thực này có hiệu lực trong vòng <b>5 phút</b>. Sau thời gian này, bạn cần gửi lại yêu cầu mới.
                                                </p>
                                                <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                                                    Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn tuyệt đối.
                                                </p>
                                            </td>
                                        </tr>
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #fafafa; padding: 20px 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                                <p style="margin: 0; color: #a1a1aa; font-size: 11px;">
                                                    © ${new Date().getFullYear()} Naro Badminton Shop • Hệ thống phân phối vợt & phụ kiện cầu lông chính hãng.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });

            if (error) {
                console.error('[Resend Error]:', error);
                return { sent: false, error: error.message };
            }

            console.log(`[Resend Success] Email OTP đã gửi thành công tới: ${toEmail} (ID: ${data?.id})`);
            return { sent: true, messageId: data?.id };
        } catch (err) {
            console.error('[Resend Exception]:', err.message);
            return { sent: false, error: err.message };
        }
    },

    /**
     * Gửi email liên hệ từ khách hàng tới ban quản trị Shop
     * @param {Object} contactData - Thông tin liên hệ { name, email, phone, message }
     */
    sendContactEmail: async ({ name, email, phone, message }) => {
        if (!resend) {
            console.log(`\n[DEV TEST MODE] Tin nhắn liên hệ mới từ ${name} (${email} - ${phone}): "${message}"\n`);
            return { sent: false, devMode: true };
        }

        try {
            const { data, error } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [EMAIL_ADMIN],
                reply_to: email,
                subject: `[Liên hệ mới từ Web] ${name} - ${phone || 'Khách hàng'}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #ea580c;">Tin nhắn liên hệ mới từ Website Naro Badminton</h2>
                        <p><b>Họ và tên:</b> ${name}</p>
                        <p><b>Email:</b> ${email}</p>
                        <p><b>Số điện thoại:</b> ${phone || 'Không cung cấp'}</p>
                        <p><b>Nội dung tin nhắn:</b></p>
                        <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; border-left: 4px solid #ea580c;">
                            ${message}
                        </div>
                    </div>
                `,
            });

            if (error) {
                console.error('[Resend Contact Error]:', error);
                return { sent: false, error: error.message };
            }

            return { sent: true, messageId: data?.id };
        } catch (err) {
            console.error('[Resend Contact Exception]:', err.message);
            return { sent: false, error: err.message };
        }
    },
};

module.exports = EmailService;
