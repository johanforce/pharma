import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, PhoneCall, Truck, MapPin, Package, Clock, ShieldCheck, X } from 'lucide-react';
import { Order } from '../types/pharmacy';
import { formatVND, formatDateVN } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  useEffect(() => {
    if (order) {
      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe if confetti not supported
      }
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="order-success-modal"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">ĐẶT HÀNG THÀNH CÔNG!</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Đơn hàng đã được lưu vào hệ thống Firestore (Collection: <span className="underline font-mono">orders</span>)
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Order ID & Status */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Mã Đơn Hàng:</div>
              <div className="text-base font-extrabold text-blue-700 font-mono">{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">Trạng thái:</div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 w-24">Người nhận:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 w-24">Số điện thoại:</span>
              <span className="font-mono font-bold text-blue-700">{order.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-900 w-24 shrink-0">Địa chỉ giao:</span>
              <span className="text-slate-600">{order.address}</span>
            </div>
            {order.note && (
              <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-900 w-24 shrink-0">Ghi chú:</span>
                <span className="text-slate-500 italic">{order.note}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-900 w-24">Thời gian đặt:</span>
              <span className="text-slate-500">{formatDateVN(order.createdAt)}</span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" /> Danh sách thuốc đặt mua ({order.items.length})
            </h4>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatVND(item.price)} × {item.quantity} {item.unit || ''}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Tổng tiền thanh toán:</span>
            <span className="text-lg font-black text-blue-700">{formatVND(order.totalAmount)}</span>
          </div>

          {/* Next Steps Reminder */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
              <span>Dược sĩ PharmaCare sẽ liên hệ sớm nhất:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Chúng tôi sẽ gọi điện thoại tới số <strong>{order.phone}</strong> trong vòng 5 - 15 phút để xác nhận đơn hàng và hướng dẫn bảo quản thuốc.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            id="close-success-modal-btn"
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            Tiếp tục mua sắm thuốc
          </button>
        </div>
      </div>
    </div>
  );
};
