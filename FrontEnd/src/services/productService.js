import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE}/products`;

export const productService = {
    getAllProducts: async (page = 1, limit = 12, param3 = null, param4 = null, param5 = null) => {
        try {
            let catId = null;
            let brandId = null;
            let keyword = null;
            let minPrice = null;
            let maxPrice = null;
            let sortBy = 'newest';

            if (param3 && typeof param3 === 'object') {
                catId = param3.categoryId || param3.category_id || null;
                brandId = param3.brandId || param3.brand || null;
                keyword = param3.keyword || param3.search || null;
                minPrice = param3.minPrice !== undefined ? param3.minPrice : null;
                maxPrice = param3.maxPrice !== undefined ? param3.maxPrice : null;
                sortBy = param3.sortBy || 'newest';
            } else {
                catId = param3;
                brandId = param4;
                keyword = param5;
            }

            let url = `${API_URL}?page=${page}&limit=${limit}`;
            if (catId) url += `&categoryId=${encodeURIComponent(catId)}`;
            if (brandId) url += `&brandId=${encodeURIComponent(brandId)}`;
            if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
            if (minPrice !== null && minPrice !== undefined) url += `&minPrice=${minPrice}`;
            if (maxPrice !== null && maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;
            if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
            
            const response = await axios.get(url);
            const resData = response.data;
            
            let prods = [];
            if (Array.isArray(resData?.data)) {
                prods = resData.data;
            } else if (Array.isArray(resData?.data?.data)) {
                prods = resData.data.data;
            } else if (Array.isArray(resData?.products)) {
                prods = resData.products;
            } else if (Array.isArray(resData)) {
                prods = resData;
            }

            const totalPages = resData?.meta?.totalPages || resData?.data?.meta?.totalPages || (prods.length > 0 ? Math.ceil(prods.length / limit) : 1);
            const total = resData?.meta?.totalItems || resData?.data?.meta?.totalItems || prods.length;

            return {
                products: prods,
                data: prods,
                meta: resData?.meta || resData?.data?.meta || { totalItems: total, totalPages },
                totalPages,
                total
            };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            return { data: [], products: [], totalPages: 1, total: 0 };
        }
    },

    getProductById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data?.data?.legacy || response.data?.data || response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
            return null;
        }
    },

    getBrands: async () => {
        try {
            const response = await axios.get(`${API_BASE}/brands`);
            const raw = response.data?.data || response.data || [];
            return Array.isArray(raw) ? raw : [];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thương hiệu:', error);
            return [];
        }
    },

    getCategories: async () => {
        try {
            const response = await axios.get(`${API_BASE}/categories`);
            const raw = response.data?.data || response.data || [];
            return Array.isArray(raw) ? raw : [];
        } catch (error) {
            console.error('Lỗi khi lấy danh mục:', error);
            return [];
        }
    },

    searchProducts: async (keyword, page = 1, limit = 12) => {
        try {
            const response = await axios.get(`${API_URL}?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);
            const resData = response.data;
            const prods = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData?.data?.data) ? resData.data.data : (Array.isArray(resData) ? resData : []));
            return {
                products: prods,
                data: prods,
                meta: resData?.meta || resData?.data?.meta || {}
            };
        } catch (error) {
            console.error('Lỗi khi tìm kiếm sản phẩm:', error);
            return { data: [], products: [] };
        }
    },

    searchByImage: async (base64Image) => {
        try {
            const response = await axios.post(`${API_URL}/search-image`, { image: base64Image });
            return response.data?.data?.legacy || response.data?.data || response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm sản phẩm bằng hình ảnh:', error);
            throw error;
        }
    }
};
