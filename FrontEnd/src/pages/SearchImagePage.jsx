import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { productService } from '../services/productService';
import { Camera, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

const SearchImagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sourceImage, setSourceImage] = useState(location.state?.image || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page for a simple layout

  const fileInputRef = useRef(null);

  const performSearch = async (base64Image) => {
    if (!base64Image) return;
    setLoading(true);
    setError(null);
    setProducts([]);
    setCurrentPage(1);

    try {
      const results = await productService.searchByImage(base64Image);
      setProducts(results || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm hình ảnh:", err);
      setError("Không thể kết nối hoặc phân tích hình ảnh này bằng AI. Vui lòng thử lại với ảnh sản phẩm rõ nét hơn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sourceImage) {
      performSearch(sourceImage);
    }
  }, [sourceImage]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceImage(reader.result);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Pagination calculations
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .animate-scan-line {
          animation: scanLine 3s infinite linear;
        }
        @keyframes customPulse {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.9; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        .animate-custom-pulse {
          animation: customPulse 2.5s infinite ease-in-out;
        }
      `}</style>

      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">Tìm kiếm bằng hình ảnh</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side: Source image preview & upload */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sticky top-24">
                <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  HÌNH ẢNH TÌM KIẾM
                </h2>

                {sourceImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square flex items-center justify-center">
                      <img
                        src={sourceImage}
                        alt="Hình ảnh gốc"
                        className="max-h-full max-w-full object-contain p-2"
                      />
                    </div>

                    <button
                      onClick={handleUploadClick}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Chọn hình ảnh khác
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-gray-50 hover:bg-primary/5 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300">
                      <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                    </div>
                    <p className="font-semibold text-gray-700 group-hover:text-primary mb-1 text-center transition-all duration-300">
                      Tải ảnh lên để tìm kiếm
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      Hỗ trợ định dạng JPG, PNG, WEBP
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Right side: Matches results */}
            <div className="w-full lg:w-2/3">
              {/* Header section */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold uppercase text-gray-800 tracking-tight">
                    Kết Quả Đối Chiếu
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {loading
                      ? "AI đang tiến hành nhận diện đặc trưng ảnh..."
                      : `Tìm thấy ${totalItems} sản phẩm tương tự`}
                  </p>
                </div>
                {!loading && products.length > 0 && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    Đối chiếu hoàn tất
                  </span>
                )}
              </div>

              {/* AI Loading scanning state */}
              {loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 px-6 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary animate-custom-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Đang tìm kiếm sản phẩm...</h3>
                  <p className="text-sm text-gray-500 max-w-sm text-center leading-relaxed">
                    Đang giải mã đặc trưng màu sắc, chi tiết logo và so khớp với danh mục sản phẩm của Naro Shop. Vui lòng đợi trong giây lát.
                  </p>
                </div>
              )}

              {/* Error boundary */}
              {!loading && error && (
                <div className="bg-red-50 border border-red-150 rounded-2xl p-6 flex items-start gap-4 mb-6">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Đã xảy ra lỗi</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={() => performSearch(sourceImage)}
                      className="mt-3 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      Thử quét lại
                    </button>
                  </div>
                </div>
              )}

              {/* Zero matches */}
              {!loading && !error && sourceImage && products.length === 0 && (
                <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa tìm thấy sản phẩm phù hợp</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                    Rất tiếc, chúng tôi không tìm thấy sản phẩm nào trong kho hàng tương ứng với hình ảnh này. Hãy thử sử dụng ảnh có độ sáng tốt hơn hoặc thay đổi góc chụp.
                  </p>
                </div>
              )}

              {/* Empty state instruction */}
              {!loading && !sourceImage && (
                <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Sẵn sàng tìm kiếm bằng hình ảnh</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                    Hãy tải ảnh sản phẩm bạn quan tâm để AI tự động trích xuất các sản phẩm tương tự đang có sẵn tại shop.
                  </p>
                  <button
                    onClick={handleUploadClick}
                    className="py-3 px-6 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl inline-flex items-center gap-2 transition-all duration-300 shadow-md shadow-primary/20"
                  >
                    Tải hình ảnh lên
                  </button>
                </div>
              )}

              {/* Results grid list */}
              {!loading && products.length > 0 && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {paginatedProducts.map((product) => (
                      <Link
                        to={`/product/${product.id}`}
                        key={product.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                      >
                        <div className="aspect-[4/5] bg-gray-50 relative flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover p-4 transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="text-gray-300 flex flex-col items-center">
                              <ImageIcon className="w-12 h-12 mb-2" />
                              <span className="text-xs font-semibold uppercase">No Image</span>
                            </div>
                          )}
                          {product.sale_price && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                              SALE
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                            {product.brand_name || 'Naro Shop'}
                          </span>
                          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">
                            {product.name}
                          </h3>
                          <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100">
                            <div>
                              {product.sale_price ? (
                                <>
                                  <p className="text-primary font-bold text-base">{parseInt(product.sale_price).toLocaleString()} ₫</p>
                                  <p className="text-xs text-gray-400 line-through">{parseInt(product.base_price).toLocaleString()} ₫</p>
                                </>
                              ) : (
                                <p className="text-primary font-bold text-base">
                                  {product.base_price ? parseInt(product.base_price).toLocaleString() : 0} ₫
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Local pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 my-10">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'}`}
                      >
                        &lt;
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium transition-all duration-300 shadow-sm ${currentPage === i + 1 ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'}`}
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

export default SearchImagePage;
