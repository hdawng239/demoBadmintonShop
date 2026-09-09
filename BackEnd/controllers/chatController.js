const asyncHandler = require('../utils/asyncHandler');
const AiService = require('../services/aiService');

const handleChat = asyncHandler(async (req, res) => {
    const { message, sessionId, history } = req.body;
    const result = await AiService.handleChat(message, sessionId, req.user?.id || null, history);
    res.status(200).json(result);
});

module.exports = { handleChat };
