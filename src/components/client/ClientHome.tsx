import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  Flame, 
  SlidersHorizontal,
  ChevronRight,
  Stethoscope,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  ExternalLink
} from 'lucide-react';
import { Product, PharmacyCategory } from '../../types/pharmacy';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../data/initialProducts';
import { ProductCard } from '../ProductCard';
import { ProductDetailModal } from '../ProductDetailModal';
import { FirebaseConnectionStatus } from '../../services/firebase';

interface ClientHomeProps {
  products: Product[];
  categories?: PharmacyCategory[] | string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  connectionStatus?: FirebaseConnectionStatus;
  onRetryConnection?: () => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
  products,
  categories,
  searchQuery,
  onSearchChange,
  isLoading,
  connectionStatus,
  onRetryConnection
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categoryList = useMemo(() => {
    if (categories && categories.length > 0) {
      const names = categories.map((c) => (typeof c === 'string' ? c : c.name));
      return ['Tất cả', ...names.filter((n) => n !== 'Tất cả')];
    }
    return DEFAULT_CATEGORIES;
  }, [categories]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.activeIngredient && p.activeIngredient.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'Tất cả') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by in stock
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, selectedCategory, onlyInStock, sortBy]);

  return (
    <div className="space-y-8">
      {/* Hero Banner with Medical Atmosphere */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.25),transparent_70%)]"></div>
        
        <div className="relative px-6 py-10 sm:px-12 sm:py-14 max-w-4xl space-y-5">

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Chăm Sóc Sức Khỏe Gia Đình <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-teal-200 to-white">
              An Tâm - Chính Hãng - Tiện Lợi
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
            Tra cứu và đặt mua hơn 1,000+ loại thuốc thiết yếu, kháng sinh, vitamin và thiết bị y tế chính hãng. Dược sĩ đại học hướng dẫn liều dùng và giao hàng nhanh trong 2 giờ.
          </p>
        </div>
      </section>

      {/* Connection State Alerts */}
      {connectionStatus && connectionStatus.status === 'error' && (
        <section className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-900 shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-rose-900">
                  Không thể kết nối đến máy chủ Firebase ({connectionStatus.projectId})
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-200/70 text-rose-800 font-semibold">
                  Mất kết nối
                </span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                {connectionStatus.errorMessage || 'Lỗi phân quyền Firestore hoặc sự cố kết nối mạng.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onRetryConnection}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Đang thử lại...' : 'Thử kết nối lại ngay'}</span>
                </button>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:text-rose-900 text-xs font-semibold underline"
                >
                  <span>Mở Firebase Console kiểm tra Rules</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills Slider */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-600" /> Danh Mục Dược Phẩm
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredProducts.length} sản phẩm
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryList.map((cat) => {
            const count = cat === 'Tất cả' 
              ? products.length 
              : products.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                id={`category-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters & Sorting Bar */}
      <section className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Filter Display */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Đang lọc theo:</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md">
            {selectedCategory}
          </span>
          {searchQuery && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-medium rounded-md">
              Tìm: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Right: Sort & In-Stock Checkbox */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Chỉ xem thuốc còn hàng</span>
          </label>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="name">Tên thuốc: A → Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : connectionStatus?.status === 'connected' && products.length === 0 ? (
          /* Connected to Firebase but NO products in database */
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-5 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Đã kết nối máy chủ Firebase ({connectionStatus.projectId}) thành công!</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Kho dữ liệu Firebase hiện tại chưa có sản phẩm nào
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Máy chủ <strong>{connectionStatus.projectId}</strong> đã sẵn sàng và đang hoạt động. Bạn có thể sang <strong>Trang Quản Trị</strong> để đăng thuốc mới vào cơ sở dữ liệu.
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Pill className="w-8 h-8 -rotate-45" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Kho dược phẩm chưa có sản phẩm</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Chưa có dữ liệu thuốc được tải lên từ máy chủ. Vui lòng truy cập trang Quản Trị để đăng bài thuốc và cập nhật kho hàng thực tế.
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có thuốc nào khớp với từ khóa "{searchQuery}" trong danh mục "{selectedCategory}". Vui lòng thử tìm kiếm bằng tên hoạt chất hoặc danh mục khác.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setSelectedCategory('Tất cả');
                setOnlyInStock(false);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Xem toàn bộ danh mục thuốc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {connectionStatus && connectionStatus.status === 'connected' && (
              <div className="flex items-center justify-between px-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Dữ liệu trực tiếp từ Firebase (<strong>{connectionStatus.projectId}</strong>): {products.length} sản phẩm
                </span>
                <span className="text-[11px] text-slate-400">
                  Cập nhật: {connectionStatus.lastChecked || 'Vừa xong'}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Prescription Advice & Consultation Box */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-sky-50 via-teal-50 to-blue-50 border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Bạn có đơn thuốc của bác sĩ cần mua hoặc cần tư vấn liều dùng?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Đội ngũ Dược sĩ đại học của PharmaCare sẵn sàng hỗ trợ đọc toa thuốc, kiểm tra tương tác thuốc và chuẩn bị đơn thuốc gửi tận nhà trong vòng 2 giờ.
            </p>
          </div>
        </div>

        <a
          href="tel:18006868"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <PhoneCall className="w-4 h-4 text-teal-300" />
          <span>Gọi Dược Sĩ: 0386 626 187, Địa chỉ: Số 92, Ngõ 98, Nguyễn Hưởng Dung, Phường Thái Thụy, Hưng Yên</span>
        </a>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
