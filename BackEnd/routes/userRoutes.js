const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { handleUserValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');


router.use(verifyToken, isAdmin);


router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', handleUserValidation, createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;