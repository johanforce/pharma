import React, { useState } from 'react';
import {
    Database,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    ShieldCheck,
    ServerOff
} from 'lucide-react';
import { useFirebaseConnection } from '../context/FirebaseConnectionContext';

interface FirebaseStatusBadgeProps {
    className?: string;
    variant?: 'compact' | 'detailed';
}

export const FirebaseStatusBadge: React.FC<FirebaseStatusBadgeProps> = ({
                                                                            className = '',
                                                                            variant = 'compact'
                                                                        }) => {
    const {
        status,
        isConnected,
        projectId,
        ordersCount,
        latencyMs,
        lastChecked,
        errorMessage,
        isChecking,
        checkConnection
    } = useFirebaseConnection();

    const [isOpen, setIsOpen] = useState(false);

    // Status colors & icons
    const isGreen = status === 'connected' && isConnected;
    const isRed = status === 'error' || (!isConnected && status !== 'checking');
    const isCheckingState = status === 'checking' || isChecking;

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Interactive Status Pill Button */}
            <button
                id="firebase-status-badge-btn"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    isGreen
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/90'
                        : isRed
                            ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100/90 animate-pulse'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                title="Nhấn để xem chi tiết kết nối Firebase Firestore"
                aria-expanded={isOpen}
            >
                {/* Pulsing indicator dot */}
                <span className="relative flex h-2.5 w-2.5">
          {isGreen && (
              <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
          )}
                    {isRed && (
                        <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                        </>
                    )}
                    {isCheckingState && (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse"></span>
                    )}
        </span>

                {/* Status Label */}
                <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 opacity-75" />
                    <span className="font-bold">
            {isGreen && 'Firebase: Xanh'}
                        {isRed && 'Firebase: Đỏ (Lỗi)'}
                        {isCheckingState && 'Kiểm tra Firebase...'}
          </span>
                </div>

                {/* Small subtle counter badge if green */}
                {isGreen && ordersCount > 0 && variant === 'detailed' && (
                    <span className="hidden sm:inline-block bg-emerald-200/80 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
            {ordersCount} đơn thực
          </span>
                )}
            </button>

            {/* Popover / Dropdown Details Modal */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-4 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                    isGreen ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                    {isGreen ? <CheckCircle2 className="w-4 h-4" /> : <ServerOff className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">Trạng Thái Kết Nối Firebase</h4>
                                    <p className="text-[11px] text-slate-500">Cơ sở dữ liệu Firestore trực tiếp</p>
                                </div>
                            </div>

                            {/* Status pill */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isGreen
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                {isGreen ? 'BÁO XANH (ONLINE)' : 'BÁO ĐỎ (MẤT KẾT NỐI)'}
              </span>
                        </div>

                        {/* Diagnostic Details */}
                        <div className="py-3 space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Dự án Firebase (Project ID):</span>
                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {projectId}
                </span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Đơn hàng thực tế trong DB:</span>
                                <span className="font-bold text-slate-900">
                  {isGreen ? `${ordersCount} đơn hàng` : '0 đơn (ngưng tải)'}
                </span>
                            </div>

                            {latencyMs !== undefined && (
                                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Độ trễ phản hồi (Latency):</span>
                                    <span className="font-mono font-medium text-emerald-600">
                    {latencyMs} ms
                  </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Lần kiểm tra cuối:</span>
                                <span className="text-slate-600">{lastChecked}</span>
                            </div>

                            {/* Policy: NO FAKE DATA */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>Chính sách dữ liệu thực tế (Zero Fake Data)</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    Hệ thống kết nối trực tiếp đến Firestore <span className="font-mono font-semibold">{projectId}</span>.
                                    Tuyệt đối không sử dụng dữ liệu giả lập/mẫu. Nếu mất kết nối, hệ thống sẽ báo đỏ và tạm ngưng xử lý để bảo vệ toàn vẹn dữ liệu.
                                </p>
                            </div>

                            {/* Error details if red */}
                            {isRed && errorMessage && (
                                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        <span>Chi tiết lỗi kết nối:</span>
                                    </div>
                                    <p className="font-mono text-[10px] break-words">{errorMessage}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer action button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                                id="firebase-recheck-ping-btn"
                                type="button"
                                onClick={() => checkConnection()}
                                disabled={isChecking}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                                <span>{isChecking ? 'Đang ping Firestore...' : 'Kiểm tra lại kết nối (Ping)'}</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
