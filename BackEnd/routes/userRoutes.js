const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { handleUserValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');


router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', handleUserValidation, createUser);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;