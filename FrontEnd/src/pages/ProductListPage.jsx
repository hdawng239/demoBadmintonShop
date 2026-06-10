import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import { productService } from '../services/productService';

const ProductListPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lọc & Phân trang
  const location = useLocation();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch Brands cho Sidebar
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/brands`);
        setBrands(res.data.data || res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Sync URL query with selected brand
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brandQuery = params.get('brand');
    
    if (brandQuery && brands.length > 0) {
      const foundBrand = brands.find(b => b.name.toLowerCase() === brandQuery.toLowerCase());
      if (foundBrand) {
        setSelectedBrand(foundBrand.id);
      } else {
        setSelectedBrand(null);
      }
    } else if (!brandQuery) {
      setSelectedBrand(null);
    }
  }, [location.search, brands]);

  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('q') || '';

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const limit = 12; // 12 sản phẩm 1 trang cho danh sách
        const data = await productService.getAllProducts(page, limit, categoryId, selectedBrand, keyword);
        
        setProducts(data?.products || data?.data || []);
        setTotalPages(data?.totalPages || 1);
        setTotalItems(data?.totalItems || 0);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, selectedBrand, page, keyword]);

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-primary">Trang chủ</Link> <span className="mx-2">/</span> 
            {keyword ? (
              <span className="text-gray-800 font-medium">Tìm kiếm: "{keyword}"</span>
            ) : (
              <span className="text-gray-800 font-medium">Danh mục sản phẩm</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Lọc */}
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20">
                <h3 className="font-bold text-lg border-b border-gray-100 pb-3 mb-5 text-gray-800">LỌC SẢN PHẨM</h3>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-primary">Thương Hiệu</h4>
                  <ul className="space-y-3">
                    <li>
                      <label className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="radio" 
                            name="brand" 
                            className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                            checked={selectedBrand === null}
                            onChange={() => { setSelectedBrand(null); setPage(1); }}
                          />
                        </div>
                        <span className="ml-3 text-gray-600 group-hover:text-primary transition-colors">Tất cả</span>
                      </label>
                    </li>
                    {brands.map(b => (
                      <li key={b.id}>
                        <label className="flex items-center cursor-pointer group">
                          <div className="relative flex items-center">
                            <input 
                              type="radio" 
                              name="brand" 
                              className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                              checked={selectedBrand === String(b.id) || selectedBrand === b.id}
                              onChange={() => { setSelectedBrand(b.id); setPage(1); }}
                            />
                          </div>
                          <span className="ml-3 text-gray-600 group-hover:text-primary transition-colors">{b.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="w-full md:w-3/4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                <h1 className="text-xl font-bold uppercase text-gray-800">
                  {keyword ? `KẾT QUẢ TÌM KIẾM: "${keyword}"` : "SẢN PHẨM"}
                </h1>
                <span className="text-sm text-gray-500">Hiển thị {products.length} trên tổng {totalItems} sản phẩm</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                  <svg className="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-gray-500 text-lg">
                    {selectedBrand 
                      ? "Chưa có sản phẩm nào phù hợp với điều kiện lọc." 
                      : "Chưa có sản phẩm nào trong danh mục này."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all-300 block">
                        <div className="aspect-[4/5] bg-gray-50 relative flex items-center justify-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover p-4 transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="text-gray-300 flex flex-col items-center">
                              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              <span className="text-xs font-semibold uppercase">No Image</span>
                            </div>
                          )}
                          {product.sale_price && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              SALE
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-800 text-sm mb-3 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                          <div className="flex items-end justify-between mt-auto">
                            <div>
                              {product.sale_price ? (
                                <>
                                  <p className="text-primary font-bold text-lg">{parseInt(product.sale_price).toLocaleString()} ₫</p>
                                  <p className="text-xs text-gray-400 line-through">{parseInt(product.base_price).toLocaleString()} ₫</p>
                                </>
                              ) : (
                                <p className="text-primary font-bold text-lg">{product.base_price ? parseInt(product.base_price).toLocaleString() : 0} ₫</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Phân trang */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 my-10">
                      <button 
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === 1}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium ${page === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-white transition-all-300 shadow-sm hover:shadow-md'}`}
                      >
                        &lt;
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium transition-all-300 shadow-sm ${page === i + 1 ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button 
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === totalPages}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium ${page === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-white transition-all-300 shadow-sm hover:shadow-md'}`}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductListPage;
