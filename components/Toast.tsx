import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    onClose,
    duration = 2000
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-500/90' :
        type === 'error' ? 'bg-red-500/90' :
            'bg-blue-500/90';

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up print:hidden">
            <div className={`${bgColor} backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] border border-white/20`}>
                {type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                <span className="font-medium text-sm flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 rounded-lg p-1 transition-colors"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
