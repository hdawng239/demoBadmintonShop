const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatRepository = require('../repositories/chatRepository');
const AppError = require('../utils/AppError');

// AI Service = Gemini + search-by-image + chatbot tư vấn.

if (!process.env.KEY_GEMINI) {
    console.warn('⚠️ KEY_GEMINI is not set in environment variables!');
}

const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI || '');

const BASE_SYSTEM_INSTRUCTION = `Bạn là trợ lý tư vấn của Naro Shop - cửa hàng dụng cụ cầu lông.
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

// Cache catalog 10 phút
let productCatalogCache = '';
let lastCacheTime = 0;

const AiService = {
    // ── Chatbot tư vấn ─────────────────────────────────────
    handleChat: async (message, sessionId, userId, history) => {
        if (!message) throw new AppError(400, 'Thiếu tin nhắn.');

        const sid = sessionId || 'anonymous_session';
        const uid = userId || null;

        // Ghi log user
        await ChatRepository.logMessage(sid, uid, 'user', message);

        // Format history từ FE gửi lên
        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            formattedHistory = history.map((msg) => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));
        }

        // Lấy catalog (cached)
        if (Date.now() - lastCacheTime > 10 * 60 * 1000) {
            const catalog = await ChatRepository.getProductCatalog();
            if (catalog) {
                productCatalogCache = `\n\n--- KHO HÀNG THỰC TẾ CỦA NAVISHOP (Chỉ lấy sản phẩm từ danh sách này) ---\n${catalog}\n----------------------------------`;
            }
            lastCacheTime = Date.now();
        }

        const systemInstruction = BASE_SYSTEM_INSTRUCTION + productCatalogCache;

        // Sử dụng model gemini-3.1-flash-lite chuẩn như trong commit b7462d7 (phản hồi siêu nhanh và ổn định)
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            systemInstruction,
        });

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Ghi log bot
        await ChatRepository.logMessage(sid, uid, 'bot', responseText);

        return { reply: responseText };
    },

    // ── Tìm kiếm bằng hình ảnh ─────────────────────────────
    _parseBase64Image: (dataString) => {
        const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return { mimeType: 'image/jpeg', data: dataString };
        }
        return { mimeType: matches[1], data: matches[2] };
    },

    analyzeProductImage: async (base64ImageString, productList) => {
        const { mimeType, data } = AiService._parseBase64Image(base64ImageString);

        const imagePart = {
            inlineData: { data, mimeType },
        };

        const compactCatalog = (productList || []).map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category
        }));

        const prompt = `Bạn là chuyên gia nhận diện dụng cụ, vợt, giày và phụ kiện cầu lông tại Naro Shop.
Dưới đây là danh sách sản phẩm thực tế đang có trong kho của chúng tôi:
${JSON.stringify(compactCatalog)}

Nhiệm vụ của bạn là:
1. Nhìn vào hình ảnh được cung cấp. Phân tích loại sản phẩm (vợt, giày, áo, túi, phụ kiện...), màu sắc, kiểu dáng, thương hiệu (Yonex, Victor, Li-Ning, Mizuno, Kumpoo...), tên dòng vợt hoặc họa tiết.
2. Tìm kiếm trong danh sách sản phẩm trên xem những sản phẩm nào khớp nhất hoặc có độ tương đồng cao nhất.
3. Lập danh sách các ID sản phẩm khớp nhất theo thứ tự giảm dần của độ khớp (tối đa 6 sản phẩm).
4. CHỈ TRẢ VỀ kết quả dưới dạng một mảng JSON các số ID sản phẩm, ví dụ: [3, 15, 8]. Không thêm bất cứ giải thích nào khác.`;

        const parseResult = (text) => {
            let cleanText = text.trim();
            const jsonMatch = cleanText.match(/\[[\s\d,]*\]/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
            }
            const matchedIds = JSON.parse(cleanText);
            if (Array.isArray(matchedIds)) {
                return matchedIds.map(Number).filter((id) => !isNaN(id));
            }
            return [];
        };

        // Ưu tiên gemini-3.1-flash-lite / gemini-3.6-flash để đạt tốc độ nhận diện nhanh nhất (2-3s)
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.6-flash'];
        
        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: { maxOutputTokens: 100, temperature: 0.1 }
                });
                const result = await model.generateContent([prompt, imagePart]);
                const ids = parseResult(result.response.text());
                if (ids && ids.length > 0) {
                    return ids;
                }
            } catch (err) {
                continue;
            }
        }
        return [];
    },
};

module.exports = AiService;
