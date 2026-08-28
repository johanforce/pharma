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
        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                P+
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PharmaCare</span>
            </div>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Số 92, Ngõ 98, Nguyễn Hưởng Dung, Phường Thái Thụy, Hưng Yên</span>
              </div>
              <a href="tel:0386626187" className="flex items-center gap-2 hover:text-white transition-colors">
                <PhoneCall className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>0386 626 187</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
