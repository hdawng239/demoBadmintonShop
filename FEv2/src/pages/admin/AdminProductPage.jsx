import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Plus, Image as ImageIcon, Package, X, Check, Search } from 'lucide-react';
import axios from 'axios';

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category_id: '', brand_id: '', base_price: '', description: '', image_url: '', is_active: true,
    length: '', width: '', height: '', weight_g: ''
  });

  // Variant Modal State
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  const [variants, setVariants] = useState([]);
  
  // Variant Form Data
  const defaultVariantForm = { id: null, variant_name: '', stock_quantity: 10, price_modifier: 0, sizeAttr: '', colorAttr: '' };
  const [variantForm, setVariantForm] = useState(defaultVariantForm);

  const openVariantModal = async (product) => {
    setSelectedProductForVariants(product);
    setVariantForm(defaultVariantForm);
    setShowVariantModal(true);
    await fetchVariants(product.id);
  };

  const fetchVariants = async (productId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/variants/product/${productId}`);
      setVariants(res.data.data || res.data || []);
    } catch (err) {
      console.error('Lỗi fetch variants', err);
    }
  };

  const getAttributeKeys = () => {
    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (v.attributes) {
          const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
          const keys = Object.keys(attrs);
          if (keys.length > 0) {
            const sizeKey = keys.find(k => k !== 'Màu sắc') || 'Kích cỡ';
            return { sizeKey, colorKey: 'Màu sắc' };
          }
        }
      }
    }
    if (selectedProductForVariants) {
      const catId = selectedProductForVariants.category_id;
      if (catId === 1) {
        return { sizeKey: 'Trọng lượng', colorKey: 'Màu sắc' };
      }
    }
    return { sizeKey: 'Kích cỡ', colorKey: 'Màu sắc' };
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { sizeKey, colorKey } = getAttributeKeys();
      const attributes = {};
      if (variantForm.sizeAttr) attributes[sizeKey] = variantForm.sizeAttr;
      if (variantForm.colorAttr) attributes[colorKey] = variantForm.colorAttr;
      
      const payload = {
        product_id: selectedProductForVariants.id,
        variant_name: variantForm.variant_name || [variantForm.sizeAttr, variantForm.colorAttr].filter(Boolean).join(' - ') || 'Mặc định',
        stock_quantity: variantForm.stock_quantity,
        price_modifier: variantForm.price_modifier,
        attributes: Object.keys(attributes).length > 0 ? attributes : null
      };

      if (variantForm.id) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/variants/${variantForm.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/variants`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setVariantForm(defaultVariantForm);
      fetchVariants(selectedProductForVariants.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu phân loại');
    }
  };

  const handleEditVariantClick = (v) => {
    const { sizeKey, colorKey } = getAttributeKeys();
    let sizeAttr = '';
    let colorAttr = '';
    if (v.attributes) {
      const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
      sizeAttr = attrs[sizeKey] || attrs['Kích cỡ'] || attrs['Size'] || attrs['Trọng lượng'] || '';
      colorAttr = attrs[colorKey] || attrs['Màu sắc'] || '';
    }
    setVariantForm({
      id: v.id,
      variant_name: v.variant_name,
      stock_quantity: v.stock_quantity,
      price_modifier: v.price_modifier,
      sizeAttr,
      colorAttr
    });
  };

  const handleUpdateVariantStock = async (id, stock_quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/variants/${id}`, {
        stock_quantity: parseInt(stock_quantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVariants(selectedProductForVariants.id);
    } catch (err) {
      alert('Lỗi cập nhật tồn kho');
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!window.confirm('Xóa phân loại này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/variants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVariants(selectedProductForVariants.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa phân loại');
    }
  };

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products?page=${page}&limit=10&keyword=${encodeURIComponent(searchQuery)}&isAdmin=true`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/brands`)
      ]);
      
      const rawProds = Array.isArray(prodRes.data?.data) 
        ? prodRes.data.data 
        : (Array.isArray(prodRes.data?.products) 
          ? prodRes.data.products 
          : (Array.isArray(prodRes.data) ? prodRes.data : []));
      
      setProducts(rawProds);
      const meta = prodRes.data?.meta || prodRes.data?.pagination || {};
      setPagination({
        currentPage: meta.currentPage || page,
        totalPages: meta.totalPages || (rawProds.length > 0 ? Math.ceil((meta.totalItems || rawProds.length) / 10) : 1)
      });
      
      setCategories(catRes.data.data || catRes.data || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(1);
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(currentPage);
    } catch (err) {
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      
      const existingSpecs = editProduct && editProduct.technical_specs 
        ? (typeof editProduct.technical_specs === 'string' ? JSON.parse(editProduct.technical_specs) : editProduct.technical_specs) 
        : {};
        
      payload.technical_specs = {
        ...existingSpecs,
        length: parseInt(payload.length) || 0,
        width: parseInt(payload.width) || 0,
        height: parseInt(payload.height) || 0,
        weight_g: parseInt(payload.weight_g) || 0
      };
      
      delete payload.length;
      delete payload.width;
      delete payload.height;
      delete payload.weight_g;

      if (editProduct) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${editProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchData(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const openAddModal = () => {
    setEditProduct(null);
    setFormData({ 
      name: '', 
      category_id: categories[0]?.id || '', 
      brand_id: brands[0]?.id || '', 
      base_price: '', 
      description: '', 
      image_url: '', 
      is_active: true, 
      length: '', width: '', height: '', weight_g: '' 
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    const specs = typeof product.technical_specs === 'string' ? JSON.parse(product.technical_specs || '{}') : (product.technical_specs || {});
    setFormData({
      name: product.name,
      category_id: product.category_id,
      brand_id: product.brand_id,
      base_price: product.base_price,
      description: product.description || '',
      image_url: product.image_url || '',
      is_active: product.is_active,
      length: specs.length || '',
      width: specs.width || '',
      height: specs.height || '',
      weight_g: specs.weight_g || ''
    });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Danh mục vợt, giày, tồn kho & ma trận phân loại (Variant Matrix).</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={16} /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#ea580c]"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-zinc-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-[#ea580c] transition-colors"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">Ảnh</th>
                    <th className="p-4">Tên sản phẩm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Thương hiệu</th>
                    <th className="p-4 text-right">Giá cơ bản</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center w-36">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="p-4 text-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-12 h-12 object-contain rounded-lg bg-zinc-50 p-1 border border-zinc-100 mx-auto" />
                        ) : (
                          <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 mx-auto"><ImageIcon size={18} /></div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-zinc-900 line-clamp-2">{product.name}</td>
                      <td className="p-4 text-zinc-600">{product.category_name}</td>
                      <td className="p-4 text-zinc-600 font-semibold uppercase">{product.brand_name}</td>
                      <td className="p-4 text-right font-black text-[#ea580c]">
                        {parseInt(product.base_price).toLocaleString()} ₫
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.is_active ? 'bg-lime-50 text-lime-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {product.is_active ? 'Đang bán' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openVariantModal(product)}
                            className="p-2 text-lime-700 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors"
                            title="Quản lý Phân loại & Tồn kho"
                          >
                            <Package size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-zinc-400">Không tìm thấy sản phẩm nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Modal Add / Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="font-bold text-base text-zinc-900">
                {editProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <form id="productForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Tên sản phẩm *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Thương hiệu</label>
                  <select
                    value={formData.brand_id}
                    onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  >
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Giá cơ bản (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    value={formData.base_price}
                    onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Trạng thái bán</label>
                  <select
                    value={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  >
                    <option value="true">Đang bán</option>
                    <option value="false">Ngừng kinh doanh</option>
                  </select>
                </div>

                {/* Shipping dimensions */}
                <div className="md:col-span-2 grid grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="col-span-4 font-bold text-zinc-800">Thông số Vận chuyển (GHN)</div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Dài (cm)</label>
                    <input type="number" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Rộng (cm)</label>
                    <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Cao (cm)</label>
                    <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Trọng lượng (g)</label>
                    <input type="number" value={formData.weight_g} onChange={e => setFormData({ ...formData, weight_g: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">URL Hình ảnh</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Mô tả sản phẩm</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="productForm"
                className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs"
              >
                Lưu sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {showVariantModal && selectedProductForVariants && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Package className="text-[#ea580c]" size={18} />
                Quản lý Phân loại & Tồn kho: {selectedProductForVariants.name}
              </h2>
              <button onClick={() => setShowVariantModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Add/Edit Variant Form */}
              <form onSubmit={handleSubmitVariant} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs">
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block font-bold text-zinc-700 mb-1">Tên Phân Loại</label>
                    <input
                      type="text"
                      value={variantForm.variant_name}
                      onChange={e => setVariantForm({ ...variantForm, variant_name: e.target.value })}
                      placeholder="Tự động ghép nếu để trống"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block font-bold text-zinc-700 mb-1">{getAttributeKeys().sizeKey}</label>
                    <input
                      type="text"
                      value={variantForm.sizeAttr}
                      onChange={e => setVariantForm({ ...variantForm, sizeAttr: e.target.value })}
                      placeholder={getAttributeKeys().sizeKey === 'Trọng lượng' ? '3U, 4U' : '39, 40, L'}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block font-bold text-zinc-700 mb-1">{getAttributeKeys().colorKey}</label>
                    <input
                      type="text"
                      value={variantForm.colorAttr}
                      onChange={e => setVariantForm({ ...variantForm, colorAttr: e.target.value })}
                      placeholder="Đỏ, Xanh"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block font-bold text-zinc-700 mb-1">Cộng giá (₫)</label>
                    <input
                      type="number"
                      required
                      value={variantForm.price_modifier}
                      onChange={e => setVariantForm({ ...variantForm, price_modifier: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block font-bold text-zinc-700 mb-1">Tồn kho</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variantForm.stock_quantity}
                      onChange={e => setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-xl transition-colors shadow-xs"
                  >
                    {variantForm.id ? 'Cập nhật' : 'Thêm'}
                  </button>

                  {variantForm.id && (
                    <button
                      type="button"
                      onClick={() => setVariantForm(defaultVariantForm)}
                      className="px-3 py-2 bg-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-300"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              {/* Variants Table */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Tên phân loại / Thuộc tính</th>
                      <th className="p-3 text-right">Giá cộng thêm</th>
                      <th className="p-3 text-center w-32">Tồn kho</th>
                      <th className="p-3 text-center w-24">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {variants.map(v => {
                      let attrText = '';
                      if (v.attributes) {
                        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
                        attrText = Object.entries(attrs).map(([k, val]) => `${k}: ${val}`).join(' | ');
                      }

                      return (
                        <tr key={v.id} className="hover:bg-zinc-50">
                          <td className="p-3">
                            <div className="font-bold text-zinc-800">{v.variant_name}</div>
                            {attrText && <div className="text-[10px] text-zinc-400 mt-0.5">{attrText}</div>}
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-700">
                            {v.price_modifier > 0 ? '+' : ''}{parseInt(v.price_modifier).toLocaleString()} ₫
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              className="w-16 text-center border border-zinc-200 rounded-lg py-1 px-1.5 font-bold focus:border-[#ea580c] outline-none"
                              defaultValue={v.stock_quantity}
                              onBlur={(e) => {
                                if (e.target.value != v.stock_quantity) {
                                  handleUpdateVariantStock(v.id, e.target.value);
                                }
                              }}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleEditVariantClick(v)}
                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-md"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteVariant(v.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {variants.length === 0 && (
                      <tr><td colSpan="4" className="p-6 text-center text-zinc-400">Chưa có phân loại nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 flex justify-end bg-zinc-50">
              <button
                onClick={() => setShowVariantModal(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductPage;
