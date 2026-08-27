import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatVND } from '../utils/formatters';
import { submitOrder } from '../services/firebase';
import { Order } from '../types/pharmacy';

interface CartDrawerProps {
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, isCartOpen, setIsCartOpen } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 300000;
  const shippingFee = totalAmount >= FREE_SHIPPING_THRESHOLD || totalAmount === 0 ? 0 : 25000;
  const grandTotal = totalAmount + shippingFee;

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errs.customerName = 'Vui lòng nhập họ và tên người nhận';
    }
    if (!phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.replace(/\s+/g, ''))) {
      errs.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }
    if (!address.trim()) {
      errs.address = 'Vui lòng nhập địa chỉ giao hàng chi tiết';
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
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
        imageUrl: item.product.imageUrl
      }));

      const newOrder = await submitOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
        paymentMethod,
        items: orderItems,
        totalAmount: grandTotal
      });

      // Clear cart
      clearCart();
      setIsCartOpen(false);
      setStep('cart');
      
      // Reset form
      setCustomerName('');
      setPhone('');
      setAddress('');
      setNote('');
      setErrors({});

      // Callback to show order success modal with details
      onOrderSuccess(newOrder);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        id="cart-slide-drawer"
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {step === 'cart' ? 'Giỏ hàng của bạn' : 'Thông tin nhận thuốc'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {step === 'cart' ? `${cart.length} loại sản phẩm` : 'Vui lòng điền địa chỉ để nhận thuốc hỏa tốc'}
              </p>
            </div>
          </div>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.length > 0 && (
          <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-800">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              {totalAmount >= FREE_SHIPPING_THRESHOLD ? (
                <span className="font-semibold text-emerald-700">Đơn hàng đủ điều kiện MIỄN PHÍ VẬN CHUYỂN!</span>
              ) : (
                <span>
                  Mua thêm <strong>{formatVND(FREE_SHIPPING_THRESHOLD - totalAmount)}</strong> để được <strong className="text-blue-700">Freeship</strong>
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-blue-600">
              {Math.min(100, Math.round((totalAmount / FREE_SHIPPING_THRESHOLD) * 100))}%
            </span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Giỏ hàng đang trống</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Bạn chưa thêm sản phẩm thuốc hoặc thiết bị y tế nào vào giỏ. Hãy tham khảo các sản phẩm tại nhà thuốc nhé.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                Tiếp tục xem thuốc
              </button>
            </div>
          ) : step === 'cart' ? (
            /* List of Cart Items */
            <div className="space-y-3">
              {cart.map((item) => {
                const itemTotal = item.product.price * item.quantity;
                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex gap-3.5 items-center"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-0.5">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 mb-2">
                        {formatVND(item.product.price)} / {item.product.unit || 'đơn vị'}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity button */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-700">
                            {formatVND(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors self-start"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Checkout Step: Customer Information Form */
            <form id="checkout-order-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl flex items-start gap-2 text-xs text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Không cần đăng nhập tài khoản. Dược sĩ sẽ gọi điện xác nhận và hướng dẫn liều dùng trước khi giao thuốc.</span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên người nhận <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="checkout-name-input"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors({ ...errors, customerName: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 rounded-xl border ${
                      errors.customerName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                    } focus:bg-white focus:border-blue-500 outline-none transition-all`}
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
                  Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    placeholder="Ví dụ: 0983 123 456"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 rounded-xl border ${
                      errors.phone ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                    } focus:bg-white focus:border-blue-500 outline-none transition-all`}
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
                  Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="checkout-address-input"
                    rows={2}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-xs text-slate-900 rounded-xl border ${
                      errors.address ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                    } focus:bg-white focus:border-blue-500 outline-none transition-all`}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú cho dược sĩ (Lời dặn hoặc triệu chứng)
                </label>
                <div className="relative">
                  <input
                    id="checkout-note-input"
                    type="text"
                    placeholder="VD: Giao trước 5h chiều, hoặc tư vấn thêm liều dùng cho bé..."
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
                  <label 
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod' 
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold shadow-xs' 
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>

                  <label 
                    onClick={() => setPaymentMethod('banking')}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'banking' 
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold shadow-xs' 
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="hidden" />
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Chuyển khoản QR / Ngân hàng</span>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer & Action Panel */}
        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tiền thuốc ({cart.length} món):</span>
                <span className="font-semibold text-slate-800">{formatVND(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển giao hàng:</span>
                <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : formatVND(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Tổng thanh toán:</span>
                <span className="text-base text-blue-700">{formatVND(grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            {step === 'cart' ? (
              <div className="space-y-2 pt-2">
                <button
                  id="proceed-to-checkout-btn"
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
                >
                  <span>Tiến hành đặt hàng ({formatVND(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-medium text-center"
                >
                  Mua thêm sản phẩm khác
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Quay lại giỏ
                </button>

                <button
                  id="submit-order-btn"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCheckoutSubmit}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all disabled:bg-slate-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tạo đơn hàng...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>GỬI ĐƠN HÀNG NGAY</span>
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
