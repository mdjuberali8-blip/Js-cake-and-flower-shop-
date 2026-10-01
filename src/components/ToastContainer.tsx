import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ToastNotification, OrderStatus } from '../types';
import {
  Flame,
  Truck,
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Bell
} from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast } = useShop();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Order Status Notifications"
      className="fixed top-16 right-4 sm:top-20 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <SingleToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
          onViewOrder={() => {
            dismissToast(toast.id);
            navigate(`/orders?orderId=${toast.orderId}`);
          }}
        />
      ))}
    </div>
  );
}

function SingleToastItem({
  toast,
  onDismiss,
  onViewOrder,
}: {
  toast: ToastNotification;
  onDismiss: () => void;
  onViewOrder: () => void;
}) {
  const { t, language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const durationMs = 6000;
  const onDismissRef = React.useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Auto-dismiss countdown timer
  useEffect(() => {
    if (isHovered) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingProgress = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingProgress);

      if (elapsed >= durationMs) {
        clearInterval(timer);
        onDismissRef.current();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isHovered, durationMs]);

  const getStatusVisuals = (status: OrderStatus) => {
    switch (status) {
      case 'Received':
        return {
          icon: ClipboardList,
          iconBg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          accentBorder: 'border-l-4 border-l-blue-600',
          dot: 'bg-blue-500',
          stageName: `1. ${t('statusReceived')}`,
        };
      case 'Baking':
        return {
          icon: Flame,
          iconBg: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          accentBorder: 'border-l-4 border-l-amber-600',
          dot: 'bg-amber-500 animate-pulse',
          stageName: `2. ${t('statusBaking')}`,
        };
      case 'Out for Delivery':
        return {
          icon: Truck,
          iconBg: 'bg-purple-500/15 text-purple-600 border border-purple-500/30',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          accentBorder: 'border-l-4 border-l-purple-600',
          dot: 'bg-purple-500 animate-ping',
          stageName: `3. ${t('statusOutForDelivery')}`,
        };
      case 'Delivered':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          accentBorder: 'border-l-4 border-l-emerald-600',
          dot: 'bg-emerald-500',
          stageName: `4. ${t('statusDelivered')}`,
        };
      case 'Cancelled':
        return {
          icon: AlertCircle,
          iconBg: 'bg-red-500/15 text-red-600 border border-red-500/30',
          badgeBg: 'bg-red-50 text-red-800 border-red-200',
          accentBorder: 'border-l-4 border-l-red-600',
          dot: 'bg-red-500',
          stageName: t('statusCancelled'),
        };
    }
  };

  const visuals = getStatusVisuals(toast.newStatus);
  const IconComponent = visuals.icon;

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 animate-slideInRight ${visuals.accentBorder}`}
    >
      {/* Auto-dismiss progress bar */}
      <div className="w-full bg-stone-100 h-1 overflow-hidden">
        <div
          className="h-full bg-amber-600 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 sm:p-4.5">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visuals.iconBg}`}
          >
            <IconComponent className="w-5 h-5 stroke-[2.2]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono font-bold text-xs text-stone-900">
                #{toast.orderId}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${visuals.badgeBg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${visuals.dot}`} />
                {visuals.stageName}
              </span>
            </div>

            <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
              {toast.title}
            </h4>

            <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
              {toast.message}
            </p>

            {/* Footer Row: Timestamp & Track CTA */}
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-stone-400 font-mono">
                {toast.timestamp} · {toast.actor || (language === 'hi' ? 'बेकरी किचन' : 'Bakery Kitchen')}
              </span>

              <button
                type="button"
                onClick={onViewOrder}
                className="font-bold text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                <span>{t('toastTrackLive')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
