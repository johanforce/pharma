import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Zap,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Minus,
  ExternalLink,
  Package,
  Tag,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
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
            <div className="flex items-center flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
              {product.category}
            </span>
              <span className="text-xs text-slate-500 font-mono font-medium">Mã SP: {product.code}</span>
              <span className="text-xs text-slate-400 font-mono">ID: {product.id}</span>
            </div>
            <button
                id="close-product-modal-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square border border-slate-200">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
                    }}
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-teal-300" />
                  <span>Đơn vị: <strong>{product.unit}</strong></span>
                </div>
              </div>

              {/* Quick Info & Price */}
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                    {product.name}
                  </h2>

                  {/* Packaging */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 mb-3">
                    <span className="font-semibold text-slate-500">Quy cách đóng gói:</span>{' '}
                    <span className="font-medium text-slate-900">{product.packaging}</span>
                  </div>

                  {/* Price Display */}
                  <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100/80 mb-4">
                    <div className="text-xs text-slate-500 mb-0.5">Giá niêm yết hệ thống:</div>
                    <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-blue-700">
                      {formatVND(product.price)}
                    </span>
                      <span className="text-xs text-slate-500">/ {product.unit} (Đã gồm VAT)</span>
                    </div>
                  </div>

                  {/* Stock & Prescription */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                      Tình trạng kho:{' '}
                        {isOutOfStock ? (
                            <strong className="text-rose-500">Tạm hết hàng</strong>
                        ) : (
                            <strong className="text-emerald-700">
                              Còn hàng ({product.stock} {product.unit})
                            </strong>
                        )}
                    </span>
                    </div>

                    {product.requiresPrescription && (
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Thuốc kê đơn: Cần có đơn của bác sĩ khi mua trực tiếp.</span>
                        </div>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {product.tags.map((t, idx) => (
                              <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] font-semibold rounded-md border border-rose-100 flex items-center gap-1"
                              >
                          <Tag className="w-2.5 h-2.5" />
                                {t}
                        </span>
                          ))}
                        </div>
                    )}
                  </div>
                </div>

                {/* Quantity selector */}
                {!isOutOfStock && (
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-700">Số lượng đặt:</span>
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button
                              type="button"
                              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold text-sm text-slate-800">
                        {quantity}
                      </span>
                          <button
                              type="button"
                              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        Tạm tính:{' '}
                        <strong className="text-blue-700 text-sm">
                          {formatVND(product.price * quantity)}
                        </strong>
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* Description & Indications */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Thông tin & Quy cách
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {product.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Hướng dẫn sử dụng & Bảo quản
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {product.usage} Bảo quản nơi khô ráo, thoáng mát, nhiệt độ dưới 30°C, tránh ánh nắng trực tiếp và xa tầm tay trẻ em.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <a
                href="tel:0386626187"
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>Tư vấn: 0386 626 187</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              {!isOutOfStock ? (
                  <>
                    <button
                        id="modal-add-cart-btn"
                        type="button"
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Thêm giỏ</span>
                    </button>
                    <button
                        id="modal-buy-now-btn"
                        type="button"
                        onClick={handleBuyNow}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
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
      </div>
  );
};
