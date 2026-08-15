import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  Check, 
  ArrowUpDown,
  Sparkles,
  Search
} from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: null, max: null },
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
  { label: '2 - 3.5 triệu', min: 2000000, max: 3500000 },
  { label: 'Trên 3.5 triệu', min: 3500000, max: null }
];

const WEIGHT_OPTIONS = [
  { label: 'Tất cả trọng lượng', value: '' },
  { label: '3U (85 - 89g)', value: '3U' },
  { label: '4U (80 - 84g)', value: '4U' },
  { label: '5U / 6U (75 - 79g)', value: '5U' }
];

// Subcategory Navigation Mapping matching DB navishop
const SUBCATEGORY_GROUPS = {
  // Quần Áo (Parent 13, Children: 6 - Nam, 8 - Nữ)
  apparel: {
    title: 'Phân loại Quần Áo',
    defaultParentId: 13,
    ids: [13, 6, 8],
    options: [
      { id: 13, name: 'Tất cả Quần Áo' },
      { id: 6, name: 'Quần Áo Cầu Lông Nam' },
      { id: 8, name: 'Quần Áo Cầu Lông Nữ' }
    ]
  },
  // Phụ Kiện (Parent 5, Children: 7 - Túi, 9 - Cước, 10 - Tất, 11 - Quấn cán)
  accessories: {
    title: 'Phân loại Phụ Kiện',
    defaultParentId: 5,
    ids: [5, 7, 9, 10, 11],
    options: [
      { id: 5, name: 'Tất cả Phụ Kiện' },
      { id: 7, name: 'Túi Vợt Cầu Lông' },
      { id: 9, name: 'Cước Cầu Lông' },
      { id: 10, name: 'Tất Cầu Lông' },
      { id: 11, name: 'Quấn Cán Cầu Lông' }
    ]
  }
};

const ProductListPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || searchParams.get('q') || searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('Danh Sách Sản Phẩm');

  // Filters State
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedWeight, setSelectedWeight] = useState(searchParams.get('weight') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 12;

  // Determine active subcategory group
  const currentCatIdNum = parseInt(categoryId) || 0;
  const activeSubGroup = Object.values(SUBCATEGORY_GROUPS).find(group => 
    group.ids.includes(currentCatIdNum)
  );

  const isRacketCategory = currentCatIdNum === 1;

  // Fetch Brands List for filter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await productService.getBrands();
        const brandList = Array.isArray(res) ? res : (res?.data || []);
        setBrands(brandList);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBrands();
  }, []);

  // Update Page Title based on category or search keyword
  useEffect(() => {
    if (keyword) {
      setPageTitle(`Kết quả tìm kiếm cho: "${keyword}"`);
    } else if (categoryId) {
      const catMap = {
        '1': 'Vợt Cầu Lông',
        '2': 'Giày Cầu Lông',
        '13': 'Quần Áo Cầu Lông',
        '6': 'Quần Áo Cầu Lông Nam',
        '8': 'Quần Áo Cầu Lông Nữ',
        '5': 'Phụ Kiện Cầu Lông',
        '7': 'Túi Vợt Cầu Lông',
        '9': 'Cước Cầu Lông',
        '10': 'Tất Cầu Lông',
        '11': 'Quấn Cán Cầu Lông'
      };
      setPageTitle(catMap[categoryId] || 'Danh Mục Sản Phẩm');
    } else {
      setPageTitle('Tất Cả Sản Phẩm');
    }
  }, [categoryId, keyword]);

  // Sync URL search params
  useEffect(() => {
    const brandFromUrl = searchParams.get('brand');
    if (brandFromUrl) setSelectedBrand(brandFromUrl);
    setPage(1);
  }, [searchParams]);

  // Fetch Products with active filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          sortBy
        };

        if (keyword) {
          params.keyword = keyword;
        }

        if (categoryId) {
          params.category_id = categoryId;
        }

        if (selectedBrand) {
          params.brand = selectedBrand;
        }

        if (selectedPriceRange.min !== null) {
          params.minPrice = selectedPriceRange.min;
        }
        if (selectedPriceRange.max !== null) {
          params.maxPrice = selectedPriceRange.max;
        }

        const res = await productService.getAllProducts(page, limit, params);
        
        let fetchedProds = [];
        if (Array.isArray(res)) {
          fetchedProds = res;
        } else if (res?.products && Array.isArray(res.products)) {
          fetchedProds = res.products;
          setTotalPages(res.totalPages || Math.ceil((res.total || res.products.length) / limit) || 1);
          setTotalItems(res.total || res.products.length);
        } else if (res?.data && Array.isArray(res.data)) {
          fetchedProds = res.data;
          setTotalPages(res.totalPages || 1);
          setTotalItems(res.total || res.data.length);
        }

        // Apply Client Weight Filter if chosen
        if (selectedWeight) {
          fetchedProds = fetchedProds.filter(p => {
            if (!p.technical_specs) return true;
            const str = typeof p.technical_specs === 'string' ? p.technical_specs : JSON.stringify(p.technical_specs);
            return str.toLowerCase().includes(selectedWeight.toLowerCase());
          });
        }

        setProducts(fetchedProds);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, keyword, selectedBrand, selectedWeight, selectedPriceRange, sortBy, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedBrand('');
    setSelectedWeight('');
    setSelectedPriceRange(PRICE_RANGES[0]);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubCategoryClick = (subId) => {
    window.location.href = `/category/${subId}${selectedBrand ? `?brand=${selectedBrand}` : ''}`;
  };

  const hasActiveFilters = Boolean(selectedBrand) || Boolean(selectedWeight) || selectedPriceRange.min !== null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          {keyword ? (
            <>
              <span className="text-zinc-500 dark:text-zinc-400">Tìm kiếm</span>
              <span>/</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{keyword}"</span>
            </>
          ) : activeSubGroup ? (
            <>
              <Link to={`/category/${activeSubGroup.defaultParentId}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                {activeSubGroup.options[0].name.replace('Tất cả ', '')}
              </Link>
              <span>/</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pageTitle}</span>
            </>
          ) : (
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pageTitle}</span>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Hiển thị {products.length} {keyword ? 'kết quả phù hợp' : 'sản phẩm chính hãng có sẵn tại kho'}
            </p>
          </div>

          {/* Sort & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal size={15} /> Bộ lọc
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-xs">
              <ArrowUpDown size={14} className="text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-transparent outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-[#12131a]">Mới nhất</option>
                <option value="price-asc" className="dark:bg-[#12131a]">Giá: Thấp đến Cao</option>
                <option value="price-desc" className="dark:bg-[#12131a]">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white dark:bg-[#12131a] p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-6 sticky top-28 shadow-xs transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Filter size={15} className="text-[#ea580c]" /> Bộ Lọc Sản Phẩm
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* 1. Subcategory Group Filter */}
            {activeSubGroup && (
              <div className="space-y-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {activeSubGroup.title}
                </h4>
                <div className="space-y-1.5">
                  {activeSubGroup.options.map(opt => {
                    const isSelected = String(categoryId) === String(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSubCategoryClick(opt.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#ea580c] text-white shadow-xs'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Brands Filter */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Thương hiệu</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    checked={!selectedBrand}
                    onChange={() => { setSelectedBrand(''); setPage(1); }}
                    className="accent-[#ea580c]"
                  />
                  <span>Tất cả thương hiệu</span>
                </label>
                {brands.map(b => {
                  const isChecked = Boolean(selectedBrand) && (
                    String(selectedBrand) === String(b.id) || 
                    String(selectedBrand).toLowerCase() === String(b.name).toLowerCase()
                  );
                  return (
                    <label key={b.id} className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        checked={isChecked}
                        onChange={() => { setSelectedBrand(String(b.id)); setPage(1); }}
                        className="accent-[#ea580c]"
                      />
                      <span>{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Weight Filter (Only for Rackets) */}
            {isRacketCategory && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Trọng lượng vợt</h4>
                <div className="space-y-2">
                  {WEIGHT_OPTIONS.map((w, idx) => (
                    <label key={idx} className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="weight"
                        checked={selectedWeight === w.value}
                        onChange={() => { setSelectedWeight(w.value); setPage(1); }}
                        className="accent-[#ea580c]"
                      />
                      <span>{w.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Price Filter */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Mức giá (VNĐ)</h4>
              <div className="space-y-2">
                {PRICE_RANGES.map((range, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange.label === range.label}
                      onChange={() => { setSelectedPriceRange(range); setPage(1); }}
                      className="accent-[#ea580c]"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex justify-end lg:hidden animate-in fade-in duration-200">
              <div className="w-80 bg-white dark:bg-[#12131a] h-full p-6 space-y-6 overflow-y-auto text-zinc-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h3 className="font-bold text-base">Bộ Lọc Sản Phẩm</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-zinc-500 cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                {activeSubGroup && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{activeSubGroup.title}</h4>
                    <div className="space-y-1">
                      {activeSubGroup.options.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            handleSubCategoryClick(opt.id);
                            setIsMobileFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                            String(categoryId) === String(opt.id) ? 'bg-[#ea580c] text-white' : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800'
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Thương hiệu</h4>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 py-1">
                    <input
                      type="radio"
                      name="m_brand"
                      checked={!selectedBrand}
                      onChange={() => { setSelectedBrand(''); setPage(1); setIsMobileFilterOpen(false); }}
                    />
                    <span>Tất cả thương hiệu</span>
                  </label>
                  {brands.map(b => (
                    <label key={b.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 py-1">
                      <input
                        type="radio"
                        name="m_brand"
                        checked={String(selectedBrand) === String(b.id) || String(selectedBrand).toLowerCase() === String(b.name).toLowerCase()}
                        onChange={() => { setSelectedBrand(String(b.id)); setPage(1); setIsMobileFilterOpen(false); }}
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mức giá</h4>
                  {PRICE_RANGES.map((range, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 py-1">
                      <input
                        type="radio"
                        name="m_price"
                        checked={selectedPriceRange.label === range.label}
                        onChange={() => { setSelectedPriceRange(range); setPage(1); setIsMobileFilterOpen(false); }}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Listing Main Area */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Trang trước
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            page === p
                              ? 'bg-[#ea580c] text-white shadow-xs'
                              : 'bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto text-2xl">
                  🏸
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {keyword 
                    ? `Không tìm thấy sản phẩm nào khớp với từ khóa "${keyword}".` 
                    : 'Hiện chưa có sản phẩm nào phù hợp với bộ lọc đã chọn.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-[#c2410c] transition-all cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </main>

        </div>

      </div>
    </MainLayout>
  );
};

export default ProductListPage;
