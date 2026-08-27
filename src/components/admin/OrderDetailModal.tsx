import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  Save, 
  Loader2, 
  FileText,
  Printer
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/pharmacy';
import { formatVND, formatDateVN } from '../../utils/formatters';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus
}) => {
  if (!order) return null;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    setHasChanged(newStatus !== order.status);
  };

  const handleSaveStatus = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, selectedStatus);
      setHasChanged(false);
      onClose();
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'mới':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'đang xử lý':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'đã giao':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'đã hủy':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="order-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Chi Tiết Đơn Hàng #{order.id}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian tạo: {formatDateVN(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Thông Tin Người Mua
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                <p><span className="text-slate-500">Họ tên:</span> <strong>{order.customerName}</strong></p>
                <p>
                  <span className="text-slate-500">Số điện thoại:</span>{' '}
                  <a href={`tel:${order.phone}`} className="font-mono font-bold text-blue-600 hover:underline">
                    {order.phone}
                  </a>
                </p>
                <p><span className="text-slate-500">Thanh toán:</span> {order.paymentMethod === 'banking' ? 'Chuyển khoản QR' : 'Tiền mặt khi nhận (COD)'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> Địa Chỉ Giao Hàng
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed">
                <p>{order.address}</p>
                {order.note && (
                  <p className="mt-2 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 italic">
                    Ghi chú: {order.note}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" /> Danh Sách Thuốc ({order.items.length} mặt hàng)
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tên Thuốc / Dược Phẩm</th>
                    <th className="py-2.5 px-3 text-center">Đơn vị</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{item.unit || 'Hộp'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatVND(item.price)}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                        {formatVND(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50/50 border-t border-slate-200 font-bold">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right text-slate-800">
                      Tổng tiền đơn hàng:
                    </td>
                    <td className="py-3 px-3 text-right text-base text-blue-700">
                      {formatVND(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Update Status Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Cập nhật trạng thái đơn hàng (Firestore Collection: <span className="font-mono text-blue-600">orders</span>)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['mới', 'đang xử lý', 'đã giao', 'đã hủy'] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In toa / đơn</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>

            <button
              id="save-order-status-btn"
              type="button"
              disabled={isUpdating || !hasChanged}
              onClick={handleSaveStatus}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:bg-slate-300"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>LƯU TRẠNG THÁI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
