import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    FirebaseConnectionStatus,
    subscribeToFirebaseStatus,
    checkFirebaseConnectionStatus,
    getLatestConnectionStatus,
    FIREBASE_CONFIG
} from '../services/firebase';

interface FirebaseConnectionContextType {
    status: 'checking' | 'connected' | 'error';
    isConnected: boolean;
    projectId: string;
    errorMessage?: string;
    ordersCount: number;
    latencyMs?: number;
    lastChecked: string;
    isChecking: boolean;
    checkConnection: () => Promise<void>;
}

const FirebaseConnectionContext = createContext<FirebaseConnectionContextType | undefined>(undefined);

export const FirebaseConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connection, setConnection] = useState<FirebaseConnectionStatus>(() => getLatestConnectionStatus());
    const [isChecking, setIsChecking] = useState(false);

    // Subscribe to real-time status changes
    useEffect(() => {
        const unsubscribe = subscribeToFirebaseStatus((newStatus) => {
            setConnection(newStatus);
        });
        return unsubscribe;
    }, []);

    const checkConnection = useCallback(async () => {
        setIsChecking(true);
        try {
            const result = await checkFirebaseConnectionStatus();
            setConnection(result);
        } catch (err: any) {
            setConnection({
                status: 'error',
                isConnected: false,
                projectId: FIREBASE_CONFIG.projectId,
                ordersCount: 0,
                productCount: 0,
                errorMessage: err?.message || 'Không thể kết nối Firebase Firestore',
                lastChecked: new Date().toLocaleTimeString('vi-VN')
            });
        } finally {
            setIsChecking(false);
        }
    }, []);

    // Initial check and periodic polling (every 30 seconds)
    useEffect(() => {
        checkConnection();

        const interval = setInterval(() => {
            checkConnection();
        }, 30000);

        const handleOnline = () => {
            checkConnection();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
        };
    }, [checkConnection]);

    return (
        <FirebaseConnectionContext.Provider
            value={{
        status: connection.status,
            isConnected: connection.isConnected,
            projectId: connection.projectId || FIREBASE_CONFIG.projectId,
            errorMessage: connection.errorMessage,
            ordersCount: connection.ordersCount || 0,
            latencyMs: connection.latencyMs,
            lastChecked: connection.lastChecked,
            isChecking,
            checkConnection
    }}
>
    {children}
    </FirebaseConnectionContext.Provider>
);
};

export function useFirebaseConnection() {
    const context = useContext(FirebaseConnectionContext);
    if (!context) {
        throw new Error('useFirebaseConnection must be used within a FirebaseConnectionProvider');
    }
    return context;
}
