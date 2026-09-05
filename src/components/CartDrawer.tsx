import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  FileText,
  Truck,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatVND } from '../utils/formatters';
import { Order } from '../types/pharmacy';

interface CartDrawerProps {
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 300000;
  const shippingFee = totalAmount >= freeShippingThreshold || totalAmount === 0 ? 0 : 25000;
  const grandTotal = totalAmount + shippingFee;

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Vui lòng nhập họ và tên của bạn';
    }
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Vui lòng nhập số điện thoại nhận hàng';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      errs.phone = 'Số điện thoại không hợp lệ (VD: 0386626187 hoặc 0912345678)';
    }
    if (!address.trim() || address.trim().length < 5) {
      errs.address = 'Vui lòng nhập địa chỉ nhận hàng chi tiết';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        code: item.product.code,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
        imageUrl: item.product.imageUrl,
      }));

      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
        paymentMethod,
        items: orderItems,
        totalAmount: grandTotal,
        shippingFee,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi gửi đơn hàng');
      }

      const createdOrder: Order = data.order;

      // Save order in local history
      try {
        const existing = JSON.parse(localStorage.getItem('pharmacare_orders_history') || '[]');
        localStorage.setItem('pharmacare_orders_history', JSON.stringify([createdOrder, ...existing]));
      } catch (e) {
        console.error(e);
      }

      // Reset cart and form
      clearCart();
      setIsCartOpen(false);
      setStep('cart');
      setCustomerName('');
      setPhone('');
      setAddress('');
      setNote('');
      setErrors({});

      onOrderSuccess(createdOrder);
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng: ' + (error?.message || 'Vui lòng thử lại!'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {step === 'cart' ? 'Giỏ hàng của bạn' : 'Thông tin nhận thuốc'}
                </h2>
                <p className="text-xs text-slate-500">
                  {step === 'cart'
                      ? `${totalItems} sản phẩm đã chọn`
                      : 'Xác nhận đơn và thông tin giao hàng'}
                </p>
              </div>
            </div>
            <button
                id="close-cart-drawer-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  setStep('cart');
                }}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">Giỏ hàng của bạn đang trống</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Khám phá danh mục hơn 8.200 loại thuốc trên hệ thống và thêm vào giỏ.
                    </p>
                  </div>
                  <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Tiếp tục xem thuốc
                  </button>
                </div>
            ) : step === 'cart' ? (
                <div className="space-y-3">
                  {/* Shipping incentive banner */}
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800 flex items-center justify-between">
                <span>
                  {totalAmount >= freeShippingThreshold ? (
                      <strong className="text-emerald-600">✓ Miễn phí vận chuyển toàn quốc!</strong>
                  ) : (
                      <span>
                      Mua thêm <strong>{formatVND(freeShippingThreshold - totalAmount)}</strong> để
                      được miễn phí giao hàng!
                    </span>
                  )}
                </span>
                    <span className="text-[11px] text-slate-400">Đơn &gt; 300k</span>
                  </div>

                  {/* Items List */}
                  {cart.map((item) => (
                      <div
                          key={item.product.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex gap-3 items-center hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-lg bg-slate-50 shrink-0 border border-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
                            }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {item.product.hasPrice && item.product.price > 0
                                ? `${formatVND(item.product.price)} / ${item.product.unit}`
                                : 'Giá liên hệ'}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                              <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                              <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-blue-700">
                              {item.product.hasPrice && item.product.price > 0
                                  ? formatVND(item.product.price * item.quantity)
                                  : 'Báo giá sau'}
                            </span>
                          </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
                            title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  ))}
                </div>
            ) : (
                /* Checkout Step: Customer Form */
                <form id="order-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl flex items-start gap-2 text-xs text-sky-900">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>
                  Không cần đăng nhập tài khoản. Dược sĩ sẽ liên hệ xác nhận đơn và tư vấn liều dùng trước khi giao thuốc.
                </span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                          id="checkout-name"
                          type="text"
                          placeholder="VD: Nguyễn Văn A"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (errors.customerName) setErrors({ ...errors, customerName: '' });
                          }}
                          className={`w-full pl-9 pr-3 py-2 text-xs text-slate-900 rounded-xl border ${
                              errors.customerName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                          } focus:bg-white focus:border-blue-500 outline-none`}
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.customerName && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.customerName}
                        </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                          id="checkout-phone"
                          type="tel"
                          placeholder="VD: 0386626187"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          className={`w-full pl-9 pr-3 py-2 text-xs text-slate-900 rounded-xl border ${
                              errors.phone ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                          } focus:bg-white focus:border-blue-500 outline-none`}
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.phone && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ giao nhận chi tiết <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                  <textarea
                      id="checkout-address"
                      rows={2}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh thành..."
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors({ ...errors, address: '' });
                      }}
                      className={`w-full pl-9 pr-3 py-2 text-xs text-slate-900 rounded-xl border ${
                          errors.address ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                      } focus:bg-white focus:border-blue-500 outline-none`}
                  />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {errors.address && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.address}
                        </p>
                    )}
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ghi chú cho dược sĩ (Lời dặn hoặc triệu chứng cần tư vấn)
                    </label>
                    <div className="relative">
                      <input
                          id="checkout-note"
                          type="text"
                          placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                      />
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Phương thức thanh toán
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                              paymentMethod === 'cod'
                                  ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold'
                                  : 'border-slate-200 bg-white text-slate-600'
                          }`}
                      >
                        <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Thanh toán khi nhận (COD)</span>
                      </div>

                      <div
                          onClick={() => setPaymentMethod('banking')}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                              paymentMethod === 'banking'
                                  ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold'
                                  : 'border-slate-200 bg-white text-slate-600'
                          }`}
                      >
                        <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Chuyển khoản QR</span>
                      </div>
                    </div>
                  </div>
                </form>
            )}
          </div>

          {/* Footer actions */}
          {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tiền thuốc ({cart.length} món):</span>
                    <span className="font-semibold text-slate-800">{formatVND(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                  ) : (
                      formatVND(shippingFee)
                  )}
                </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Tổng thanh toán:</span>
                    <span className="text-base text-blue-700">{formatVND(grandTotal)}</span>
                  </div>
                </div>

                {step === 'cart' ? (
                    <div className="space-y-2 pt-1">
                      <button
                          id="checkout-step-btn"
                          type="button"
                          onClick={() => setStep('checkout')}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                      >
                        <span>Tiến hành đặt hàng ({formatVND(grandTotal)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                          type="button"
                          onClick={() => setIsCartOpen(false)}
                          className="w-full py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium text-center cursor-pointer"
                      >
                        Tiếp tục chọn thêm thuốc
                      </button>
                    </div>
                ) : (
                    <div className="flex gap-2 pt-1">
                      <button
                          type="button"
                          onClick={() => setStep('cart')}
                          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Quay lại giỏ
                      </button>
                      <button
                          id="submit-order-btn"
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleCheckoutSubmit}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang tạo đơn...</span>
                            </>
                        ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>XÁC NHẬN ĐẶT HÀNG</span>
                            </>
                        )}
                      </button>
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  );
};
