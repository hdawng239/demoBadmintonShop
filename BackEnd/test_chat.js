require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("./config/db");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI);
        
        console.log("Fetching products from DB...");
        const res = await pool.query("SELECT name, base_price FROM products WHERE is_active = true");
        const list = res.rows.map(p => `- ${p.name}: ${parseInt(p.base_price).toLocaleString('vi-VN')} VNĐ`).join('\n');
        const catalog = `\n\n--- KHO HÀNG THỰC TẾ ---\n${list}`;

        console.log("Found", res.rows.length, "products. Querying Gemini...");

        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction: "Bạn là trợ lý bán hàng cầu lông." + catalog
        });
        
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage("Tư vấn vợt dưới 3 triệu");
        console.log("\nResponse:\n", result.response.text());
        process.exit(0);
    } catch (e) {
        console.error("Error:", e.message || e);
        process.exit(1);
    }
}
test();
