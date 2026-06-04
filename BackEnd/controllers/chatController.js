const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db"); // Giả sử dùng chung pool db

const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI);

const baseSystemInstruction = `Bạn là trợ lý tư vấn của Naro Shop - cửa hàng dụng cụ cầu lông.
## PHẠM VI TRẢ LỜI
Chỉ trả lời về: cầu lông (kỹ thuật, luật, giải đấu), dụng cụ cầu lông, thông tin Naro Shop, thương hiệu thể thao cầu lông.
Ngoài phạm vi trên, từ chối bằng đúng câu: "Dạ xin lỗi bạn, em là trợ lý tư vấn chuyên biệt về Đồ Cầu Lông của Naro Shop nên không có dữ liệu để giải đáp vấn đề ngoài lề này ạ. Bạn có đang tìm mua Vợt hay Giày cầu lông không, em tư vấn cho ạ!"

## CÁCH TRẢ LỜI (quan trọng)
- Đi thẳng vào trả lời, KHÔNG mở đầu bằng "Dạ", "Chào bạn", "Cảm ơn bạn đã hỏi" hay bất kỳ câu nịnh nọt nào
- KHÔNG lặp lại câu hỏi của khách
- Nếu khách nhờ tư vấn sản phẩm, HÃY TÌM TRONG DANH SÁCH SẢN PHẨM Ở DƯỚI ĐÂY để trả lời ĐÚNG tên sản phẩm và ĐÚNG giá bán.
- Nếu sản phẩm khách hỏi KHÔNG có trong danh sách, hãy nói: "Dạ hiện tại mẫu này bên em đang hết hàng hoặc chưa có sẵn, anh/chị tham khảo thử mẫu... [gợi ý mẫu khác trong danh sách]"
- Trả lời ngắn gọn, đúng trọng tâm, gợi ý thêm nếu cần
- Dùng emoji hợp lý, không lạm dụng
- Xưng "em", gọi khách là "bạn" hoặc "anh/chị"
- Kết thúc bằng 1 câu hỏi gợi mở ngắn nếu phù hợp

## THÔNG TIN NAVISHOP
- Hotline: 0977.508.430
- Địa chỉ: 123 Đường Cầu Lông, Quận Thể Thao, Hà Nội
- Thanh toán: COD toàn quốc (kiểm hàng trước khi nhận), chuyển khoản QR SePay
- Nhượng quyền: Mặt bằng 50m², hỗ trợ setup 100%`;

let productCatalogCache = "";
let lastCacheTime = 0;

async function getProductCatalog() {
    try {
        if (Date.now() - lastCacheTime > 10 * 60 * 1000) { // 10 minutes cache
            const res = await pool.query("SELECT name, base_price FROM products WHERE is_active = true");
            if (res.rows.length > 0) {
                const list = res.rows.map(p => `- ${p.name}: ${parseInt(p.base_price).toLocaleString('vi-VN')} VNĐ`).join('\n');
                productCatalogCache = `\n\n--- KHO HÀNG THỰC TẾ CỦA NAVISHOP (Chỉ lấy sản phẩm từ danh sách này) ---\n${list}\n----------------------------------`;
            }
            lastCacheTime = Date.now();
        }
    } catch (e) {
        console.error("Lỗi lấy danh sách sản phẩm:", e);
    }
    return productCatalogCache;
}

const handleChat = async (req, res) => {
    try {
        const { message, sessionId, userId, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Thiếu tin nhắn." });
        }

        const sid = sessionId || 'anonymous_session';
        const uid = userId || null;

        await pool.query(
            "INSERT INTO chat_logs (session_id, user_id, sender_type, message) VALUES ($1, $2, $3, $4)",
            [sid, uid, 'user', message]
        );

        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            formattedHistory = history.map(msg => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
        }

        const catalogInfo = await getProductCatalog();
        const finalSystemInstruction = baseSystemInstruction + catalogInfo;

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite",
            systemInstruction: finalSystemInstruction
        });

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.5, // Giảm temperature để AI trả lời sát với danh sách thực tế hơn
            }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

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
