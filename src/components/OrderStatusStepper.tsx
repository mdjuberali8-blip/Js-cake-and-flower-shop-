import React from 'react';
import { OrderStatus, OrderTimelineEvent } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Check, ClipboardList, Flame, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
  timeline?: OrderTimelineEvent[];
  compact?: boolean;
  showDescriptions?: boolean;
}

export default function OrderStatusStepper({
  currentStatus,
  timeline = [],
  compact = false,
  showDescriptions = true,
}: OrderStatusStepperProps) {
  const { t, language } = useLanguage();

  const STAGES: {
    status: OrderStatus;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[] = [
    {
      status: 'Received',
      label: t('statusReceived'),
      shortLabel: language === 'hi' ? 'प्राप्त' : 'Received',
      icon: ClipboardList,
      description: t('stage1Desc'),
    },
    {
      status: 'Baking',
      label: t('statusBaking'),
      shortLabel: language === 'hi' ? 'बेकिंग' : 'Baking',
      icon: Flame,
      description: t('stage2Desc'),
    },
    {
      status: 'Out for Delivery',
      label: t('statusOutForDelivery'),
      shortLabel: language === 'hi' ? 'रास्ते में' : 'On the Way',
      icon: Truck,
      description: t('stage3Desc'),
    },
    {
      status: 'Delivered',
      label: t('statusDelivered'),
      shortLabel: language === 'hi' ? 'डिलीवर' : 'Delivered',
      icon: CheckCircle2,
      description: t('stage4Desc'),
    },
  ];

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <p className="font-semibold text-sm">{t('statusCancelled')}</p>
          <p className="text-xs text-red-600">
            {language === 'hi'
              ? 'यह ऑर्डर रद्द किया गया है। राशि 24 घंटे में वापस हो जाएगी।'
              : 'This order was cancelled. Any charged amount will be refunded in 24 hours.'}
          </p>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.status === currentStatus);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  // Compact variant for table rows or summary list items
  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="font-semibold text-stone-900">
            {STAGES[activeIndex]?.label || currentStatus}
          </span>
          <span className="text-stone-500 font-medium">
            {language === 'hi' ? `चरण ${activeIndex + 1} / 4` : `Step ${activeIndex + 1} of 4`}
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden flex gap-1 p-0.5">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={stage.status}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                  isCurrent
                    ? 'bg-amber-600 animate-pulse'
                    : isCompleted
                    ? 'bg-amber-700'
                    : 'bg-stone-200'
                }`}
                title={stage.label}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Full detailed visual progress stepper
  return (
    <div className="w-full py-2">
      {/* Desktop & Tablet horizontal layout */}
      <div className="hidden sm:block">
        <div className="relative flex items-start justify-between">
          {/* Background track line */}
          <div
            className="absolute top-6 left-8 right-8 h-1 bg-stone-200 -z-0"
            aria-hidden="true"
          >
            {/* Filled progress bar */}
            <div
              className="h-full bg-amber-600 transition-all duration-700 ease-out"
              style={{
                width: `${(activeIndex / (STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;

            // Match with timeline event if available
            const event = timeline.find((e) => e.status === stage.status);

            return (
              <div
                key={stage.status}
                className="flex flex-col items-center relative z-10 text-center px-1"
                style={{ width: `${100 / STAGES.length}%` }}
              >
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isCurrent
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-110 shadow-amber-200/50'
                      : isCompleted
                      ? 'bg-stone-900 text-white ring-2 ring-stone-900'
                      : 'bg-white text-stone-400 border-2 border-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Text Info */}
                <div className="mt-3 w-full">
                  <p
                    className={`text-sm font-semibold tracking-tight ${
                      isCurrent
                        ? 'text-amber-700 font-bold'
                        : isCompleted
                        ? 'text-stone-900'
                        : 'text-stone-400'
                    }`}
                  >
                    {stage.label}
                  </p>

                  {/* Status Indicator Subtext */}
                  {showDescriptions && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                      {isCurrent
                        ? (language === 'hi' ? 'वर्तमान में प्रगति पर' : 'In progress now')
                        : isCompleted
                        ? (language === 'hi' ? 'सफलतापूर्वक पूर्ण' : 'Completed')
                        : stage.description}
                    </p>
                  )}

                  {/* Timestamp if available */}
                  {event?.timestamp && (
                    <p className="text-[11px] text-stone-400 mt-1 font-mono">
                      {event.timestamp}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical layout */}
      <div className="sm:hidden space-y-4">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;
          const event = timeline.find((e) => e.status === stage.status);

          return (
            <div key={stage.status} className="flex items-start gap-3 relative">
              {/* Connecting line between vertical items */}
              {idx !== STAGES.length - 1 && (
                <div
                  className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-px ${
                    idx < activeIndex ? 'bg-stone-900' : 'bg-stone-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  isCurrent
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                    : isCompleted
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-400 border border-stone-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-amber-700'
                        : isCompleted
                        ? 'text-stone-900'
                        : 'text-stone-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {language === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 mt-0.5">
                  {event?.description || stage.description}
                </p>

                {event?.timestamp && (
                  <p className="text-[11px] text-stone-400 mt-1 font-mono">
                    {event.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
