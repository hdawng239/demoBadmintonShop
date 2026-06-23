const asyncHandler = require('../utils/asyncHandler');
const PostService = require('../services/postService');

// CONTROLLER = chỉ đọc request, gọi service, trả response.
// Giữ nguyên shape response cũ (create/update/delete trả thẳng object) để FE không vỡ.
const getAllPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    res.status(200).json(await PostService.getAllPosts(page, limit, search));
});

const getPostById = asyncHandler(async (req, res) => {
    const post = await PostService.getPostById(req.params.id);
    res.status(200).json(post);
});

const createPost = asyncHandler(async (req, res) => {
    res.status(201).json(await PostService.createPost(req.body));
});

const updatePost = asyncHandler(async (req, res) => {
    res.status(200).json(await PostService.updatePost(req.params.id, req.body));
});

const deletePost = asyncHandler(async (req, res) => {
    res.status(200).json(await PostService.deletePost(req.params.id));
});

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
