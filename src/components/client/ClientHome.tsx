import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  Search,
  Pill,
  FileSpreadsheet,
  Stethoscope,
  PhoneCall,
  CheckCircle2,
  Tag,
  Package,
  Layers,
  Sparkles,
  RotateCcw,
  X,
  ShoppingBag,
} from 'lucide-react';
import { Product, SheetMeta, PaginatedProductsResponse } from '../../types/pharmacy';
import { ProductCard } from '../ProductCard';
import { ProductDetailModal } from '../ProductDetailModal';
import { Pagination } from '../Pagination';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/formatters';

interface ClientHomeProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sheetMeta: SheetMeta | null;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
                                                        searchQuery,
                                                        onSearchChange,
                                                        sheetMeta,
                                                        onRefreshData,
                                                        isRefreshing,
                                                      }) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackaging, setSelectedPackaging] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [packagingsList, setPackagingsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { totalItems: cartTotalItems, totalAmount: cartTotalAmount, setIsCartOpen } = useCart();
  const productGridRef = useRef<HTMLDivElement>(null);

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag, selectedCategory, selectedPackaging, sortBy]);

  // Fetch paginated products from /api/products
  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '40'); // Exactly 40 items per page

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (selectedTag && selectedTag !== 'all') {
        params.set('tag', selectedTag);
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (selectedPackaging && selectedPackaging !== 'all') {
        params.set('packaging', selectedPackaging);
      }
      if (sortBy && sortBy !== 'default') {
        params.set('sort', sortBy);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`API returned ${res.status}: non-json response`);
      }
      const data: PaginatedProductsResponse = await res.json();

      setProducts(data.products || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.tags && data.tags.length > 0) setTagsList(data.tags);
      if (data.categories && data.categories.length > 0) setCategoriesList(data.categories);
      if (data.packagings && data.packagings.length > 0) setPackagingsList(data.packagings);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, searchQuery, selectedTag, selectedCategory, selectedPackaging, sortBy, isRefreshing]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSelectedTag('all');
    setSelectedCategory('all');
    setSelectedPackaging('all');
    setSortBy('default');
    onSearchChange('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
      selectedTag !== 'all' ||
      selectedCategory !== 'all' ||
      selectedPackaging !== 'all' ||
      sortBy !== 'default' ||
      searchQuery.trim().length > 0;

  return (
      <div className="space-y-4 sm:space-y-6">
        {/* Hero Welcome / Google Sheets Integration Banner */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white p-4 sm:p-6 sm:p-8 shadow-xl shadow-blue-900/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-teal-200 border border-white/20">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">Cơ sở dữ liệu: Tab TopThuoc_Data (8.200+ thuốc)</span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                Tra cứu & Mua Dược Phẩm Trực Tuyến
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Hệ thống kết nối trực tiếp với trang tính quản lý hơn <strong>8.200</strong> loại thuốc, kháng sinh, vitamin và thiết bị y tế. Phân trang chuẩn <strong>40 sản phẩm/trang</strong>.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-row md:flex-col gap-2.5 sm:gap-3 shrink-0">
              <div className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center min-w-[100px] sm:min-w-[120px]">
                <div className="text-lg sm:text-2xl font-black text-white">
                  {sheetMeta ? sheetMeta.totalProducts.toLocaleString('vi-VN') : '8.233'}
                </div>
                <div className="text-[10px] sm:text-[11px] text-teal-200 font-medium">Loại thuốc sẵn có</div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Search Banner (Shown when user searched) */}
        {searchQuery.trim() && (
            <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl text-xs text-blue-950 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate text-xs font-medium">
                Kết quả tìm kiếm: <strong className="text-blue-700 font-bold">"{searchQuery.trim()}"</strong>{' '}
                  <span className="text-slate-500">({totalItems.toLocaleString('vi-VN')} loại thuốc)</span>
              </span>
              </div>
              <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 shrink-0 transition-colors cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa tìm</span>
              </button>
            </div>
        )}

        {/* Filter Tabs: Tags & Categories (Mobile Horizontal Scroll, Desktop Wrap) */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-4">
          {/* Tags Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Nhãn phân loại & Chiến dịch:</span>
              </span>
              {hasActiveFilters && (
                  <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] sm:text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Xóa lọc</span>
                  </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
              <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedTag === 'all'
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                Tất cả nhãn
              </button>
              {tagsList.map((tag) => (
                  <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                      className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          selectedTag === tag
                              ? 'bg-rose-600 text-white shadow-xs shadow-rose-500/25'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                  >
                    <span>{tag}</span>
                  </button>
              ))}
            </div>
          </div>

          {/* Categories / Departments Row */}
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nhóm chuyên khoa dược lý:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
              <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === 'all'
                          ? 'bg-teal-700 text-white shadow-xs shadow-teal-700/25'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                Tất cả nhóm
              </button>
              {categoriesList.map((cat) => (
                  <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                      className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedCategory === cat
                              ? 'bg-teal-700 text-white shadow-xs shadow-teal-700/25'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                  >
                    {cat}
                  </button>
              ))}
            </div>
          </div>
        </section>

        {/* Control Bar: Packaging Filter, Sorting & Results Counter */}
        <section
            ref={productGridRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs"
        >
          {/* Left: Summary Counter */}
          <div className="text-xs text-slate-700 font-medium">
            {searchQuery ? (
                <span>
              Kết quả tìm kiếm cho "<strong className="text-blue-600">{searchQuery}</strong>":{' '}
                  <strong className="text-slate-900">{totalItems.toLocaleString('vi-VN')}</strong> thuốc
            </span>
            ) : (
                <span>
              Tìm thấy <strong className="text-blue-700 font-bold">{totalItems.toLocaleString('vi-VN')}</strong> loại thuốc
                  {selectedCategory !== 'all' && (
                      <span> thuộc nhóm <em>{selectedCategory}</em></span>
                  )}
                  {selectedTag !== 'all' && (
                      <span> gắn thẻ <em>{selectedTag}</em></span>
                  )}
            </span>
            )}
          </div>

          {/* Right: Packaging & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Packaging Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <select
                  id="packaging-filter"
                  value={selectedPackaging}
                  onChange={(e) => setSelectedPackaging(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="all">Tất cả dạng bao bì</option>
                {packagingsList.map((p) => (
                    <option key={p} value={p}>
                      Dạng {p}
                    </option>
                ))}
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="default">Sắp xếp: Thứ tự Sheets</option>
                <option value="name-asc">Tên thuốc: A → Z</option>
                <option value="name-desc">Tên thuốc: Z → A</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="id-asc">Mã ID: Tăng dần</option>
                <option value="id-desc">Mã ID: Giảm dần</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Grid (40 medicines per page) */}
        <section>
          {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
                    >
                      <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                ))}
              </div>
          ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Không có thuốc nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Vui lòng thử tìm với từ khóa khác hoặc xóa bộ lọc.
                  </p>
                </div>
                <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Xem toàn bộ danh mục thuốc
                </button>
              </div>
          ) : (
              <div className="space-y-6">
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {products.map((product) => (
                      <ProductCard
                          key={product.id}
                          product={product}
                          onViewDetails={(prod) => setSelectedProduct(prod)}
                      />
                  ))}
                </div>

                {/* Pagination Component: 40 medicines per page */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={40}
                    onPageChange={handlePageChange}
                />
              </div>
          )}
        </section>

        {/* Prescription & Hotline Consultation Section */}
        <section className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-50 via-teal-50 to-blue-50 border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Bạn có đơn thuốc của bác sĩ cần mua hoặc cần tư vấn liều dùng?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed max-w-xl">
                Đội ngũ Dược sĩ của PharmaCare sẵn sàng hỗ trợ đọc toa thuốc, kiểm tra tương tác thuốc và chuẩn bị đơn thuốc gửi tận nơi.
              </p>
            </div>
          </div>
          <a
              href="tel:0386626187"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-teal-300" />
            <span>Gọi Dược Sĩ: 0386 626 187</span>
          </a>
        </section>

        {/* Mobile Sticky Quick Cart Banner (Floating at bottom for mobile shoppers) */}
        {cartTotalItems > 0 && (
            <aside aria-label="Giỏ hàng nhanh" className="fixed bottom-3 inset-x-3 z-30 md:hidden pointer-events-none">
              <div className="pointer-events-auto max-w-md mx-auto bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
                <div className="flex items-center gap-2.5 min-w-0 pl-1">
                  <div className="relative w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-slate-900">
                    {cartTotalItems}
                  </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-slate-100">
                      {cartTotalItems} loại thuốc
                    </div>
                    <div className="text-xs text-teal-300 font-black">
                      {formatVND(cartTotalAmount)}
                    </div>
                  </div>
                </div>
                <button
                    id="mobile-view-cart-floating-btn"
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span>Xem giỏ hàng</span>
                  <span className="text-xs">→</span>
                </button>
              </div>
            </aside>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
        />
      </div>
  );
};
