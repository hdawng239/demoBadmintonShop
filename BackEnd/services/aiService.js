const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.KEY_GEMINI) {
    console.warn("⚠️ KEY_GEMINI is not set in environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI || "");

/**
 * Helper to parse Base64 string and extract mimeType and raw base64 data
 * @param {string} dataString 
 */
function parseBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return {
            mimeType: "image/jpeg",
            data: dataString
        };
    }
    return {
        mimeType: matches[1],
        data: matches[2]
    };
}

/**
 * Phân tích hình ảnh sản phẩm và tìm các sản phẩm khớp/tương đồng trong danh sách
 * @param {string} base64ImageString - Chuỗi base64 của ảnh
 * @param {Array} productList - Danh sách thông tin cơ bản các sản phẩm: [{ id, name, description, brand_name, category_name }, ...]
 * @returns {Promise<Array<number>>} - Mảng chứa các ID sản phẩm khớp/tương đồng nhất
 */
async function analyzeProductImage(base64ImageString, productList) {
    try {
        const { mimeType, data } = parseBase64Image(base64ImageString);

        // Sử dụng model gemini-3.1-flash-lite
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

        const imagePart = {
            inlineData: {
                data: data,
                mimeType: mimeType
            }
        };

        const prompt = `Bạn là chuyên gia nhận diện dụng cụ, giày và phụ kiện cầu lông tại Naro Shop.
Dưới đây là danh sách sản phẩm thực tế đang có trong kho của chúng tôi:
${JSON.stringify(productList, null, 2)}

Nhiệm vụ của bạn là:
1. Nhìn vào hình ảnh được cung cấp. Phân tích loại sản phẩm, màu sắc, kiểu dáng, thương hiệu, tên hoặc họa tiết trên đó.
2. Tìm kiếm trong danh sách sản phẩm trên xem sản phẩm nào khớp nhất hoặc có độ tương đồng cao nhất về mặt hình ảnh, đặc tả sản phẩm (Ví dụ: nếu là giày Yonex màu đỏ, hãy tìm các đôi giày Yonex tương ứng trong danh sách. Nếu là vợt Astrox, hãy chọn các vợt Astrox).
3. Lập danh sách các ID sản phẩm khớp nhất hoặc tương đồng nhất theo thứ tự giảm dần của độ khớp (từ khớp nhất xuống ít khớp hơn, tối đa 12 sản phẩm).
4. CHỈ TRẢ VỀ kết quả dưới dạng một mảng JSON thuần túy chứa các số ID sản phẩm, ví dụ: [3, 15, 8]. Không thêm bất cứ giải thích nào, không bao bọc bằng khối mã (code blocks) hay ký tự xuống dòng dư thừa. Trả về đúng mảng JSON.`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        let cleanText = responseText.trim();
        // Loại bỏ markdown code block nếu có
        if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
        }

        const matchedIds = JSON.parse(cleanText);
        if (Array.isArray(matchedIds)) {
            // Đảm bảo các ID là kiểu number
            return matchedIds.map(Number).filter(id => !isNaN(id));
        }
        return [];
    } catch (error) {
        console.error("❌ Lỗi phân tích ảnh bằng Gemini:", error.message || error);
        throw error;
    }
}

module.exports = {
    analyzeProductImage
};
