import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  ShoppingBag,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SheetMeta } from '../types/pharmacy';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sheetMeta?: SheetMeta | null;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
                                                searchQuery,
                                                onSearchChange,
                                              }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const [inputValue, setInputValue] = useState(searchQuery);

  // Synchronize local input state whenever the external searchQuery changes (e.g. filter resets)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(inputValue.trim());

    // Dismiss mobile keyboard
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
  };

  return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top Info Bar (Hotline & Address) */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 text-white text-xs py-1.5 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-[11px] sm:text-xs">
              {/* Hotline */}
              <a
                  href="tel:0386626187"
                  className="flex items-center gap-1.5 font-semibold text-teal-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Dược sĩ: 0386 626 187</span>
              </a>

              <span className="hidden sm:inline text-slate-500">•</span>

              {/* Address */}
              <div className="hidden sm:flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>
                Số 92, Ngõ 98, Nguyễn Hưởng Dung, Phường Thái Thụy, Hưng Yên
              </span>
              </div>
            </div>

            <div className="text-[10px] text-teal-300/80 hidden md:block">
              Kho dược chuẩn GPP • Hơn 8.200 danh mục thuốc
            </div>
          </div>
        </div>

        {/* Main Navbar Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Top Header Row (Logo, Search on Desktop, Cart) */}
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">

            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45" />
              </div>

              <div>
                <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  Pharma
                </span>
                  <span className="text-lg sm:text-xl font-black tracking-tight text-blue-600">
                  Care
                </span>
                </div>
              </div>
            </div>

            {/* Desktop Search Bar (Hidden on mobile, visible on md+) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                      id="search-medicine-input"
                      type="text"
                      placeholder="Tìm tên thuốc, mã SP, hoạt chất (VD: T01963, Bé Ho, Panadol...)"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 outline-none transition-all"
                  />

                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                  {inputValue && (
                      <button
                          id="clear-search-btn"
                          type="button"
                          onClick={handleClear}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Xóa tìm kiếm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                  )}
                </div>

                {/* Desktop Search Submit Button */}
                <button
                    id="search-submit-btn-desktop"
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm kiếm</span>
                </button>
              </form>
            </div>

            {/* Right Actions: Hotline quick icon on mobile + Cart Trigger */}
            <div className="flex items-center gap-2">
              <a
                  href="tel:0386626187"
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 active:bg-teal-100 transition-colors"
                  title="Gọi dược sĩ"
              >
                <Phone className="w-4 h-4" />
              </a>

              <button
                  id="cart-drawer-trigger-btn"
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-1.5 sm:gap-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 transition-all shadow-xs group cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />

                <span className="hidden sm:inline">
                Giỏ hàng
              </span>

                {totalItems > 0 ? (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {totalItems}
                </span>
                ) : (
                    <span className="bg-blue-200 text-blue-800 text-[11px] px-1.5 py-0.5 rounded-full font-medium">
                  0
                </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Dedicated Search Bar (Visible on mobile screens < md) */}
          <div className="md:hidden pb-2.5 pt-0.5">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                    id="search-medicine-input-mobile"
                    type="search"
                    enterKeyHint="search"
                    placeholder="Tìm tên thuốc, mã SP (VD: T01963, Bé Ho...)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />

                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                {inputValue && (
                    <button
                        id="clear-search-btn-mobile"
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                        aria-label="Xóa tìm kiếm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                  id="search-submit-btn-mobile"
                  type="submit"
                  className="flex items-center justify-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-500/25 transition-all shrink-0 cursor-pointer min-h-[36px]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tìm</span>
              </button>
            </form>
          </div>
        </div>
      </header>
  );
};
