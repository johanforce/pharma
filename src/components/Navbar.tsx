```tsx
import React from 'react';
import {
  Pill,
  Search,
  ShoppingBag,
  Phone,
  MapPin,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SheetMeta } from '../types/pharmacy';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sheetMeta: SheetMeta | null;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  sheetMeta,
  onRefreshData,
  isRefreshing,
}) => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 text-white text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center flex-wrap gap-4 text-[11px] sm:text-xs">
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
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Pharma
                </span>
                <span className="text-xl font-bold tracking-tight text-blue-600">
                  Care
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <input
                id="search-medicine-input"
                type="text"
                placeholder="Tìm tên thuốc, mã SP (VD: T01963, Mekophar, Ho, Durex, Panadol...)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 outline-none transition-all"
              />

              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              {searchQuery && (
                <button
                  id="clear-search-btn"
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center"
                  aria-label="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cart Action */}
          <div className="flex items-center gap-3">
            <button
              id="cart-drawer-trigger-btn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 transition-all shadow-xs group"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />

              <span className="hidden sm:inline">
                Giỏ hàng
              </span>

              {totalItems > 0 ? (
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
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
      </div>
    </header>
  );
};
```
