const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { handleCategoryValidation } = require('../middlewares/validationMiddleware');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', handleCategoryValidation, createCategory);
router.put('/:id', updateCategory); // Đi thẳng vào controller, tự build SQL động can thiệp sâu
router.delete('/:id', deleteCategory);

module.exports = router;