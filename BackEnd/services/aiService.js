const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const ChatRepository = require('../repositories/chatRepository');
const AppError = require('../utils/AppError');


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

let productCatalogCache = '';
let lastCacheTime = 0;

const AiService = {
    handleChat: async (message, sessionId, userId, history) => {
        if (typeof message !== 'string' || !message.trim()) throw new AppError(400, 'Thiếu tin nhắn.');
        if (message.length > 1000) throw new AppError(400, 'Tin nhắn không được vượt quá 1000 ký tự.');

        const sid = typeof sessionId === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(sessionId)
            ? sessionId
            : crypto.randomUUID();
        const uid = userId || null;

        await ChatRepository.logMessage(sid, uid, 'user', message);

        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            formattedHistory = history.slice(-10).filter((msg) => typeof msg?.content === 'string').map((msg) => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content.slice(0, 1000) }],
            }));
        }

        if (Date.now() - lastCacheTime > 10 * 60 * 1000) {
            const catalog = await ChatRepository.getProductCatalog();
            if (catalog) {
                productCatalogCache = `\n\n--- KHO HÀNG THỰC TẾ CỦA NAVISHOP (Chỉ lấy sản phẩm từ danh sách này) ---\n${catalog}\n----------------------------------`;
            }
            lastCacheTime = Date.now();
        }

        const systemInstruction = BASE_SYSTEM_INSTRUCTION + productCatalogCache;

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            systemInstruction,
        }, { timeout: 8000 });

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        await ChatRepository.logMessage(sid, uid, 'bot', responseText);

        return { reply: responseText };
    },

    _parseBase64Image: (dataString) => {
        if (typeof dataString !== 'string') throw new AppError(400, 'Ảnh không hợp lệ.');
        const matches = dataString.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
        if (!matches) {
            throw new AppError(400, 'Ảnh phải là dữ liệu Base64 JPEG, PNG hoặc WebP hợp lệ.');
        }
        const buffer = Buffer.from(matches[2], 'base64');
        if (!buffer.length || buffer.length > 3_500_000) {
            throw new AppError(400, 'Ảnh không hợp lệ hoặc vượt quá giới hạn 3.5 MB.');
        }
        const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        const isWebp = buffer.subarray(0, 4).toString('ascii') === 'RIFF'
            && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
        const validSignature = (matches[1] === 'image/jpeg' && isJpeg)
            || (matches[1] === 'image/png' && isPng)
            || (matches[1] === 'image/webp' && isWebp);
        if (!validSignature) throw new AppError(400, 'Nội dung ảnh không khớp định dạng đã khai báo.');
        return { mimeType: matches[1], data: matches[2] };
    },

    analyzeProductImage: async (base64ImageString, productList) => {
        if (typeof base64ImageString !== 'string' || base64ImageString.length > 4_700_000) {
            throw new AppError(400, 'Ảnh không hợp lệ hoặc vượt quá giới hạn 3.5 MB.');
        }
        const { mimeType, data } = AiService._parseBase64Image(base64ImageString);
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
            throw new AppError(400, 'Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.');
        }

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

        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.6-flash'];
        
        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: { maxOutputTokens: 100, temperature: 0.1 }
                }, { timeout: 8000 });
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
