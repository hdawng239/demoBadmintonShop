const express = require('express');
const router = express.Router();
const { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { handleBrandValidation } = require('../middlewares/validationMiddleware');

router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', handleBrandValidation, createBrand);
router.put('/:id', updateBrand); // Cho phép sửa đổi tất cả thuộc tính tự do
router.delete('/:id', deleteBrand);

module.exports = router;