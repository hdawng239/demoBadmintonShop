import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { Camera, Upload, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

const SearchImagePage = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      performSearch(base64);
    };
    reader.readAsDataURL(file);
  };

  const performSearch = async (base64) => {
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await productService.searchByImage(base64);
      setResults(Array.isArray(res) ? res : (res?.products || res?.data || []));
    } catch (err) {
      console.error(err);
      setError('AI không thể nhận diện cây vợt này. Hãy thử chụp ảnh gần hơn hoặc đủ ánh sáng hơn!');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 dark:bg-zinc-800 text-lime-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> AI Visual Search
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Tìm Vợt Bằng Hình Ảnh
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Tải lên ảnh cây vợt hoặc đôi giày bất kỳ bạn thấy trên sân, AI Gemini sẽ tự động nhận diện mẫu mã và tìm sản phẩm tương ứng.
          </p>
        </div>

        {/* Upload Stage */}
        <div className="max-w-2xl mx-auto mb-12">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center bg-white dark:bg-[#12131a] ${
              imagePreview ? 'border-zinc-300 dark:border-zinc-700' : 'border-zinc-300 dark:border-zinc-700 hover:border-[#ea580c] dark:hover:border-[#ea580c] hover:bg-orange-50/20 dark:hover:bg-orange-950/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files?.[0])}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="relative w-64 h-64 bg-zinc-50 dark:bg-[#181a24] rounded-2xl overflow-hidden p-2 border border-zinc-200 dark:border-zinc-700">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                      <RefreshCw size={28} className="animate-spin text-lime-400 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">AI Đang phân tích...</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#ea580c] dark:hover:bg-[#ea580c] transition-colors cursor-pointer"
                >
                  Chọn ảnh khác
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mx-auto">
                  <Camera size={30} className="text-[#ea580c]" />
                </div>
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  Kéo thả ảnh hoặc bấm vào đây để tải ảnh lên
                </h3>
                <p className="text-xs text-zinc-400">Hỗ trợ JPG, PNG, WEBP tối đa 10MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles size={22} className="text-[#ea580c]" /> Sản phẩm AI tìm thấy ({results.length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {results.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default SearchImagePage;
