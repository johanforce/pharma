import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Link2, Sparkles, Plus, FolderPlus } from 'lucide-react';
import { Product, PharmacyCategory } from '../../types/pharmacy';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../data/initialProducts';
import { uploadImageFile } from '../../services/firebase';

interface ProductFormModalProps {
  product: Product | null; // null means create new
  categories?: PharmacyCategory[] | string[];
  onAddNewCategory?: (name: string) => Promise<void>;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'> | Product) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onAddNewCategory,
  onClose,
  onSave
}) => {
  const isEditing = !!product;

  const categoryList: string[] = categories
    ? categories.map((c) => (typeof c === 'string' ? c : c.name)).filter((c) => c !== 'Tất cả')
    : DEFAULT_CATEGORIES.filter((c) => c !== 'Tất cả');

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(50000);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Hộp');
  const [stock, setStock] = useState<number>(50);
  const [category, setCategory] = useState(categoryList[0] || 'Giảm đau - Hạ sốt');
  const [usage, setUsage] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);

  // Inline Quick Add Category
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price || 0);
      setImageUrl(product.imageUrl || '');
      setDescription(product.description || '');
      setUnit(product.unit || 'Hộp');
      setStock(product.stock || 0);
      setCategory(product.category || categoryList[0] || 'Giảm đau - Hạ sốt');
      setUsage(product.usage || '');
      setManufacturer(product.manufacturer || '');
      setActiveIngredient(product.activeIngredient || '');
      setRequiresPrescription(!!product.requiresPrescription);
    }
  }, [product]);

  const handleQuickAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!quickCategoryName.trim()) return;

    const trimmed = quickCategoryName.trim();
    if (onAddNewCategory) {
      setIsAddingCategory(true);
      try {
        await onAddNewCategory(trimmed);
      } catch (err) {
        console.warn('Quick add category notice:', err);
      } finally {
        setIsAddingCategory(false);
      }
    }
    setCategory(trimmed);
    setQuickCategoryName('');
    setShowQuickAddCategory(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const downloadUrl = await uploadImageFile(file);
      setImageUrl(downloadUrl);
    } catch (err) {
      console.error('Upload error', err);
      alert('Không thể upload ảnh. Vui lòng kiểm tra lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập tên thuốc';
    if (!price || price <= 0) errs.price = 'Giá bán phải lớn hơn 0 VNĐ';
    if (!unit.trim()) errs.unit = 'Vui lòng chọn hoặc nhập đơn vị tính';
    if (!description.trim()) errs.description = 'Vui lòng nhập mô tả công dụng của thuốc';
    if (!imageUrl.trim()) errs.imageUrl = 'Vui lòng cung cấp ảnh sản phẩm';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const productPayload = {
        name: name.trim(),
        price: Number(price),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        unit: unit.trim(),
        stock: Number(stock) || 0,
        category,
        usage: usage.trim(),
        manufacturer: manufacturer.trim(),
        activeIngredient: activeIngredient.trim(),
        requiresPrescription
      };

      if (isEditing && product) {
        await onSave({ ...productPayload, id: product.id });
      } else {
        await onSave(productPayload);
      }
      onClose();
    } catch (err) {
      console.error('Save product error:', err);
      alert('Không thể lưu sản phẩm. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="product-form-modal"
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? 'Chỉnh Sửa Thông Tin Thuốc' : 'Thêm Thuốc Mới Vào Kho'}
            </h3>
            <p className="text-xs text-slate-500">
              Dữ liệu sẽ được lưu trực tiếp vào Firestore Collection: <span className="font-mono text-blue-600">products</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên thuốc / Dược phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              id="product-form-name"
              type="text"
              required
              placeholder="VD: Panadol Extra Giảm Đau Hạ Sốt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Unit & Stock & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Danh mục <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddCategory(!showQuickAddCategory)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showQuickAddCategory ? 'Chọn có sẵn' : 'Thêm mới'}</span>
                </button>
              </div>

              {showQuickAddCategory ? (
                <div className="flex gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục mới..."
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs text-slate-900 bg-white border border-blue-400 focus:border-blue-600 rounded-xl outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={!quickCategoryName.trim() || isAddingCategory}
                    onClick={handleQuickAddCategory}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Thêm
                  </button>
                </div>
              ) : (
                <select
                  id="product-form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
                >
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {/* If product has custom category not yet in list */}
                  {category && !categoryList.includes(category) && (
                    <option value={category}>{category}</option>
                  )}
                </select>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá tiền (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-form-price"
                type="number"
                min="0"
                step="1000"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-mono"
              />
              {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị tính <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={['Hộp', 'Vỉ', 'Chai', 'Tuýp', 'Gói', 'Lọ', 'Cái'].includes(unit) ? unit : 'Khác'}
                  onChange={(e) => {
                    if (e.target.value !== 'Khác') setUnit(e.target.value);
                  }}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Hộp">Hộp</option>
                  <option value="Vỉ">Vỉ</option>
                  <option value="Chai">Chai</option>
                  <option value="Tuýp">Tuýp</option>
                  <option value="Gói">Gói</option>
                  <option value="Lọ">Lọ</option>
                  <option value="Cái">Cái</option>
                  <option value="Khác">Khác (nhập tay)</option>
                </select>
                <input
                  id="product-form-unit"
                  type="text"
                  placeholder="Đơn vị"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượng tồn kho <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-form-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          {/* Active Ingredient & Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hoạt chất chính
              </label>
              <input
                type="text"
                placeholder="VD: Paracetamol 500mg"
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hãng sản xuất / Xuất xứ
              </label>
              <input
                type="text"
                placeholder="VD: Dược Hậu Giang / DHG Pharma"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Image Upload & URL */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Hình ảnh sản phẩm (Firebase Storage / URL) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImageUploadType('url')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    imageUploadType === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Link ảnh URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadType('file')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    imageUploadType === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Tải file ảnh lên
                </button>
              </div>
            </div>

            {imageUploadType === 'url' ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="product-image-url-input"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-white text-slate-600 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">Đang upload ảnh lên Firebase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-semibold">Chọn file ảnh từ máy tính (JPG, PNG, WEBP)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Live Image Preview */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] text-slate-500 truncate flex-1">
                  <span className="font-semibold text-emerald-600 block">✓ Ảnh đã sẵn sàng</span>
                  <span className="truncate block font-mono text-[10px]">{imageUrl}</span>
                </div>
              </div>
            )}
            {errors.imageUrl && <p className="text-[11px] text-rose-500">{errors.imageUrl}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả & Công dụng chính <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="product-form-description"
              rows={3}
              required
              placeholder="Mô tả công dụng, đối tượng chỉ định..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
            />
            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Usage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cách dùng & Liều lượng
            </label>
            <textarea
              rows={2}
              placeholder="VD: Người lớn uống 1-2 viên sau ăn, ngày 2 lần..."
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
            />
          </div>

          {/* Requires Prescription */}
          <div className="flex items-center gap-2 pt-2">
            <input
              id="product-requires-rx"
              type="checkbox"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="product-requires-rx" className="text-xs text-slate-700 font-medium cursor-pointer">
              Thuốc kê đơn (Cần chỉ định hoặc đơn thuốc của bác sĩ)
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            id="save-product-submit-btn"
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:bg-slate-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu vào Firestore...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'LƯU THAY ĐỔI' : 'THÊM THUỐC VÀO KHO'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
