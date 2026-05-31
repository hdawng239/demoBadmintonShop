import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { productService } from '../services/productService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const heroSlides = [
  'https://cdn.shopvnb.com/img/1920x640/uploads/slider/victor-axelsen_1759089349.webp', // Bạn dán link ảnh 1 vào đây
  'https://cdn.shopvnb.com/img/1920x640/uploads/slider/yonex-astrox-99_1757731351.webp', // Bạn dán link ảnh 2 vào đây
  'https://cdn.shopvnb.com/img/1920x640/uploads/slider/grpht-thrttl_1759089897.webp', // Bạn dán link ảnh 3 vào đây
  'https://cdn.shopvnb.com/img/1920x640/uploads/slider/ynx-eclp-banner_1695178004.webp', // Bạn dán link ảnh 4 vào đây
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productService.getAllProducts(1, 8); // Lấy 8 sản phẩm cho trang chủ
      setProducts(data?.products || data?.data || data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <MainLayout>
      {/* Hero Banner Section (Swiper Slider) */}
      <div className="w-full relative">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Trust Badges */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 justify-center border-r border-gray-100 last:border-0">
            <div className="text-primary">🚚</div>
            <div>
              <p className="font-bold text-sm">Vận chuyển TOÀN QUỐC</p>
              <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 justify-center border-r border-gray-100 last:border-0">
            <div className="text-primary">🛡️</div>
            <div>
              <p className="font-bold text-sm">Bảo đảm chất lượng</p>
              <p className="text-xs text-gray-500">Sản phẩm bảo đảm chất lượng</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 justify-center border-r border-gray-100 last:border-0">
            <div className="text-primary">💳</div>
            <div>
              <p className="font-bold text-sm">Tiến hành THANH TOÁN</p>
              <p className="text-xs text-gray-500">Với nhiều PHƯƠNG THỨC</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 justify-center">
            <div className="text-primary">🔄</div>
            <div>
              <p className="font-bold text-sm">Đổi sản phẩm mới</p>
              <p className="text-xs text-gray-500">Nếu sản phẩm lỗi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary uppercase relative inline-block">
            Danh mục sản phẩm
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full"></div>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {/* Categories Blocks */}
          {[
            { id: 1, title: 'VỢT CẦU LÔNG', img: 'https://cdn.shopvnb.com/uploads/san_pham/vot-cau-long-flypower-black-pear-1.webp' },
            { id: 2, title: 'GIÀY CẦU LÔNG', img: 'https://bizweb.dktcdn.net/100/340/361/products/47380a7a1db2e491fbeb54ca864134.jpg?v=1734080412260' },
            { id: 5, title: 'PHỤ KIỆN CẦU LÔNG', img: 'https://bizweb.dktcdn.net/thumb/grande/100/363/770/products/screenshot-1775633316-1775633329842.png?v=1775633332910' },
            { id: 6, title: 'QUẦN ÁO CẦU LÔNG NAM', img: 'https://bizweb.dktcdn.net/100/340/361/products/dsc0527621899fdc6be794af1b4a3a.jpg?v=1772154748650' },
            { id: 7, title: 'TÚI VỢT CẦU LÔNG', img: 'https://shopvnb.com//uploads/san_pham/tui-vot-cau-long-yonex-bag21lcwex-gia-cong-1.webp' },
            { id: 8, title: 'QUẦN ÁO CẦU LÔNG NỮ', img: 'https://cdn.shopvnb.com/uploads/images/vay-cau-long-yonex-01-trang-xanh.webp' },
          ].map((cat, idx) => (
            <Link to={`/category/${cat.id}`} key={idx} className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3] bg-white flex items-center justify-center transition-transform duration-500 hover:scale-105 shadow border border-gray-100 block">
              {cat.img && (
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <div className={`absolute inset-0 transition-colors ${cat.img ? 'bg-black/20 group-hover:bg-black/40' : 'bg-orange-500 group-hover:bg-orange-600'}`}></div>
              <h3 className="relative z-10 text-white font-bold text-lg text-center px-4 drop-shadow-md">
                {cat.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Featured Products List from API */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary uppercase relative inline-block">
            Sản phẩm Mới Nhất
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full"></div>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {products.length > 0 ? products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all-300 block">
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
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      {product.sale_price ? (
                        <>
                          <p className="text-primary font-bold">{parseInt(product.sale_price).toLocaleString()} ₫</p>
                          <p className="text-xs text-gray-400 line-through">{parseInt(product.base_price).toLocaleString()} ₫</p>
                        </>
                      ) : (
                        <p className="text-primary font-bold">{product.base_price ? parseInt(product.base_price).toLocaleString() : 0} ₫</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="col-span-4 text-center text-gray-500 py-10">Chưa có sản phẩm nào trong database.</p>
            )}
          </div>
        )}
      </div>

    </MainLayout>
  );
};

export default HomePage;
