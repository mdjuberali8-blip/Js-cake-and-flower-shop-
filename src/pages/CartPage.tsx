import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
  KeyRound,
  QrCode,
  Banknote,
  CheckCircle,
  Phone,
  MessageSquare,
  Lock
} from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, placeOrder, userProfile, isLoggedIn, setIsAuthModalOpen, storeSettings } = useShop();
  const { t, language } = useLanguage();
  const isHindi = language === 'hi';
  const navigate = useNavigate();

  // Form states initialized with user profile for frictionless checkout
  const [customerName, setCustomerName] = useState(userProfile.name);
  const [customerEmail, setCustomerEmail] = useState(userProfile.email);
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone);
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile.defaultAddress);
  const [deliveryDate, setDeliveryDate] = useState('Today');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('3:00 PM - 5:00 PM');
  const [notesForBaker, setNotesForBaker] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'COD'>('UPI_QR');
  const [upiRefId, setUpiRefId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile.name) setCustomerName(userProfile.name);
    if (userProfile.email) setCustomerEmail(userProfile.email);
    if (userProfile.phone) setCustomerPhone(userProfile.phone);
    if (userProfile.defaultAddress) setDeliveryAddress(userProfile.defaultAddress);
  }, [userProfile]);

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice || item.cake.price) * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? (subtotal >= (storeSettings?.freeDeliveryThreshold || 499) ? 0 : 50) : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = placeOrder({
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        deliveryDate,
        deliveryTimeSlot,
        notesForBaker,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING_ON_DELIVERY' : 'PAID',
        upiTransactionRef: paymentMethod === 'UPI_QR' ? upiRefId.trim() : undefined,
      });

      setIsSubmitting(false);
      navigate(`/orders?orderId=${newOrder.id}`);
    }, 700);
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/menu"
            className="text-stone-500 hover:text-stone-900 transition-colors p-1.5 rounded-lg hover:bg-stone-200/60"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">{t('yourBasket')}</h1>
            <p className="text-xs text-stone-500">
              {cart.length === 0 ? t('basketEmpty') : `${cart.length} ${t('distinctItems')}`}
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              {t('basketEmpty')}
            </h2>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              {t('basketEmptySubtitle')}
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs tracking-wide transition-all shadow-sm"
            >
              {t('browseMenu')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all"
                >
                  <img
                    src={item.cake.image}
                    alt={item.cake.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-stone-100"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                          {item.cake.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 mt-1">
                          <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            {item.selectedWeight}
                          </span>
                          {item.selectedFlavor && (
                            <>
                              <span aria-hidden="true" className="text-stone-300">·</span>
                              <span>{t('flavorLabel')}: <strong>{item.selectedFlavor}</strong></span>
                            </>
                          )}
                          {item.selectedIcing && (
                            <>
                              <span aria-hidden="true" className="text-stone-300">·</span>
                              <span>{t('icingLabel')}: <strong>{item.selectedIcing}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-stone-900 text-sm">
                        ₹{((item.unitPrice || item.cake.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {item.customMessage && (
                      <div className="mt-1.5 text-xs text-stone-600 bg-stone-50 border border-stone-200/60 px-2.5 py-1 rounded-md">
                        <span className="font-medium text-stone-700">{t('plaqueInscription')}:</span> "{item.customMessage}"
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 border border-stone-200 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Assurance */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">
                    {language === 'hi' ? 'सुरक्षित चिल्ड केक डिलीवरी गारंटी' : 'Chilled Cake Transport Guarantee'}
                  </p>
                  <p className="text-stone-600 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'हमारे केक विशेष तापमान-नियंत्रित वैक्यूम बॉक्स में डिलीवर किए जाते हैं ताकि सजावट और फ्रॉस्टिंग एकदम ताज़ा रहे।'
                      : 'Our cakes are transported in custom thermo-insulated pastry vaults to ensure decorations and fillings arrive in pristine condition.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Checkout & Order Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-sm sticky top-24">
                <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  {t('deliveryDetails')}
                </h2>

                {!isLoggedIn && (
                  <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <p className="font-bold text-amber-950 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'hi' ? 'पहले से खाता है?' : 'Have an account?'}</span>
                      </p>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        {language === 'hi'
                          ? 'OTP से लॉगिन करके तुरंत विवरण भरें'
                          : 'Sign in with OTP to autofill details'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs shrink-0"
                    >
                      {language === 'hi' ? 'लॉग इन (OTP)' : 'Login'}
                    </button>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-4">
                  {/* Name & Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('recipientName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('phoneNumber')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('emailAddress')} *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('deliveryAddressLabel')} *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  {/* Delivery Slot */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('deliveryDateLabel')}
                      </label>
                      <select
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      >
                        <option value="Today">{language === 'hi' ? 'आज (Today)' : 'Today (Oct 1)'}</option>
                        <option value="Tomorrow">{language === 'hi' ? 'कल (Tomorrow)' : 'Tomorrow (Oct 2)'}</option>
                        <option value="Saturday">{language === 'hi' ? 'शनिवार (Saturday)' : 'Saturday (Oct 3)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('timeWindowLabel')}
                      </label>
                      <select
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      >
                        <option value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</option>
                        <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                        <option value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('notesForBakerLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'उदा. बेल बजाएं, 5 मोमबत्तियां दें' : 'e.g. Ring doorbell, gate code #1234, extra candles'}
                      value={notesForBaker}
                      onChange={(e) => setNotesForBaker(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Real Payment Method Selection */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      {isHindi ? 'भुगतान का तरीका (Payment Method) *' : 'Payment Method *'}
                    </label>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI_QR')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          paymentMethod === 'UPI_QR'
                            ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">
                            {isHindi ? 'UPI / QR कोड' : 'UPI / QR Pay'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            PhonePe, GPay, Paytm
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          paymentMethod === 'COD'
                            ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">
                            {isHindi ? 'कैश ऑन डिलीवरी' : 'Cash on Delivery'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {isHindi ? 'डोरस्टेप पर भुगतान' : 'Pay at Doorstep'}
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Detailed UPI Card if selected */}
                    {paymentMethod === 'UPI_QR' ? (
                      <div className="p-3.5 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-300">
                            {isHindi ? 'आधिकारिक दुकान UPI ID:' : 'Official Store UPI ID:'}
                          </span>
                          <span className="font-mono text-xs font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-700">
                            {storeSettings?.upiPaymentId || '7860828297@upi'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800">
                          <span className="text-stone-400">{isHindi ? 'भुगतान राशि:' : 'Amount:'}</span>
                          <span className="font-bold text-white font-mono">₹{total}</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                            {isHindi ? 'UPI संदर्भ संख्या / UTR No. (वैकल्पिक)' : 'UPI Reference / UTR No. (Optional)'}
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. 429104829102"
                            value={upiRefId}
                            onChange={(e) => setUpiRefId(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          {isHindi
                            ? 'कैश ऑन डिलीवरी के लिए आपको ऑर्डर करते ही 4-अंकों का Doorstep Delivery OTP प्राप्त होगा, जिसे डिलीवरी बॉय को देना होगा।'
                            : 'Doorstep Delivery OTP will be generated upon confirmation to securely verify handover.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>{t('subtotal')}</span>
                      <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('chilledTransport')}</span>
                      <span className="font-semibold text-stone-900">₹{deliveryFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                      <span>{t('totalAmount')}</span>
                      <span className="text-amber-700 text-base">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md mt-4 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>{t('placingOrderBtn')}</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t('placeOrderBtn')} · ₹{total.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-400 text-center mt-2">
                    {t('orderImmediateNote')}
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
