import React from 'react';
import { Pill, Phone, MapPin, Mail, FileSpreadsheet, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { SheetMeta } from '../types/pharmacy';

interface FooterProps {
  sheetMeta: SheetMeta | null;
}

export const Footer: React.FC<FooterProps> = ({ sheetMeta }) => {
  return (
      <footer className="bg-slate-900 text-slate-300 text-xs mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand & Intro */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Pill className="w-4 h-4 -rotate-45" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">PharmaCare</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hệ thống cung ứng dược phẩm và chăm sóc sức khỏe trực tuyến, vận hành cơ sở dữ liệu đồng bộ trực tiếp với Google Sheets với hơn 8.200 danh mục thuốc đạt chuẩn.
              </p>
              <div className="flex items-center gap-1.5 text-teal-400 text-[11px] font-medium pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Dược phẩm chính hãng 100%</span>
              </div>
            </div>

            {/* Col 2: Liên hệ & Nhà thuốc */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm tracking-wide">Thông tin liên hệ</h4>
              <ul className="space-y-2.5 text-slate-400 text-[11px]">
                <li className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                  Hotline Dược sĩ: <strong className="text-white">0386 626 187</strong> (Tư vấn 24/7)
                </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Số 92, Ngõ 98, Nguyễn Hưởng Dung, Phường Thái Thụy, Hưng Yên</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>contact@pharmacare.vn</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Cơ sở dữ liệu Google Sheets */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Cơ sở dữ liệu Trang Tính</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ứng dụng quản lý danh mục thuốc trực tiếp từ Google Sheets, không dùng cơ sở dữ liệu trung gian, phân trang chuẩn 40 sản phẩm/trang.
              </p>
            </div>

            {/* Col 4: Cam kết chuyên môn */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm tracking-wide">Cam kết nhà thuốc</h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li className="flex items-center gap-2">✓ Tư vấn đúng liều lượng chỉ định</li>
                <li className="flex items-center gap-2">✓ Đóng gói kín đáo, giao thuốc nhanh</li>
                <li className="flex items-center gap-2">✓ Cập nhật giá & hàng tồn theo thời gian thực</li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              © {new Date().getFullYear()} PharmaCare. Dữ liệu quản lý bởi Google Sheets (GID 1574232058).
            </div>
            <div className="flex items-center gap-1">
              <span>Được xây dựng với</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>tại Hưng Yên, Việt Nam</span>
            </div>
          </div>
        </div>
      </footer>
  );
};
