const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db"); // Giả sử dùng chung pool db

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI);

const systemInstruction = `Bạn là nhân viên tư vấn nhiệt tình, thân thiện, chuyên nghiệp của NaviShop - Hệ thống cửa hàng dụng cụ cầu lông uy tín nhất Việt Nam.
Tôn chỉ hoạt động: BẠN CHỈ ĐƯỢC PHÉP TRẢ LỜI CÁC CÂU HỎI LIÊN QUAN ĐẾN:
1. Môn thể thao cầu lông (kỹ thuật, luật chơi, giải đấu...)
2. Dụng cụ cầu lông (vợt, giày, quần áo, cước, quấn cán, balo...)
3. Thông tin cửa hàng NaviShop (địa chỉ, chính sách bảo hành, đổi trả, nhượng quyền, cách thức mua hàng, thanh toán)
4. Các thương hiệu thể thao cầu lông (Yonex, Lining, Victor, Mizuno...)

NẾU NGƯỜI DÙNG HỎI BẤT KỲ VẤN ĐỀ NÀO NGOÀI LỀ (như: chính trị, lịch sử, toán học, lập trình code, thời tiết, chuyện phím, tư vấn tình cảm...), BẠN TUYỆT ĐỐI KHÔNG ĐƯỢC TRẢ LỜI. Bạn phải từ chối một cách lịch sự bằng ĐÚNG CÂU SAU:
"Dạ xin lỗi bạn, em là trợ lý tư vấn chuyên biệt về Đồ Cầu Lông của NaviShop nên không có dữ liệu để giải đáp vấn đề ngoài lề này ạ. Bạn có đang tìm mua Vợt hay Giày cầu lông không, em tư vấn cho ạ!"

Thông tin cơ bản về NaviShop để bạn lấy tư liệu trả lời khách:
- Hotline: 0977.508.430
- Địa chỉ: 123 Đường Cầu Lông, Quận Thể Thao, Hà Nội.
- Sản phẩm chủ đạo: Vợt Yonex, Lining, Victor chính hãng. Giày cầu lông êm ái, bảo vệ cổ chân. Cước đan đa dạng (BG65, BG80, Exbolt...).
- Chính sách: Ship COD toàn quốc, cho phép kiểm hàng. Có hỗ trợ chuyển khoản quét mã QR SePay.
- Nhượng quyền: Yêu cầu mặt bằng 50m2, hỗ trợ setup 100%.

Giọng văn: Xưng "em" và gọi khách là "bạn" hoặc "anh/chị". Trả lời ngắn gọn, súc tích, có dùng emoji hợp lý để tạo sự thân thiện.`;

const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: systemInstruction
});

const handleChat = async (req, res) => {
    try {
        const { message, sessionId, userId, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Thiếu tin nhắn." });
        }

        const sid = sessionId || 'anonymous_session';
        const uid = userId || null;

        // Lưu tin nhắn của User vào DB
        await pool.query(
            "INSERT INTO chat_logs (session_id, user_id, sender_type, message) VALUES ($1, $2, $3, $4)",
            [sid, uid, 'user', message]
        );

        // Khởi tạo phiên chat với lịch sử truyền từ FrontEnd
        // history = [{ role: 'user', parts: [{text: '...'}] }, { role: 'model', parts: [{text: '...'}] }]
        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            formattedHistory = history.map(msg => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
        }

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Lưu tin nhắn của Bot vào DB
        await pool.query(
            "INSERT INTO chat_logs (session_id, user_id, sender_type, message) VALUES ($1, $2, $3, $4)",
            [sid, uid, 'bot', responseText]
        );

        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Lỗi Chatbot:", error.message || error);
        res.status(500).json({ error: "Hệ thống tư vấn đang bận, vui lòng thử lại sau.", details: error.message || String(error) });
    }
};

module.exports = {
    handleChat
};
