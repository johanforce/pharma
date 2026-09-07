import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, ServerOff, ShieldAlert } from 'lucide-react';
import { useFirebaseConnection } from '../context/FirebaseConnectionContext';

export const FirebaseStatusBanner: React.FC = () => {
    const { status, isConnected, projectId, errorMessage, isChecking, checkConnection } = useFirebaseConnection();

    const isRed = status === 'error' || (!isConnected && status !== 'checking');

    // If connected (Green), we don't need a huge intrusive banner, the badge in Navbar & Admin is enough,
    // but if it's RED, we render a prominent, unmissable alert.
    if (!isRed) {
        return null;
    }

    return (
        <div
            id="firebase-disconnected-banner"
            className="bg-rose-600 text-white px-4 py-3 border-b border-rose-700 shadow-md animate-in slide-in-from-top duration-200"
        >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-700/80 shrink-0 mt-0.5 sm:mt-0">
                        <ServerOff className="w-4 h-4 text-white animate-bounce" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wide bg-rose-800 px-2 py-0.5 rounded text-[11px]">
                Báo Đỏ: Mất kết nối Firebase
              </span>
                            <span className="font-semibold text-rose-100">
                Dự án: <span className="font-mono text-white underline">{projectId}</span>
              </span>
                        </div>
                        <p className="mt-1 text-rose-100 text-xs leading-relaxed">
                            Hệ thống không thể kết nối đến cơ sở dữ liệu Firestore. Tuân thủ yêu cầu: <strong className="text-white underline">Tuyệt đối không sử dụng dữ liệu giả mạo (0% Fake Data)</strong>. Mọi đơn hàng chỉ được lưu và hiển thị từ database thật.
                            {errorMessage && <span className="block mt-0.5 font-mono text-[11px] text-rose-200">Chi tiết: {errorMessage}</span>}
                        </p>
                    </div>
                </div>

                <button
                    id="banner-retry-connection-btn"
                    type="button"
                    onClick={() => checkConnection()}
                    disabled={isChecking}
                    className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-rose-800 hover:bg-rose-50 active:bg-rose-100 rounded-xl font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Đang kết nối lại...' : 'Thử kết nối lại'}</span>
                </button>
            </div>
        </div>
    );
};
