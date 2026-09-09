const PostRepository = require('../repositories/postRepository');
const AppError = require('../utils/AppError');
const sanitizeHtml = require('sanitize-html');

const sanitizePostContent = (content) => sanitizeHtml(String(content || ''), {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'img', 'code', 'pre'],
    allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
});

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

const PostService = {
    getAllPosts: async (page = 1, limit = 10, search = '', publishedOnly = false) => {
        const { rows, totalItems } = await PostRepository.findAll(page, limit, search, publishedOnly);
        return {
            data: rows,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                limit,
            },
        };
    },

    getPostById: async (id, publishedOnly = true) => {
        const post = await PostRepository.findById(id, publishedOnly);
        if (!post) throw new AppError(404, 'Không tìm thấy bài viết');
        return post;
    },

    createPost: async (data, user) => {
        if (
            typeof data.title !== 'string'
            || !data.title.trim()
            || data.title.length > 250
            || typeof data.content !== 'string'
            || !data.content.trim()
            || data.content.length > 100_000
        ) {
            throw new AppError(400, 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!');
        }

        if (data.summary !== undefined && data.summary !== null && (typeof data.summary !== 'string' || data.summary.length > 2000)) {
            throw new AppError(400, 'Tóm tắt bài viết không hợp lệ hoặc quá dài');
        }
        if (data.thumbnail_url !== undefined && data.thumbnail_url !== null && (typeof data.thumbnail_url !== 'string' || data.thumbnail_url.length > 2000)) {
            throw new AppError(400, 'URL ảnh bài viết không hợp lệ');
        }
        if (data.is_published !== undefined && typeof data.is_published !== 'boolean') {
            throw new AppError(400, 'Trạng thái xuất bản không hợp lệ');
        }

        data = { ...data, title: data.title.trim(), content: sanitizePostContent(data.content), author_id: user.id };
        if (data.slug) data.slug = slugify(data.slug);

        if (!data.slug) {
            const base = slugify(data.title);
            data.slug = (base || 'tin-tuc') + '-' + Date.now().toString().slice(-6);
        }

        try {
            return await PostRepository.create(data);
        } catch (err) {
            if (err.code === '23505') {
                data.slug = slugify(data.title) + '-' + Date.now();
                return await PostRepository.create(data);
            }
            throw err;
        }
    },

    updatePost: async (id, data) => {
        data = { ...data };
        if (data.title !== undefined && (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 250)) {
            throw new AppError(400, 'Tiêu đề bài viết không hợp lệ');
        }
        if (data.content !== undefined && (typeof data.content !== 'string' || data.content.length > 100_000)) {
            throw new AppError(400, 'Nội dung bài viết không hợp lệ hoặc quá dài');
        }
        if (data.summary !== undefined && data.summary !== null && (typeof data.summary !== 'string' || data.summary.length > 2000)) {
            throw new AppError(400, 'Tóm tắt bài viết không hợp lệ hoặc quá dài');
        }
        if (data.thumbnail_url !== undefined && data.thumbnail_url !== null && (typeof data.thumbnail_url !== 'string' || data.thumbnail_url.length > 2000)) {
            throw new AppError(400, 'URL ảnh bài viết không hợp lệ');
        }
        if (data.is_published !== undefined && typeof data.is_published !== 'boolean') {
            throw new AppError(400, 'Trạng thái xuất bản không hợp lệ');
        }
        if (data.title !== undefined) data.title = data.title.trim();
        if (data.content !== undefined) data.content = sanitizePostContent(data.content);
        if (data.slug !== undefined) data.slug = slugify(data.slug);
        delete data.author_id;
        if (data.title && !data.slug) {
            const base = slugify(data.title);
            data.slug = (base || 'tin-tuc') + '-' + Date.now().toString().slice(-4);
        }

        try {
            const updated = await PostRepository.update(id, data);
            if (!updated) {
                throw new AppError(404, 'Không tìm thấy bài viết hoặc không có dữ liệu hợp lệ để cập nhật');
            }
            return updated;
        } catch (err) {
            if (err.code === '23505') {
                data.slug = slugify(data.title) + '-' + Date.now();
                return await PostRepository.update(id, data);
            }
            throw err;
        }
    },

    deletePost: async (id) => {
        const deleted = await PostRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy bài viết');
        return deleted;
    },
};

module.exports = PostService;
