import React from 'react';
import {
  CheckCircle,
  Package,
  Phone,
  MapPin,
  Calendar,
  X,
  Printer,
  Copy,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { Order } from '../types/pharmacy';
import { formatVND, formatDate } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    alert(`Đã sao chép mã đơn hàng: ${order.id}`);
  };

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div
            id="order-success-modal"
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 text-center relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Dược sĩ chuyên môn sẽ liên hệ số <strong>{order.phone}</strong> trong vòng 15-30 phút để xác nhận đơn.
            </p>
          </div>

          {/* Order Details Body */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
            {/* Order Code & Date */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Mã đơn hàng:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-base text-slate-900">{order.id}</span>
                  <button
                      type="button"
                      onClick={copyOrderId}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                      title="Sao chép mã đơn"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Thời gian đặt:</span>
                <span className="font-medium text-slate-800">{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Thông tin giao nhận
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Khách hàng:</span>{' '}
                  <strong className="text-slate-800">{order.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>{' '}
                  <strong className="text-slate-800">{order.phone}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Địa chỉ:</span>{' '}
                  <span className="text-slate-800 font-medium">{order.address}</span>
                </div>
                {order.note && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Ghi chú:</span>{' '}
                      <span className="italic text-slate-700">{order.note}</span>
                    </div>
                )}
              </div>
            </div>

            {/* Payment Method / Banking Info */}
            {order.paymentMethod === 'banking' ? (
                <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200 space-y-2">
                  <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-teal-700" /> Thông tin thanh toán chuyển khoản
                  </h4>
                  <p className="text-[11px] text-teal-800">
                    Quý khách có thể chuyển khoản số tiền <strong>{formatVND(order.totalAmount)}</strong> theo thông tin sau:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-1 font-mono text-[11px]">
                    <div>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></div>
                    <div>Số tài khoản: <strong>0386626187</strong></div>
                    <div>Chủ tài khoản: <strong>PHARMACARE HƯNG YÊN</strong></div>
                    <div>Nội dung CK: <strong>{order.id} {order.phone}</strong></div>
                  </div>
                </div>
            ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-[11px] text-slate-700">
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Phương thức thanh toán: <strong>Thu tiền khi nhận hàng (COD)</strong></span>
                </div>
            )}

            {/* Ordered Products List */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" /> Danh sách sản phẩm ({order.items.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {order.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-white">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatVND(item.price)} x {item.quantity} {item.unit}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                    {formatVND(item.price * item.quantity)}
                  </span>
                    </div>
                ))}
                <div className="p-3 bg-slate-50 flex justify-between items-center font-bold text-sm text-slate-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-base text-blue-700">{formatVND(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Contact Support Hotline */}
            <div className="p-3 bg-slate-100 rounded-xl text-center text-slate-600 text-[11px] space-y-1">
              <p>Mọi thắc mắc hoặc cần sửa đổi đơn hàng, quý khách vui lòng gọi ngay:</p>
              <a
                  href="tel:0386626187"
                  className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> 0386 626 187 (Dược sĩ hỗ trợ 24/7)
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hóa đơn</span>
            </button>
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Hoàn tất & Tiếp tục mua thuốc
            </button>
          </div>
        </div>
      </div>
  );
};
