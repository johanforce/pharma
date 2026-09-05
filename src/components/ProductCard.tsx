import React from 'react';
import { ShoppingBag, Eye, Tag, AlertCircle, Package } from 'lucide-react';
import { Product } from '../types/pharmacy';
import { formatVND } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const isOutOfStock = Boolean(product.isOutOfStock || (product.hasStockInfo && product.stock <= 0));
  const hasSpecificStock = Boolean(product.hasSpecificStock && !isOutOfStock && product.stock > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const primaryTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;

  return (
      <div
          id={`product-card-${product.id}`}
          onClick={() => onViewDetails(product)}
          className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
              isOutOfStock
                  ? 'border-rose-200/80 shadow-xs opacity-95'
                  : 'border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-lg'
          }`}
      >
        {/* Product Image & Badges */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
          <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                  isOutOfStock ? 'grayscale-[35%]' : 'group-hover:scale-105'
              }`}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
              }}
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center p-2">
              <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-md border border-rose-400/40 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" /> Hết hàng
              </span>
              </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 max-w-[70%]">
            {primaryTag && (
                <span className="px-2 py-0.5 bg-rose-500/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs inline-flex items-center gap-1 w-fit">
              <Tag className="w-2.5 h-2.5" />
                  {primaryTag.replace('#', '')}
            </span>
            )}
            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-blue-700 text-[10px] font-semibold rounded-md shadow-xs border border-blue-100/80 w-fit truncate">
            {product.category}
          </span>
          </div>

          {/* Unit badge */}
          <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium rounded-md flex items-center gap-1">
            <Package className="w-2.5 h-2.5 text-teal-300" />
            {product.unit}
          </span>
          </div>

          {/* Prescription notice */}
          {product.requiresPrescription && (
              <div className="absolute bottom-2 left-2">
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/95 text-white text-[9px] font-bold rounded-md shadow-xs">
              <AlertCircle className="w-2.5 h-2.5" /> Thuốc Kê Đơn
            </span>
              </div>
          )}
        </div>

        {/* Details & Info */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            {/* Code & Unit */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>Mã: {product.code || `T${product.id}`}</span>
              <span className="text-[10px] font-sans text-slate-500 truncate max-w-[50%]">
              ID: {product.id}
            </span>
            </div>

            {/* Medicine Name */}
            <h3
                className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5 min-h-[2.5rem]"
                title={product.name}
            >
              {product.name}
            </h3>

            {/* Packaging details */}
            <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
              QC: {product.packaging}
            </p>
          </div>

          {/* Bottom Price & Stock */}
          <div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mb-2.5 min-h-[32px]">
              <div>
                {product.hasPrice && product.price > 0 ? (
                    <div className="flex items-baseline">
                    <span className="text-sm sm:text-base font-bold text-blue-700">
                      {formatVND(product.price)}
                    </span>
                      <span className="text-[10px] text-slate-400 ml-1">/ {product.unit}</span>
                    </div>
                ) : (
                    <span className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                    Giá liên hệ
                  </span>
                )}
              </div>

              {/* Stock View:
                  - nếu có thì ghi ra (ví dụ: Còn {stock} {unit})
                  - nếu hết hàng thì ghi "Hết hàng" trạng thái view màu đỏ
                  - ko có thông tin thì ko ghi gì cả (null)
              */}
              <div className="text-right">
                {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                    Hết hàng
                  </span>
                ) : hasSpecificStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    Còn {product.stock} {product.unit}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                  id={`view-btn-${product.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(product);
                  }}
                  className="flex items-center justify-center gap-1 min-h-[36px] py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Xem</span>
              </button>
              <button
                  id={`add-btn-${product.id}`}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-1 min-h-[36px] py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isOutOfStock
                          ? 'bg-rose-50 text-rose-400 border border-rose-200 cursor-not-allowed'
                          : product.hasPrice
                              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs active:scale-95'
                              : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs active:scale-95'
                  }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Hết hàng' : product.hasPrice ? 'Thêm giỏ' : 'Tư vấn'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};
