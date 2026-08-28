import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, CheckCircle2, Factory, FileText, AlertTriangle, Plus, Minus, Zap } from 'lucide-react';
import { Product } from '../types/pharmacy';
import { formatVND } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      onClose();
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      onClose();
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="product-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">Mã SP: {product.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square border border-slate-200">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg">
                Đơn vị tính: <strong>{product.unit}</strong>
              </div>
            </div>

            {/* Right Quick Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {product.name}
                </h2>

                {product.activeIngredient && (
                  <p className="text-xs text-blue-700 font-medium mb-3">
                    <span className="text-slate-500">Hoạt chất:</span> {product.activeIngredient}
                  </p>
                )}

                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100/80 mb-4">
                  <div className="text-xs text-slate-500 mb-1">Giá bán niêm yết:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-blue-700">
                      {formatVND(product.price)}
                    </span>
                    <span className="text-xs text-slate-500">/ {product.unit} (Đã gồm VAT)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tình trạng: {isOutOfStock ? <strong className="text-rose-500">Tạm hết hàng</strong> : <strong className="text-emerald-600">Còn hàng ({product.stock} {product.unit})</strong>}</span>
                  </div>
                  {product.manufacturer && (
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Nhà sản xuất: <strong>{product.manufacturer}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-700">Số lượng mua:</span>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-800">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    Thành tiền: <strong className="text-blue-700 text-sm">{formatVND(product.price * quantity)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Indications */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> Công dụng & Mô tả
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {product.description}
              </p>
            </div>

            {product.usage && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Cách dùng & Liều lượng khuyến nghị
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                  {product.usage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>

          {!isOutOfStock ? (
            <>
              <button
                id="modal-add-cart-btn"
                type="button"
                onClick={handleAddToCart}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm vào giỏ</span>
              </button>

              <button
                id="modal-buy-now-btn"
                type="button"
                onClick={handleBuyNow}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-md shadow-blue-500/20 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Mua ngay ({formatVND(product.price * quantity)})</span>
              </button>
            </>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 text-slate-400 cursor-not-allowed"
            >
              Sản phẩm tạm hết hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
