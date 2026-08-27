import React from 'react';
import { ShoppingBag, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product } from '../types/pharmacy';
import { formatVND } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image & Badges */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-blue-700 text-[11px] font-semibold rounded-lg shadow-xs border border-blue-100">
            {product.category || 'Dược phẩm'}
          </span>
        </div>

        {/* Unit badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium rounded-md">
            {product.unit || 'Hộp'}
          </span>
        </div>

        {/* Prescription notice if applicable */}
        {product.requiresPrescription && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/95 text-white text-[10px] font-bold rounded-md shadow-xs">
              <AlertCircle className="w-3 h-3" /> Thuốc Kê Đơn
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Metadata & Price */}
        <div>
          <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 mb-3">
            <div>
              <span className="text-base font-bold text-blue-700">
                {formatVND(product.price)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">/ {product.unit || 'đơn vị'}</span>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-[11px] font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                  Tạm hết hàng
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Còn {product.stock} {product.unit}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`quick-view-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi tiết</span>
            </button>

            <button
              id={`add-to-cart-btn-${product.id}`}
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs hover:shadow-blue-500/20'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Hết hàng' : 'Thêm giỏ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
