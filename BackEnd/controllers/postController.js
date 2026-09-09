const asyncHandler = require('../utils/asyncHandler');
const PostService = require('../services/postService');
const { parsePagination } = require('../utils/pagination');

const getAllPosts = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query.page, req.query.limit, 10, 50);
    const search = req.query.search || '';
    const publishedOnly = req.user?.role !== 'admin';
    res.status(200).json(await PostService.getAllPosts(page, limit, search, publishedOnly));
});

const getPostById = asyncHandler(async (req, res) => {
    const post = await PostService.getPostById(req.params.id, req.user?.role !== 'admin');
    res.status(200).json(post);
});

const createPost = asyncHandler(async (req, res) => {
    res.status(201).json(await PostService.createPost(req.body, req.user));
});

const updatePost = asyncHandler(async (req, res) => {
    res.status(200).json(await PostService.updatePost(req.params.id, req.body));
});

const deletePost = asyncHandler(async (req, res) => {
    res.status(200).json(await PostService.deletePost(req.params.id));
});

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
