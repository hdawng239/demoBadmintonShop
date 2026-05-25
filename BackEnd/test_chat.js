require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.KEY_GEMINI);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction: "Bạn là trợ lý bán hàng cầu lông."
        });
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage("tư vấn vợt dưới 3 triệu yonex");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message || e);
    }
}
test();
