import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import VisualOrderTracker from '../components/VisualOrderTracker';
import { Order, OrderStatus } from '../types';
import {
  User,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Truck,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  Search,
  Calendar,
  DollarSign,
  Receipt,
  Repeat,
  Check,
  AlertCircle,
  Edit3,
  LogOut,
  KeyRound,
  Save,
  MessageCircle,
  ShieldCheck,
  X
} from 'lucide-react';

export default function UserProfilePage() {
  const {
    orders,
    userProfile,
    isLoggedIn,
    setIsAuthModalOpen,
    updateUserProfile,
    logout,
    advanceOrderStep,
    resetDemoOrders,
    addToCart,
  } = useShop();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editEmail, setEditEmail] = useState(userProfile.email);

  useEffect(() => {
    setEditName(userProfile.name);
    setEditPhone(userProfile.phone);
    setEditEmail(userProfile.email);
  }, [userProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    });
    setIsEditModalOpen(false);
  };

  // Filter orders for the user
  const userOrders = orders;

  // Active orders (Received, Baking, Out for Delivery)
  const activeOrders = userOrders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  );
  const completedOrders = userOrders.filter(
    (o) => o.status === 'Delivered'
  );

  // Selected order state for Live Tracker
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (orderIdFromUrl && userOrders.some((o) => o.id === orderIdFromUrl)) {
      return orderIdFromUrl;
    }
    return activeOrders[0]?.id || userOrders[0]?.id || '';
  });

  // Order History Filter & Search State
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Delivered' | 'Active'>('All');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  // Keep selected order in sync if URL param changes
  useEffect(() => {
    if (orderIdFromUrl && userOrders.some((o) => o.id === orderIdFromUrl)) {
      setSelectedOrderId(orderIdFromUrl);
    }
  }, [orderIdFromUrl, userOrders]);

  const selectedOrder: Order | undefined =
    userOrders.find((o) => o.id === selectedOrderId) || userOrders[0];

  const handleAdvanceSimulation = (orderId: string) => {
    advanceOrderStep(orderId);
  };

  const handleSelectAndScrollToTracker = (orderId: string) => {
    setSelectedOrderId(orderId);
    const element = document.getElementById('live-order-tracker');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.cake, {
        selectedWeight: item.selectedWeight,
        selectedFlavor: item.selectedFlavor,
        selectedIcing: item.selectedIcing,
        customMessage: item.customMessage,
        specialInstructions: item.specialInstructions,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      });
    });

    setReorderSuccessMsg(t('reorderedToast'));
    setTimeout(() => {
      setReorderSuccessMsg(null);
    }, 3000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Received':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: `1. ${t('statusReceived')}`,
        };
      case 'Baking':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: `2. ${t('statusBaking')}`,
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500 animate-ping',
          label: `3. ${t('statusOutForDelivery')}`,
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: `4. ${t('statusDelivered')}`,
        };
      case 'Cancelled':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-500',
          label: t('statusCancelled'),
        };
    }
  };

  const formatPlacedTimestamp = (isoOrStr: string) => {
    try {
      const date = new Date(isoOrStr);
      if (isNaN(date.getTime())) return isoOrStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoOrStr;
    }
  };

  // Filtered orders for the Order History section
  const filteredHistoryOrders = userOrders.filter((order) => {
    const matchesFilter =
      historyFilter === 'All'
        ? true
        : historyFilter === 'Delivered'
        ? order.status === 'Delivered'
        : order.status !== 'Delivered' && order.status !== 'Cancelled';

    const matchesSearch =
      order.id.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.cake.name.toLowerCase().includes(historySearchQuery.toLowerCase())
      ) ||
      (order.deliveryAddress &&
        order.deliveryAddress.toLowerCase().includes(historySearchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification when items are reordered */}
      {reorderSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fadeIn">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{reorderSuccessMsg}</span>
          <Link
            to="/cart"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline ml-2"
          >
            {t('viewBasketLink')}
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Customer Profile Sign In Card if not logged in */}
        {!isLoggedIn ? (
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ग्राहक प्रोफ़ाइल व सुरक्षा' : 'Customer Account & Rewards'}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {language === 'hi' ? 'लॉग इन करें या नया खाता बनाएं' : 'Sign In to Your Customer Account'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                {language === 'hi'
                  ? 'अपने मोबाइल नंबर या ईमेल पर OTP प्राप्त करके आसानी से लॉगिन करें। अपने सभी पिछले ऑर्डर, रिवॉर्ड पॉइंट्स और लाइव डिलीवरी स्टेटस ट्रैक करें।'
                  : 'Receive instant OTP on your mobile number or email. Track past orders, live bakery progress and earn reward points.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{language === 'hi' ? 'OTP से तुरंत लॉग इन करें' : 'Login with OTP'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged In Customer Profile Card */
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
                  {userProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-serif text-2xl font-bold text-stone-900">
                      {userProfile.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                      <Award className="w-3 h-3 text-amber-600" />
                      {t('patisserieConnoisseur')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'hi' ? 'OTP वेरिफाइड' : 'Verified'}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                    <span>✉️ {userProfile.email}</span>
                    <span aria-hidden="true">·</span>
                    <span>📞 {userProfile.phone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t('memberSince')} {userProfile.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl border border-amber-200/80 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'प्रोफ़ाइल एडिट करें' : 'Edit Profile'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'लॉग आउट' : 'Log Out'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loyalty points & Quick Stats */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                    {t('rewardPoints')}
                  </span>
                  <span className="font-serif text-xl font-bold text-stone-900">
                    {userProfile.loyaltyPoints} {language === 'hi' ? 'अंक' : 'pts'}
                  </span>
                </div>
                <div className="h-8 w-px bg-stone-200" />
                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                    {t('activeBakes')}
                  </span>
                  <span className="font-serif text-xl font-bold text-amber-600">
                    {activeOrders.length}
                  </span>
                </div>
                <div className="h-8 w-px bg-stone-200" />
                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                    {t('pastOrdersCount')}
                  </span>
                  <span className="font-serif text-xl font-bold text-stone-800">
                    {completedOrders.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span>{language === 'hi' ? 'ग्राहक प्रोफ़ाइल एडिट करें' : 'Edit Customer Profile'}</span>
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'ईमेल पता *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'प्रोफ़ाइल सेव करें' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Order Tracker Section */}
        <section id="live-order-tracker">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                {t('liveProgressTitle')}
              </h2>
              <p className="text-xs text-stone-500">
                {t('liveProgressSubtitle')}
              </p>
            </div>
            <a
              href="#order-history-section"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>{t('jumpToHistory')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Quick Order Switcher */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t('selectOrderToTrack')}
                </span>
                <button
                  type="button"
                  onClick={resetDemoOrders}
                  title="Reset sample orders"
                  className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('resetDemo')}</span>
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
                  {t('noOrdersFound')}
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => {
                    const isSelected = order.id === selectedOrder?.id;
                    const badge = getStatusBadge(order.status);

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                          isSelected
                            ? 'bg-white border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                            : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900">
                                #{order.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              {order.deliveryDate} · {order.items.length} {language === 'hi' ? 'केक' : 'item(s)'}
                            </p>
                          </div>
                          <span className="font-bold text-xs text-stone-900">
                            ₹{order.total.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Brief mini preview of items */}
                        <p className="text-xs text-stone-600 mt-2 font-medium truncate">
                          {order.items.map((i) => i.cake.name).join(', ')}
                        </p>

                        {isSelected && (
                          <div className="absolute right-3 bottom-3 text-amber-600">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-850 rounded-2xl text-xs text-white space-y-2.5 shadow-sm border border-stone-750">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'hi' ? 'सुरक्षित व सत्यापित डिलीवरी' : 'Real Verified Delivery'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  {language === 'hi'
                    ? 'आपके ऑर्डर की सुरक्षा के लिए डिलीवरी बॉय को डोरस्टेप पर 4-अंकों का डिलीवरी OTP देना अनिवार्य है।'
                    : 'Every order is protected by a 4-digit Doorstep Delivery OTP verified upon physical handover.'}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800">
                  <span>{language === 'hi' ? 'दुकान सहायता:' : 'Bakery Helpline:'}</span>
                  <a href="tel:+917860828297" className="text-amber-400 font-bold hover:underline">
                    +91 7860828297
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Order Progress & Details */}
            <div className="lg:col-span-8">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Visual Step-by-Step Order Tracker Component */}
                  <VisualOrderTracker
                    order={selectedOrder}
                    onAdvanceStage={handleAdvanceSimulation}
                  />

                  {/* Ordered Items Breakdown */}
                  <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">
                      {t('cakesInOrder')}
                    </h3>

                    <div className="divide-y divide-stone-100">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                          <img
                            src={item.cake.image}
                            alt={item.cake.name}
                            className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif font-bold text-stone-900 text-sm">
                                {item.cake.name}
                              </h4>
                              <span className="text-sm font-bold text-stone-900">
                                ₹{((item.unitPrice || item.cake.price) * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                              <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                {item.selectedWeight}
                              </span>
                              {item.selectedFlavor && (
                                <span>{t('flavorLabel')}: <strong>{item.selectedFlavor}</strong></span>
                              )}
                              {item.selectedIcing && (
                                <span>{t('icingLabel')}: <strong>{item.selectedIcing}</strong></span>
                              )}
                              <span>{t('qtyLabel')}: {item.quantity}</span>
                            </div>
                            {item.customMessage && (
                              <p className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                                {t('plaqueInscription')}: "{item.customMessage}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Totals */}
                    <div className="mt-6 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                      <div className="flex justify-between">
                        <span>{t('subtotal')}</span>
                        <span className="font-medium text-stone-900">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('chilledTransport')}</span>
                        <span className="font-medium text-stone-900">₹{selectedOrder.deliveryFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                        <span>{t('totalPaid')}</span>
                        <span className="text-amber-700">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
                  <p className="text-sm text-stone-500">{t('selectOrderFromLeft')}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DEDICATED ORDER HISTORY SECTION */}
        <section
          id="order-history-section"
          className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-amber-600" />
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {t('orderHistoryTitle')}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {t('orderHistorySubtitle')}
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex items-center p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('All')}
                  className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    historyFilter === 'All'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t('allOrdersTab')} ({userOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('Delivered')}
                  className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    historyFilter === 'Delivered'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t('completedTab')} ({completedOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('Active')}
                  className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    historyFilter === 'Active'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t('inProgressTab')} ({activeOrders.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchHistoryPlaceholder')}
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* Previous Orders List */}
          {filteredHistoryOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-stone-800">{t('noPreviousOrders')}</p>
              <p className="text-xs text-stone-500 mt-1">
                {historySearchQuery ? (language === 'hi' ? 'खोज शब्द साफ़ करके देखें' : 'Try clearing your search query') : (language === 'hi' ? 'हमारे मेन्यू से अपना पहला स्वादिष्ट केक ऑर्डर करें!' : 'Place your first artisan order from our menu!')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistoryOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const deliveredEvent = order.timeline?.find((t) => t.status === 'Delivered' && t.completed);

                return (
                  <div
                    key={order.id}
                    className="border border-stone-200/90 rounded-2xl p-5 hover:border-stone-300 transition-all bg-white shadow-xs"
                  >
                    {/* Top Row: Order ID, Status, Timestamps, and Final Total */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-base text-stone-900">
                          #{order.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>

                      {/* Timestamps & Final Total */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            {t('orderPlacedTime')}
                          </span>
                          <span className="text-stone-700 font-medium">
                            {formatPlacedTimestamp(order.createdAt)}
                          </span>
                        </div>

                        {order.status === 'Delivered' && deliveredEvent && (
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                              {t('completedTimestamp')}
                            </span>
                            <span className="text-emerald-700 font-semibold">
                              {deliveredEvent.timestamp}
                            </span>
                          </div>
                        )}

                        <div className="text-left sm:text-right pl-3 sm:border-l border-stone-200">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            {t('finalTotal')}
                          </span>
                          <span className="font-serif text-lg font-bold text-amber-700 leading-none">
                            ₹{order.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Ordered Cakes Preview */}
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60"
                        >
                          <img
                            src={item.cake.image}
                            alt={item.cake.name}
                            className="w-14 h-14 rounded-lg object-cover bg-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif font-bold text-stone-900 text-xs truncate">
                                {item.cake.name}
                              </h4>
                              <span className="text-xs font-bold text-stone-900 shrink-0 ml-2">
                                ₹{((item.unitPrice || item.cake.price) * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5 space-y-0.5">
                              <p>{t('portionLabel')}: <strong className="text-stone-700">{item.selectedWeight}</strong> · {t('qtyLabel')}: {item.quantity}</p>
                              {item.selectedFlavor && <p>{t('flavorLabel')}: {item.selectedFlavor}</p>}
                              {item.selectedIcing && <p>{t('icingLabel')}: {item.selectedIcing}</p>}
                            </div>
                            {item.customMessage && (
                              <p className="text-[10px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded mt-1 truncate">
                                {t('plaqueInscription')}: "{item.customMessage}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: Destination & Quick Actions */}
                    <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{order.deliveryAddress}</span>
                        <span aria-hidden="true">·</span>
                        <span>{order.deliveryDate} ({order.deliveryTimeSlot})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Track in Live Stepper */}
                        <button
                          type="button"
                          onClick={() => handleSelectAndScrollToTracker(order.id)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t('viewLiveStepper')}</span>
                        </button>

                        {/* Reorder Button */}
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{t('reorderCakes')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
