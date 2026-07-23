const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { handleCategoryValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', verifyToken, isAdmin, handleCategoryValidation, createCategory);
router.put('/:id', verifyToken, isAdmin, updateCategory); // Chỉ admin được phép sửa đổi
router.delete('/:id', verifyToken, isAdmin, deleteCategory); // Chỉ admin được phép xóa

module.exports = router;