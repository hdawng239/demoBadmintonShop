const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById, createPost, updatePost, deletePost, addComment, deleteComment } = require('../controllers/postController');

// Quản lý Tin tức
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Quản lý Bình luận
router.post('/:postId/comments', addComment);
router.delete('/comments/:id', deleteComment);

module.exports = router;