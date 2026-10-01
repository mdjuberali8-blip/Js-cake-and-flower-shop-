import React, { useState } from 'react';
import { Order, OrderStatus, OrderTimelineEvent } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useShop } from '../store/ShopContext';
import {
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Truck,
  ShieldCheck,
  Phone,
  MessageCircle,
  Copy,
  KeyRound,
  AlertCircle,
  Sparkles,
  Play,
  RotateCcw,
  MapPin,
  ChevronRight,
  PackageCheck
} from 'lucide-react';

interface VisualOrderTrackerProps {
  order: Order;
  onAdvanceStage?: (orderId: string) => void;
}

interface StepMeta {
  status: OrderStatus;
  stepNumber: number;
  titleEn: string;
  titleHi: string;
  shortDescEn: string;
  shortDescHi: string;
  detailedDescEn: string;
  detailedDescHi: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGlow: string;
  badgeBg: string;
  defaultActorEn: string;
  defaultActorHi: string;
}

export default function VisualOrderTracker({
  order,
  onAdvanceStage,
}: VisualOrderTrackerProps) {
  const { language } = useLanguage();
  const { advanceOrderStep } = useShop();
  const isHindi = language === 'hi';
  const [copiedOtp, setCopiedOtp] = useState(false);

  const STEPS: StepMeta[] = [
    {
      status: 'Received',
      stepNumber: 1,
      titleEn: 'Order Confirmed',
      titleHi: 'ऑर्डर कन्फर्म हुआ',
      shortDescEn: 'Verified & sent to kitchen',
      shortDescHi: 'पुष्टि कर किचन भेजा गया',
      detailedDescEn: 'Your order was verified by JS Cake Shop kitchen. Sponge base and ingredients prepared fresh.',
      detailedDescHi: 'ऑर्डर की पुष्टि JS Cake Shop किचन द्वारा कर ली गई है। स्पंज बेस व ताज़ी सामग्री तैयार है।',
      icon: CheckCircle2,
      accentColor: 'text-blue-600 bg-blue-600',
      bgGlow: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      defaultActorEn: 'Kitchen Desk',
      defaultActorHi: 'किचन डेस्क',
    },
    {
      status: 'Baking',
      stepNumber: 2,
      titleEn: 'Baking & Crafting',
      titleHi: 'बेकिंग व क्राफ्टिंग जारी',
      shortDescEn: 'Fresh in oven & hand-frosted',
      shortDescHi: 'ओवन में बेक व क्रीम फ्रॉस्टिंग',
      detailedDescEn: 'Artisan bakers are layering pure organic cream, natural cocoa, and custom name plaque.',
      detailedDescHi: 'मास्टर शेफ ताज़ी क्रीम, शुद्ध मक्खन और आपके पसंदीदा नाम की सजावट तैयार कर रहे हैं।',
      icon: Flame,
      accentColor: 'text-amber-600 bg-amber-600',
      bgGlow: 'bg-amber-500/15 border-amber-500/30 text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      defaultActorEn: 'Master Chef Liam',
      defaultActorHi: 'मास्टर शेफ लियाम',
    },
    {
      status: 'Out for Delivery',
      stepNumber: 3,
      titleEn: 'Out for Delivery',
      titleHi: 'डिलीवरी वैन रवाना',
      shortDescEn: 'On the way in chilled box',
      shortDescHi: 'रास्ते में · सुरक्षित वैन',
      detailedDescEn: 'Dispatched in special temperature-controlled container to keep cake shape and cream chilled.',
      detailedDescHi: 'केक को तापमान-नियंत्रित बॉक्स में रखकर डिलीवरी पार्टनर आपके पते के लिए निकल चुके हैं।',
      icon: Truck,
      accentColor: 'text-purple-600 bg-purple-600',
      bgGlow: 'bg-purple-500/15 border-purple-500/30 text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
      defaultActorEn: 'Delivery Partner Vikram',
      defaultActorHi: 'डिलीवरी पार्टनर विक्रम',
    },
    {
      status: 'Delivered',
      stepNumber: 4,
      titleEn: 'Delivered Fresh',
      titleHi: 'सफलतापूर्वक डिलीवर हुआ',
      shortDescEn: 'Doorstep OTP verified',
      shortDescHi: 'OTP सत्यापन संपन्न',
      detailedDescEn: 'Handed over directly to doorstep after 4-digit security OTP verification. Enjoy your celebration!',
      detailedDescHi: '4-अंकों के सुरक्षा OTP सत्यापन के बाद ताजा केक डिलीवर किया गया। आपकी खुशियों की बधाई!',
      icon: PackageCheck,
      accentColor: 'text-emerald-600 bg-emerald-600',
      bgGlow: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      defaultActorEn: 'Delivery Handover',
      defaultActorHi: 'डोरस्टेप हैंडओवर',
    },
  ];

  // If order is Cancelled
  if (order.status === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 text-red-900 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold">
              {isHindi ? 'ऑर्डर रद्द कर दिया गया है' : 'Order Cancelled'}
            </h3>
            <p className="text-xs text-red-700">
              {isHindi
                ? 'यह ऑर्डर ग्राहक या स्टोर द्वारा रद्द कर दिया गया है।'
                : 'This order was cancelled. Any paid online amount will be refunded within 24-48 business hours.'}
            </p>
          </div>
        </div>
        <div className="p-3 bg-white/80 rounded-xl border border-red-200 text-xs">
          <p>
            {isHindi
              ? 'अधिक जानकारी के लिए सहायता नंबर 7860828297 पर संपर्क करें।'
              : 'For further queries, call helpline at +91 7860828297.'}
          </p>
        </div>
      </div>
    );
  }

  const currentStepIdx = STEPS.findIndex((s) => s.status === order.status);
  const activeIndex = currentStepIdx === -1 ? 0 : currentStepIdx;
  const currentStep = STEPS[activeIndex];

  const handleCopyOtp = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2500);
    } catch {}
  };

  const handleTriggerAdvance = () => {
    if (onAdvanceStage) {
      onAdvanceStage(order.id);
    } else {
      advanceOrderStep(order.id);
    }
  };

  // Timeline lookup helper
  const getTimelineEventForStep = (stepStatus: OrderStatus): OrderTimelineEvent | undefined => {
    return order.timeline?.find((t) => t.status === stepStatus);
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO STATUS HIGHLIGHT CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 border border-stone-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Status Headline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="relative flex h-2 w-2">
                  {order.status !== 'Delivered' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${order.status === 'Delivered' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </span>
                <span>
                  {isHindi ? `चरण ${activeIndex + 1} / 4: ` : `Step ${activeIndex + 1} of 4: `}
                  {isHindi ? currentStep.titleHi : currentStep.titleEn}
                </span>
              </span>

              <span className="text-xs text-stone-400 font-mono">
                #{order.id}
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isHindi ? currentStep.titleHi : currentStep.titleEn}
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              {isHindi ? currentStep.detailedDescHi : currentStep.detailedDescEn}
            </p>

            {/* Delivery Window & Slot */}
            <div className="pt-2 flex items-center gap-4 text-xs text-amber-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  {isHindi ? 'अनुमानित समय: ' : 'Delivery Slot: '}
                  <strong className="text-white">{order.deliveryTimeSlot || 'Today within 2 hours'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 4-Digit Secret Doorstep Delivery OTP Card */}
          {order.status !== 'Delivered' && (
            <div className="bg-stone-950/80 border border-stone-700/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shrink-0 min-w-[210px] text-center shadow-lg">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <KeyRound className="w-4 h-4" />
                <span>{isHindi ? 'डोरस्टेप डिलीवरी OTP' : 'Doorstep OTP'}</span>
              </div>
              <p className="text-[11px] text-stone-400 mb-2">
                {isHindi ? 'हैंडओवर के समय डिलीवरी बॉय को बताएं' : 'Share with delivery rider'}
              </p>

              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-extrabold tracking-widest text-amber-300 bg-amber-950/60 px-4 py-1.5 rounded-xl border border-amber-500/40">
                  {order.deliveryOtp || '4892'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyOtp(order.deliveryOtp || '4892')}
                  title="Copy OTP"
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 transition-colors"
                >
                  {copiedOtp ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {copiedOtp && (
                <span className="text-[10px] text-emerald-400 font-semibold mt-1">
                  {isHindi ? 'OTP कॉपी हो गया!' : 'OTP Copied!'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. VISUAL STEP-BY-STEP PROGRESS BAR & TIMELINE */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900">
              {isHindi ? 'लाइव ऑर्डर प्रगति ट्रैकर' : 'Live Order Progress Stepper'}
            </h4>
            <p className="text-xs text-stone-500">
              {isHindi
                ? 'किचन से लेकर आपके दरवाजे तक की हर स्टेज'
                : 'Real-time lifecycle tracking from our oven to your hands'}
            </p>
          </div>

          {/* Quick Simulation Button for Testing Real Next Stage */}
          {order.status !== 'Delivered' && (
            <button
              type="button"
              onClick={handleTriggerAdvance}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Simulate advance to next real stage"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isHindi ? 'अगला चरण देखें' : 'Simulate Next Stage'}</span>
            </button>
          )}
        </div>

        {/* Desktop Horizontal Stepper */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Background Base Bar */}
            <div
              className="absolute top-7 left-12 right-12 h-1.5 bg-stone-100 rounded-full"
              aria-hidden="true"
            >
              {/* Dynamic Filled Progress Line */}
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 rounded-full transition-all duration-700 ease-out shadow-xs"
                style={{
                  width: `${(activeIndex / (STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* 4 Steps Row */}
            <div className="relative flex justify-between items-start">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;
                const isUpcoming = idx > activeIndex;
                const event = getTimelineEventForStep(step.status);

                return (
                  <div
                    key={step.status}
                    className="flex flex-col items-center text-center px-2 relative z-10"
                    style={{ width: `${100 / STEPS.length}%` }}
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                        isCurrent
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-110 shadow-amber-300/40'
                          : isCompleted
                          ? 'bg-stone-900 text-white ring-2 ring-stone-900'
                          : 'bg-white text-stone-400 border-2 border-stone-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 stroke-[3]" />
                      ) : (
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      )}
                    </div>

                    {/* Step Title & Details */}
                    <div className="mt-4 w-full px-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider block ${
                            isCurrent
                              ? 'text-amber-700'
                              : isCompleted
                              ? 'text-stone-900'
                              : 'text-stone-400'
                          }`}
                        >
                          {isHindi ? step.titleHi : step.titleEn}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {isHindi ? step.shortDescHi : step.shortDescEn}
                      </p>

                      {/* Actor & Timestamp */}
                      <div className="mt-2 pt-2 border-t border-stone-100 flex flex-col items-center text-[11px] text-stone-400 font-mono">
                        {event?.timestamp ? (
                          <span className="font-semibold text-stone-700">
                            {event.timestamp}
                          </span>
                        ) : isUpcoming ? (
                          <span className="text-stone-400">{isHindi ? 'प्रतीक्षारत' : 'Pending'}</span>
                        ) : null}

                        <span className="text-[10px] text-stone-500 truncate max-w-[130px]">
                          {event?.actor || (isHindi ? step.defaultActorHi : step.defaultActorEn)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="md:hidden space-y-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;
            const event = getTimelineEventForStep(step.status);

            return (
              <div key={step.status} className="flex items-start gap-4 relative">
                {/* Connecting Vertical Line */}
                {idx !== STEPS.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 bottom-0 w-0.5 -ml-px ${
                      idx < activeIndex ? 'bg-amber-600' : 'bg-stone-200'
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all ${
                    isCurrent
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-105 shadow-md'
                      : isCompleted
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-400 border-2 border-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <Icon className="w-5 h-5 stroke-[2]" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-amber-700'
                          : isCompleted
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {isHindi ? step.titleHi : step.titleEn}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        {isHindi ? 'सक्रिय' : 'Live'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {isHindi ? step.detailedDescHi : step.detailedDescEn}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>{event?.actor || (isHindi ? step.defaultActorHi : step.defaultActorEn)}</span>
                    {event?.timestamp && (
                      <span className="font-semibold text-stone-700">{event.timestamp}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. ACTIVE STAGE TELEMETRY & DISPATCH PARTNER DETAILS */}
        {order.status === 'Out for Delivery' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                V
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-sm text-purple-950">
                    {order.driverName || 'Vikram (Delivery Partner)'}
                  </h5>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {isHindi ? 'डिलीवरी वैन' : 'Chilled Van'}
                  </span>
                </div>
                <p className="text-xs text-purple-800 mt-0.5">
                  {isHindi ? 'दरजिया, कुशीनगर की ओर रास्ते में हैं' : 'En route to your doorstep in Kushinagar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${order.driverPhone || '+917860828297'}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isHindi ? 'पार्टनर को कॉल करें' : 'Call Rider'}</span>
              </a>

              <a
                href={`https://wa.me/917860828297?text=${encodeURIComponent(
                  `नमस्ते! मैं JS Cake Shop ऑर्डर #${order.id} के डिलीवरी बॉय से लोकेशन की जानकारी लेना चाहता हूँ।`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isHindi ? 'WhatsApp लोकेशन' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        )}

        {/* 4. DELIVERY ADDRESS & SUMMARY CHIP */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900 block">
                {isHindi ? 'डिलीवरी गंतव्य पता:' : 'Delivery Destination:'}
              </span>
              <span className="text-stone-700">{order.deliveryAddress}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-stone-500">
              {isHindi ? 'भुगतान:' : 'Payment:'}{' '}
              <strong className="text-stone-900">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
              </strong>
            </span>
            <span className="font-bold text-amber-800 text-sm">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
