import React from 'react';
import { ShieldCheck, Truck, Clock, Award, PhoneCall, MapPin, Mail, HeartHandshake, Database } from 'lucide-react';
import { FirebaseConnectionStatus, FIREBASE_CONFIG } from '../services/firebase';

interface FooterProps {
  connectionStatus?: FirebaseConnectionStatus;
}

export const Footer: React.FC<FooterProps> = ({ connectionStatus }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">100% Chính Hãng</h4>
              <p className="text-xs text-slate-400">Nguồn gốc xuất xứ rõ ràng, chuẩn GPP</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Giao Hỏa Tốc 2H</h4>
              <p className="text-xs text-slate-400">Miễn phí giao hàng đơn từ 300.000đ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Tư Vấn 24/7</h4>
              <p className="text-xs text-slate-400">Đội ngũ Dược sĩ Đại học tận tâm</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Đổi Trả Trong 30 Ngày</h4>
              <p className="text-xs text-slate-400">Bảo vệ quyền lợi sức khỏe tối đa</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                P+
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PharmaCare</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống nhà thuốc tiện lợi và chuỗi phân phối dược phẩm, thực phẩm bảo vệ sức khỏe, thiết bị y tế hàng đầu Việt Nam.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Số 128 Hai Bà Trưng, Phường Đa Kao, Quận 1, TP. HCM</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>cskh@pharmacare.vn</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Danh Mục Thuốc</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer transition-colors">Thuốc Giảm Đau - Hạ Sốt</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Thuốc Trị Ho - Cảm Cúm</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Thuốc Tiêu Hoá - Dạ Dày</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Vitamin & Thực Phẩm Chức Năng</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Dụng Cụ Y Tế & Chăm Sóc Sức Khỏe</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Hỗ Trợ Khách Hàng</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer transition-colors">Hướng dẫn mua thuốc trực tuyến</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Chính sách giao thuốc tận nơi</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Quy định đổi trả thuốc & hoàn tiền</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Kiểm tra tem chống giả & xuất xứ</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật thông tin bệnh án</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Tổng Đài Miễn Cước</h5>
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70">
                <p className="text-[11px] text-slate-400">Tư vấn Dược sĩ & Mua hàng:</p>
                <p className="text-base font-bold text-teal-400">1800 6868</p>
                <p className="text-[10px] text-slate-500">(07:00 - 22:30 mỗi ngày)</p>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70">
                <p className="text-[11px] text-slate-400">Góp ý & Khiếu nại:</p>
                <p className="text-base font-bold text-blue-400">1800 6869</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PharmaCare Vietnam. Giấy phép kinh doanh Dược phẩm số 01/GP-GPP do Sở Y Tế cấp.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Máy chủ Firebase: <strong className="text-sky-300 font-mono">{FIREBASE_CONFIG.projectId}</strong></span>
            {connectionStatus && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                connectionStatus.status === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : connectionStatus.status === 'error'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus.status === 'connected' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}></span>
                {connectionStatus.status === 'connected' ? 'Đã kết nối' : 'Lỗi kết nối'}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

