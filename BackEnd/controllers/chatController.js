const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db"); // Giả sử dùng chung pool db

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI);

const systemInstruction = `Bạn là trợ lý tư vấn của NaviShop - cửa hàng dụng cụ cầu lông.
## PHẠM VI TRẢ LỜI
Chỉ trả lời về: cầu lông (kỹ thuật, luật, giải đấu), dụng cụ cầu lông, thông tin NaviShop, thương hiệu thể thao cầu lông.
Ngoài phạm vi trên, từ chối bằng đúng câu: "Dạ xin lỗi bạn, em là trợ lý tư vấn chuyên biệt về Đồ Cầu Lông của NaviShop nên không có dữ liệu để giải đáp vấn đề ngoài lề này ạ. Bạn có đang tìm mua Vợt hay Giày cầu lông không, em tư vấn cho ạ!"

## CÁCH TRẢ LỜI (quan trọng)
- Đi thẳng vào trả lời, KHÔNG mở đầu bằng "Dạ", "Chào bạn", "Cảm ơn bạn đã hỏi" hay bất kỳ câu nịnh nọt nào
- KHÔNG lặp lại câu hỏi của khách
- Hỏi danh sách sản phẩm → liệt kê thẳng, không giải thích vòng vo
- Hỏi tư vấn → trả lời ngắn gọn, đúng trọng tâm, gợi ý thêm nếu cần
- Dùng emoji hợp lý, không lạm dụng
- Xưng "em", gọi khách là "bạn" hoặc "anh/chị"
- Kết thúc bằng 1 câu hỏi gợi mở ngắn nếu phù hợp

## THÔNG TIN NAVISHOP
- Hotline: 0977.508.430
- Địa chỉ: 123 Đường Cầu Lông, Quận Thể Thao, Hà Nội
- Sản phẩm: Vợt Yonex, Lining, Victor chính hãng; giày cầu lông; cước (BG65, BG80, Exbolt...)
- Thanh toán: COD toàn quốc (kiểm hàng trước khi nhận), chuyển khoản QR SePay
- Nhượng quyền: Mặt bằng 50m², hỗ trợ setup 100%`;
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
