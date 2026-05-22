const { validateUserCreate } = require('../validations/userValidation');
const { validateOrderCreate } = require('../validations/orderValidation');
const { validateReviewCreate } = require('../validations/reviewValidation');
const { validateCategoryCreate } = require('../validations/categoryValidation');
const { validateBrandCreate } = require('../validations/brandValidation');

const handleUserValidation = (req, res, next) => {
    const errors = validateUserCreate(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }
    next(); // Không lỗi thì cho đi tiếp vào Controller
};

const handleOrderValidation = (req, res, next) => {
    const errors = validateOrderCreate(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }
    next();
};

const handleReviewValidation = (req, res, next) => {
    const errors = validateReviewCreate(req.body);
    if (errors.length > 0) return res.status(400).json({ status: "fail", errors });
    next();
};
const handleCategoryValidation = (req, res, next) => {
    const errors = validateCategoryCreate(req.body);
    if (errors.length > 0) return res.status(400).json({ status: "fail", errors });
    next();
};
const handleBrandValidation = (req, res, next) => {
    const errors = validateBrandCreate(req.body);
    if (errors.length > 0) return res.status(400).json({ status: "fail", errors });
    next();
};

module.exports = { handleUserValidation, handleOrderValidation ,handleReviewValidation,handleCategoryValidation,handleBrandValidation};