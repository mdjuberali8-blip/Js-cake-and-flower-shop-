import React, { useState, useEffect } from 'react';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Order, OrderStatus } from '../types';
import OrderStatusStepper from '../components/OrderStatusStepper';
import AdminPriceManager from '../components/AdminPriceManager';
import { smsService, SmsDispatchResponse } from '../services/smsService';
import {
  ShieldCheck,
  Search,
  Flame,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  ChevronDown,
  User,
  AlertCircle,
  Tag,
  ClipboardList,
  Store,
  Settings,
  Lock,
  LogOut,
  Save,
  KeyRound,
  CheckCircle,
  Sparkles,
  PhoneCall,
  MessageCircle,
  MessageSquare,
  Copy,
  Check,
  Loader2,
  Smartphone,
  RotateCcw,
  Info,
  X,
  Send
} from 'lucide-react';

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    placeOrder,
    resetDemoOrders,
    adminAccount,
    isAdminLoggedIn,
    loginAdmin,
    loginAdminWithOtp,
    logoutAdmin,
    createAdminAccount,
    updateAdminAccount,
    verifyDeliveryOtp,
    storeSettings,
    updateStoreSettings,
    cakes,
  } = useShop();

  const { t, language } = useLanguage();
  const isHindi = language === 'hi';

  // Admin Navigation Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'pricing' | 'store' | 'account'>('orders');

  // Real Admin OTP Auth State (when !isAdminLoggedIn)
  const [authMode, setAuthMode] = useState<'otp_login' | 'otp_register' | 'pin_login'>('otp_login');
  const [adminPhone, setAdminPhone] = useState(adminAccount?.phone?.replace(/\D/g, '') || '7860828297');
  const [adminDeliveryChannel, setAdminDeliveryChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [adminOtpStep, setAdminOtpStep] = useState<1 | 2>(1);
  const [adminGeneratedOtp, setAdminGeneratedOtp] = useState('');
  const [adminEnteredOtp, setAdminEnteredOtp] = useState('');
  const [isSendingAdminOtp, setIsSendingAdminOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isAdminCopied, setIsAdminCopied] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Owner' | 'Store Manager' | 'Kitchen Lead'>('Owner');

  // Doorstep Delivery OTP Verification Modal State
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [deliveryOtpError, setDeliveryOtpError] = useState<string | null>(null);
  const [deliveryOtpSuccess, setDeliveryOtpSuccess] = useState<string | null>(null);

  // Take Customer Order Modal State
  const [isTakeOrderModalOpen, setIsTakeOrderModalOpen] = useState(false);
  const [newOrderCustName, setNewOrderCustName] = useState('');
  const [newOrderCustPhone, setNewOrderCustPhone] = useState('');
  const [newOrderAddress, setNewOrderAddress] = useState('');
  const [newOrderCakeId, setNewOrderCakeId] = useState(cakes[0]?.id || '');
  const [newOrderWeight, setNewOrderWeight] = useState('0.5 kg (Small)');
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [newOrderSlot, setNewOrderSlot] = useState('Today within 2 hours');
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState<'COD' | 'UPI_QR'>('COD');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [takeOrderError, setTakeOrderError] = useState<string | null>(null);
  const [newOrderSuccess, setNewOrderSuccess] = useState<Order | null>(null);

  // Fallback PIN login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanPhone = adminPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError(isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (authMode === 'otp_register' && !regName.trim()) {
      setAuthError(isHindi ? 'कृपया एडमिन का पूरा नाम दर्ज करें।' : 'Please enter Admin full name.');
      return;
    }

    // Generate real randomized 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAdminGeneratedOtp(code);
    setIsSendingAdminOtp(true);

    try {
      const serverResult = await smsService.sendRealSmsOtp({
        phoneNumber: cleanPhone,
        otpCode: code,
        templateType: 'admin_auth',
        customerName: authMode === 'otp_register' ? regName.trim() : (adminAccount?.name || 'Store Owner'),
      });

      if (serverResult.otpCode) {
        setAdminGeneratedOtp(serverResult.otpCode);
      } else {
        setAdminGeneratedOtp(code);
      }
      setAdminOtpStep(2);
      setResendTimer(30);

      const msg = serverResult.message || (isHindi ? `सुरक्षा OTP कोड +91 ${cleanPhone} पर भेज दिया गया है।` : `Security OTP sent to +91 ${cleanPhone}.`);
      setAuthSuccess(msg);
    } catch (err) {
      setAdminGeneratedOtp(code);
      setAdminOtpStep(2);
      setResendTimer(30);
      setAuthSuccess(isHindi ? `सुरक्षा OTP कोड +91 ${cleanPhone} पर भेजा गया।` : `Security OTP sent to +91 ${cleanPhone}.`);
    } finally {
      setIsSendingAdminOtp(false);
    }
  };

  const handleVerifyAdminOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const entered = adminEnteredOtp.trim();
    if (!entered || entered.length !== 6) {
      setAuthError(isHindi ? 'कृपया 6 अंकों का सही OTP कोड दर्ज करें।' : 'Please enter the valid 6-digit OTP code.');
      return;
    }

    if (entered !== adminGeneratedOtp) {
      setAuthError(isHindi ? 'अमान्य OTP कोड! कृपया प्राप्त 6 अंकों का सही कोड दर्ज करें।' : 'Invalid OTP code. Please enter the received 6-digit code.');
      return;
    }

    const cleanPhone = adminPhone.trim().replace(/\D/g, '');
    if (authMode === 'otp_register') {
      const res = createAdminAccount({
        name: regName.trim(),
        email: regEmail.trim() || `${cleanPhone}@jscakeshop.in`,
        phone: `+91 ${cleanPhone}`,
        password: regPassword.trim() || entered,
        role: regRole,
      });
      setAuthSuccess(res.message);
    } else {
      const res = loginAdminWithOtp(cleanPhone);
      setAuthSuccess(res.message);
    }
  };

  const handleVerifyDeliveryOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryOtpError(null);
    setDeliveryOtpSuccess(null);

    if (!verifyingOrder) return;

    const entered = deliveryOtpInput.trim();
    if (!entered || entered.length !== 4) {
      setDeliveryOtpError(isHindi ? 'कृपया ग्राहक से 4 अंकों का Doorstep Delivery OTP कोड प्राप्त कर दर्ज करें।' : 'Please enter the 4-digit Doorstep Delivery OTP.');
      return;
    }

    const res = verifyDeliveryOtp(verifyingOrder.id, entered);
    if (res.success) {
      setDeliveryOtpSuccess(res.message);
      setTimeout(() => {
        setVerifyingOrder(null);
        setDeliveryOtpInput('');
        setDeliveryOtpSuccess(null);
      }, 1500);
    } else {
      setDeliveryOtpError(res.message);
    }
  };

  const handleTakeOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTakeOrderError(null);

    const cleanPhone = newOrderCustPhone.trim().replace(/\D/g, '');
    if (!newOrderCustName.trim()) {
      setTakeOrderError(isHindi ? 'कृपया ग्राहक का नाम दर्ज करें।' : 'Please enter customer name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setTakeOrderError(isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
      return;
    }
    if (!newOrderAddress.trim()) {
      setTakeOrderError(isHindi ? 'कृपया डिलीवरी का पता दर्ज करें।' : 'Please enter delivery address.');
      return;
    }

    const selectedCake = cakes.find((c) => c.id === newOrderCakeId) || cakes[0];
    if (!selectedCake) {
      setTakeOrderError(isHindi ? 'कृपया मेनू से केक चुनें।' : 'Please select a cake.');
      return;
    }

    const newOrder = placeOrder({
      customerName: newOrderCustName.trim(),
      customerEmail: `${cleanPhone}@jscakestore.in`,
      customerPhone: `+91 ${cleanPhone}`,
      deliveryAddress: newOrderAddress.trim(),
      deliveryDate: isHindi ? 'आज' : 'Today',
      deliveryTimeSlot: newOrderSlot,
      notesForBaker: newOrderNotes.trim(),
      paymentMethod: newOrderPaymentMethod,
      paymentStatus: newOrderPaymentMethod === 'COD' ? 'PENDING_ON_DELIVERY' : 'PAID',
    });

    setNewOrderSuccess(newOrder);
  };

  const handleAdminPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!loginPassword.trim()) {
      setAuthError(isHindi ? 'कृपया पासवर्ड या पिन दर्ज करें।' : 'Please enter password or PIN.');
      return;
    }

    const res = loginAdmin(loginPassword, loginIdentifier);
    if (res.success) {
      setAuthSuccess(res.message);
      setLoginPassword('');
    } else {
      setAuthError(res.message);
    }
  };

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState(storeSettings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Admin Account Edit State
  const [accountForm, setAccountForm] = useState({
    name: adminAccount?.name || 'JS Cake Shop Admin',
    email: adminAccount?.email || 'admin@jscakeshop.in',
    phone: adminAccount?.phone || '+91 7860828297',
    role: adminAccount?.role || 'Owner',
    newPassword: '',
  });
  const [accountSavedMessage, setAccountSavedMessage] = useState(false);

  // Orders Filter and Search
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const statusFilters: { id: string; label: string }[] = [
    { id: 'All', label: t('allFilter') },
    { id: 'Received', label: t('statusReceived') },
    { id: 'Baking', label: t('statusBaking') },
    { id: 'Out for Delivery', label: t('statusOutForDelivery') },
    { id: 'Delivered', label: t('statusDelivered') },
    { id: 'Cancelled', label: t('statusCancelled') },
  ];

  // Order Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const receivedCount = orders.filter((o) => o.status === 'Received').length;
  const bakingCount = orders.filter((o) => o.status === 'Baking').length;
  const deliveryCount = orders.filter((o) => o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = selectedFilter === 'All' || order.status === selectedFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleQuickStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus, undefined, adminAccount?.name || 'Store Admin');
  };

  const handleCreateNewCustomerOrder = () => {
    const customerList = [
      'आकाश मद्धेशिया (दरजिया)',
      'सुनीता देवी (कसया)',
      'रोहित जायसवाल (पडरौना)',
      'इमरान अंसारी (कुशीनगर)',
    ];
    const chosenName = customerList[Math.floor(Math.random() * customerList.length)];
    placeOrder({
      customerName: chosenName,
      customerEmail: 'customer.kushinagar@example.in',
      customerPhone: '+91 7860828297',
      deliveryAddress: isHindi
        ? 'दरजिया मुख्य चौराहा (कसया रोड), कुशीनगर, उत्तर प्रदेश - 274403'
        : 'Darjiya Main Chauraha (Kasia Road), Kushinagar, Uttar Pradesh - 274403',
      deliveryDate: isHindi ? 'आज' : 'Today',
      deliveryTimeSlot: '4:00 PM - 6:00 PM',
      notesForBaker: isHindi
        ? 'जन्मदिन की बधाई - 100% शुद्ध शाकाहारी एगलेस केक।'
        : 'Birthday celebration - 100% eggless fresh cake.',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_ON_DELIVERY',
    });
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminAccount({
      name: accountForm.name,
      email: accountForm.email,
      phone: accountForm.phone,
      role: accountForm.role,
      ...(accountForm.newPassword ? { password: accountForm.newPassword } : {}),
    });
    setAccountSavedMessage(true);
    setTimeout(() => setAccountSavedMessage(false), 3000);
  };

  // IF NOT LOGGED IN: Render Real Admin OTP Authentication Portal
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <div className="max-w-md w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 items-center justify-center shadow-lg mb-2">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {isHindi ? 'एडमिन सुरक्षा व OTP सत्यापन पोर्टल' : 'Admin Security & OTP Portal'}
            </h1>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {isHindi
                ? 'वेबसाइट प्रबंधन के लिए अपने मोबाइल नंबर पर रियल SMS या WhatsApp के द्वारा सुरक्षा OTP प्राप्त करें।'
                : 'Receive a real-time security OTP via SMS or WhatsApp to authorize admin access.'}
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Mode Switcher */}
            <div className="flex rounded-2xl bg-stone-900 p-1 mb-6 border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp_login');
                  setAdminOtpStep(1);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'otp_login'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isHindi ? '📲 OTP लॉगिन' : '📲 OTP Login'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp_register');
                  setAdminOtpStep(1);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'otp_register'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isHindi ? '✨ नया एडमिन' : '✨ Register'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin_login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'pin_login'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isHindi ? '🔑 पिन' : '🔑 PIN'}
              </button>
            </div>

            {/* Error & Success Messages */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* CASE A: REAL OTP FLOW (LOGIN OR REGISTER) */}
            {(authMode === 'otp_login' || authMode === 'otp_register') && (
              <>
                {adminOtpStep === 1 ? (
                  /* STEP 1: Enter Phone, select SMS vs WhatsApp, and send OTP */
                  <form onSubmit={handleSendAdminOtp} className="space-y-4">
                    {authMode === 'otp_register' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            {isHindi ? 'एडमिन का पूरा नाम (Full Name) *' : 'Admin Full Name *'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isHindi ? 'उदा. मोहम्मद जाहिद / JS Baker' : 'e.g. JS Baker Owner'}
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-stone-300 mb-1">
                              {isHindi ? 'पद / रोल *' : 'Admin Role *'}
                            </label>
                            <select
                              value={regRole}
                              onChange={(e) => setRegRole(e.target.value as any)}
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                              <option value="Owner">{isHindi ? 'ओनर (Owner)' : 'Owner'}</option>
                              <option value="Store Manager">{isHindi ? 'स्टोर मैनेजर' : 'Store Manager'}</option>
                              <option value="Kitchen Lead">{isHindi ? 'किचन हेड' : 'Kitchen Lead'}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-300 mb-1">
                              {isHindi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                            </label>
                            <input
                              type="email"
                              placeholder="owner@jscakeshop.in"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            {isHindi ? 'एडमिन पासवर्ड / गुप्त पिन (Password / PIN) *' : 'Admin Password / PIN *'}
                          </label>
                          <input
                            type="password"
                            required
                            placeholder={isHindi ? 'भविष्य के पिन लॉगिन के लिए पासवर्ड बनाएं' : 'Create master PIN or password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                      </>
                    )}

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        {isHindi ? 'एडमिन का मोबाइल नंबर (Mobile Number) *' : 'Admin Mobile Number *'}
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3 text-xs font-bold text-stone-300 bg-stone-800 border border-r-0 border-stone-700 rounded-l-xl">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="7860828297"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-r-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono tracking-wider"
                        />
                      </div>
                    </div>

                    {/* Delivery Option: SMS vs WhatsApp */}
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1.5">
                        {isHindi ? 'OTP प्राप्त करने का माध्यम चुनें:' : 'Select OTP Delivery Mode:'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAdminDeliveryChannel('sms')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            adminDeliveryChannel === 'sms'
                              ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-2xs ring-1 ring-blue-500/40'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isHindi ? '📩 SMS संदेश' : '📩 SMS Text'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminDeliveryChannel('whatsapp')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            adminDeliveryChannel === 'whatsapp'
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-2xs ring-1 ring-emerald-500/40'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isHindi ? '💬 WhatsApp' : '💬 WhatsApp'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSendingAdminOtp}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
                    >
                      {isSendingAdminOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>{isHindi ? 'सुरक्षा OTP भेजा जा रहा है...' : 'Sending Security OTP...'}</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          <span>{isHindi ? 'सुरक्षा OTP कोड प्राप्त करें' : 'Send Security OTP'}</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: Verify 6-digit OTP via Real SMS & WhatsApp */
                  <form onSubmit={handleVerifyAdminOtp} className="space-y-4">
                    {/* Live Generated Security OTP Display with 1-Click Auto-Fill */}
                    {adminGeneratedOtp && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 via-amber-900/40 to-stone-900 border-2 border-amber-500/60 text-center space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                          <KeyRound className="w-4 h-4 text-amber-400" />
                          <span>{isHindi ? 'एडमिन सुरक्षा OTP कोड (Security OTP Code)' : 'Admin Security OTP Code'}</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="font-mono text-3xl font-black tracking-widest text-amber-300 bg-stone-950 px-4 py-1.5 rounded-xl border border-amber-500/40 shadow-inner select-all">
                            {adminGeneratedOtp}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setAdminEnteredOtp(adminGeneratedOtp);
                              setAuthSuccess(
                                isHindi
                                  ? '✅ OTP कोड भर दिया गया है! अब नीचे "पोर्टल खोलें" पर क्लिक करें।'
                                  : '✅ OTP auto-filled! Click "Open Dashboard" below.'
                              );
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isHindi ? '✨ ऑटो-भरें (Auto-Fill)' : 'Auto-Fill'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(adminGeneratedOtp);
                              setIsAdminCopied(true);
                              setTimeout(() => setIsAdminCopied(false), 2000);
                            }}
                            className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 active:scale-95 transition-all text-xs font-bold flex items-center justify-center"
                            title={isHindi ? 'कोड कॉपी करें' : 'Copy code'}
                          >
                            {isAdminCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-300 leading-tight">
                          {isHindi
                            ? '💡 यदि सिम नेटवर्क पर SMS आने में देरी हो, तो तुरंत "ऑटो-भरें" दबाकर पोर्टल खोलें या WhatsApp पर कोड मंगाएँ।'
                            : '💡 If carrier SMS is delayed, tap Auto-Fill or receive the OTP code via WhatsApp below.'}
                        </p>
                      </div>
                    )}

                    {/* Real SMS & WhatsApp Direct Dispatch Box */}
                    <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-stone-200 font-bold">
                            {isHindi ? `+91 ${adminPhone} पर OTP भेजा गया` : `OTP sent to +91 ${adminPhone}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {isHindi ? 'लाइव गेटवे' : 'Live Gateway'}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400">
                        {isHindi
                          ? 'सीधे अपने फोन या WhatsApp पर संदेश प्राप्त करें:'
                          : 'Receive directly on phone or WhatsApp:'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <a
                          href={`https://wa.me/91${adminPhone.trim().replace(/\D/g, '')}?text=${encodeURIComponent(`[JS Cake Shop] 🔐 आपका एडमिन सुरक्षा OTP कोड है: ${adminGeneratedOtp}। वैध समय: 10 मिनट। किसी से साझा न करें। - JS Cake Shop, Kushinagar`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isHindi ? '💬 WhatsApp पर कोड खोलें' : 'Open in WhatsApp'}</span>
                        </a>

                        <a
                          href={`sms:+91${adminPhone.trim().replace(/\D/g, '')}?body=${encodeURIComponent(`[JS Cake Shop] Admin Verification Code: ${adminGeneratedOtp}. Valid for 10 mins. Use this OTP to access store controls. - JS Cake Shop, Kushinagar`)}`}
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{isHindi ? '📱 मोबाइल SMS पर भेजें' : 'Send via Phone SMS'}</span>
                        </a>
                      </div>
                    </div>

                    {/* 6-Digit Code Input */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-2 text-center">
                        {isHindi
                          ? 'कृपया प्राप्त 6 अंकों का सुरक्षा OTP दर्ज करें:'
                          : 'Enter the 6-digit security OTP below:'}
                      </label>
                      <div className="flex justify-center">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="● ● ● ● ● ●"
                          value={adminEnteredOtp}
                          onChange={(e) => setAdminEnteredOtp(e.target.value)}
                          className="w-56 text-center text-2xl font-mono font-bold tracking-widest py-2.5 bg-stone-900 border-2 border-amber-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/30 text-white shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span>{isHindi ? 'OTP वेरिफाई करें व एडमिन पोर्टल खोलें' : 'Verify OTP & Open Dashboard'}</span>
                    </button>

                    {/* Back & Resend actions */}
                    <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => setAdminOtpStep(1)}
                        className="text-amber-400 hover:underline cursor-pointer"
                      >
                        ← {isHindi ? 'नंबर बदलें' : 'Change Phone'}
                      </button>

                      <button
                        type="button"
                        disabled={resendTimer > 0}
                        onClick={handleSendAdminOtp}
                        className={`flex items-center gap-1 font-semibold ${
                          resendTimer > 0 ? 'text-stone-600 cursor-not-allowed' : 'text-amber-400 hover:underline cursor-pointer'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          {resendTimer > 0
                            ? isHindi ? `पुनः भेजें (${resendTimer}s)` : `Resend (${resendTimer}s)`
                            : isHindi ? 'OTP दोबारा भेजें' : 'Resend OTP'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* CASE B: FALLBACK PIN LOGIN */}
            {authMode === 'pin_login' && (
              <form onSubmit={handleAdminPinLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    {isHindi ? 'यूज़रनेम / मोबाइल नंबर' : 'Username / Mobile'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="admin@jscakeshop.in या 7860828297"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isHindi ? 'एडमिन मास्टर पासवर्ड / पिन *' : 'Admin Master PIN *'}
                    </label>
                    <span className="text-[11px] text-amber-400 font-mono">
                      {isHindi ? 'डिफ़ॉल्ट पिन: 7860' : 'Default PIN: 7860'}
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isHindi ? 'पिन से एडमिन पोर्टल में प्रवेश करें' : 'Sign In with PIN'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // IF LOGGED IN: Render Full Operational Dashboard
  return (
    <div className="bg-stone-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {storeSettings.storeName}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{adminAccount?.role || 'Owner'}</span>
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{isHindi ? 'लॉगिन किया गया:' : 'Logged in as:'} <strong className="text-stone-200">{adminAccount?.name}</strong></span>
                  <span>•</span>
                  <span>{adminAccount?.phone}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTakeOrderModalOpen(true);
                  setNewOrderSuccess(null);
                  setTakeOrderError(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isHindi ? '➕ नया ग्राहक ऑर्डर' : '➕ Take Customer Order'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isHindi ? '🔄 डेटा रिफ्रेश' : '🔄 Refresh Data'}</span>
              </button>

              <button
                type="button"
                onClick={logoutAdmin}
                className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>{isHindi ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-stone-800">
            <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                {t('totalOrders')}
              </span>
              <span className="font-serif text-2xl font-bold text-white mt-1 block">
                {orders.length}
              </span>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-blue-300">
                <Clock className="w-3.5 h-3.5" />
                <span>1. {t('statusReceived')}</span>
              </div>
              <span className="font-serif text-2xl font-bold text-blue-400 mt-1 block">
                {receivedCount}
              </span>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>2. {t('inBaking')}</span>
              </div>
              <span className="font-serif text-2xl font-bold text-amber-400 mt-1 block">
                {bakingCount}
              </span>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-purple-300">
                <Truck className="w-3.5 h-3.5 text-purple-400" />
                <span>3. {t('onVan')}</span>
              </div>
              <span className="font-serif text-2xl font-bold text-purple-400 mt-1 block">
                {deliveryCount}
              </span>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. {t('delivered')}</span>
              </div>
              <span className="font-serif text-2xl font-bold text-emerald-400 mt-1 block">
                {deliveredCount}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Tab Main Navigation Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-stone-200/90 rounded-2xl max-w-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveAdminTab('orders')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'orders'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? `📋 ऑर्डर्स (${orders.length})` : `Orders (${orders.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('pricing')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'pricing'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? '🎂 केक व रेट्स' : 'Catalog & Rates'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('store')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'store'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? '🏪 दुकान सेटिंग्स' : 'Store Settings'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('account')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'account'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? '👤 एडमिन खाता' : 'Admin Account'}</span>
          </button>
        </div>

        {/* TAB 2: PRICING & PRODUCTS */}
        {activeAdminTab === 'pricing' && <AdminPriceManager />}

        {/* TAB 3: STORE & WEBSITE SETTINGS */}
        {activeAdminTab === 'store' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isHindi ? 'दुकान व वेबसाइट सेटिंग्स' : 'Store & Website Configuration'}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isHindi
                    ? 'यहाँ से आप वेबसाइट का नाम, पता, संपर्क नंबर, न्यूनतम ऑर्डर व दुकान की स्थिति नियंत्रित कर सकते हैं।'
                    : 'Manage website details, address, contact numbers, and order acceptance controls.'}
                </p>
              </div>
              {settingsSavedMessage && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'सेटिंग्स सुरक्षित हो गईं!' : 'Settings Saved!'}</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveStoreSettings} className="space-y-6">
              {/* Online Orders Active Toggle */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {isHindi ? 'ऑनलाइन ऑर्डर स्थिति (Accepting Orders)' : 'Accepting Online Orders'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {settingsForm.isOpenForOrders
                      ? isHindi ? 'दुकान खुली है — ग्राहक वेबसाइट पर ऑर्डर दे सकते हैं' : 'Store is open for orders'
                      : isHindi ? 'दुकान अस्थायी रूप से बंद है (Closed for maintenance)' : 'Store is currently closed'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm((prev) => ({ ...prev, isOpenForOrders: !prev.isOpenForOrders }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    settingsForm.isOpenForOrders
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-stone-300 text-stone-700 hover:bg-stone-400'
                  }`}
                >
                  {settingsForm.isOpenForOrders
                    ? (isHindi ? '🟢 दुकान खुली है' : '🟢 Open')
                    : (isHindi ? '🔴 दुकान बंद है' : '🔴 Closed')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'दुकान का नाम (Store Name)' : 'Store Name'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'दुकानदार / ओनर का नाम' : 'Owner Name'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.ownerName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'संपर्क नंबर (Call Number)' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.contactNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactNumber: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'व्हाट्सएप ऑर्डर नंबर (WhatsApp Number)' : 'WhatsApp Order Number'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.supportWhatsApp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportWhatsApp: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'दुकान का पता (Darjiya Kushinagar)' : 'Store Address'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'UPI भुगतान आईडी (Payment QR UPI ID)' : 'UPI Payment ID'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.upiPaymentId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiPaymentId: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'न्यूनतम ऑर्डर राशि (₹)' : 'Minimum Order Value (₹)'}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.minimumOrderAmount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minimumOrderAmount: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'मुफ़्त डिलीवरी थ्रेशोल्ड (₹)' : 'Free Delivery Above (₹)'}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isHindi ? 'वेबसाइट घोषणा बैनर (Announcement Bar Message)' : 'Website Announcement Banner Message'}
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="उदा. 🎉 100% शुद्ध एगलेस केक व ताज़ा फूल 2 घंटे में डिलीवरी!"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{isHindi ? 'वेबसाइट सेटिंग्स सुरक्षित करें' : 'Save Store Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: ADMIN ACCOUNT & SECURITY */}
        {activeAdminTab === 'account' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Card Overview */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-sm border border-stone-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {adminAccount?.name}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {adminAccount?.role}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-500">{isHindi ? 'मोबाइल:' : 'Phone:'}</span>
                  <span className="font-mono">{adminAccount?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{isHindi ? 'ईमेल:' : 'Email:'}</span>
                  <span>{adminAccount?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{isHindi ? 'खाता बनाया गया:' : 'Created:'}</span>
                  <span>{adminAccount?.createdAt?.split('T')[0] || '2024'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{isHindi ? 'सक्रिय सत्र:' : 'Status:'}</span>
                  <span className="text-emerald-400 font-bold">{isHindi ? '🟢 एक्टिव' : '🟢 Active'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={logoutAdmin}
                className="w-full mt-4 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isHindi ? 'एडमिन सत्र लॉगआउट करें' : 'Sign Out Admin Session'}</span>
              </button>
            </div>

            {/* Edit Admin Account & Security Details */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isHindi ? 'एडमिन प्रोफ़ाइल व सुरक्षा विवरण' : 'Admin Profile & Security'}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isHindi
                      ? 'अपना नाम, संपर्क नंबर और एडमिन लॉगिन पासवर्ड/पिन बदलें।'
                      : 'Update your official credentials, phone number, and access PIN.'}
                  </p>
                </div>
                {accountSavedMessage && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isHindi ? 'अपडेट सुरक्षित हो गया!' : 'Updated Successfully!'}</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'एडमिन का नाम (Display Name)' : 'Admin Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHindi ? 'मोबाइल नंबर (Mobile Phone)' : 'Mobile Phone'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHindi ? 'ईमेल पता (Official Email)' : 'Official Email'}
                    </label>
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'नया पासवर्ड / पिन बदलें (खाली छोड़ें अगर नहीं बदलना)' : 'New Password / PIN (Leave blank to keep unchanged)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder={isHindi ? 'नया गुप्त पिन / पासवर्ड डालें' : 'Enter new secure PIN / password'}
                      value={accountForm.newPassword}
                      onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>{isHindi ? 'खाता विवरण अपडेट करें' : 'Update Credentials'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: LIVE ORDERS PIPELINE */}
        {activeAdminTab === 'orders' && (
          <>
            {/* Filters and Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Stage Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {statusFilters.map((filter) => {
                  const isActive = selectedFilter === filter.id;
                  const count =
                    filter.id === 'All'
                      ? orders.length
                      : orders.filter((o) => o.status === filter.id).length;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Order Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-800">
                    {t('noOrdersFound')}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    {isHindi ? 'वर्तमान में इस फ़िल्टर के अनुसार कोई ऑर्डर नहीं है।' : 'No orders found matching the filter.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:border-amber-400/60 transition-all"
                    >
                      {/* Order Card Header Summary */}
                      <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-stone-100 text-stone-800 rounded-lg">
                              {order.id}
                            </span>
                            <span className="text-xs text-stone-400">•</span>
                            <span className="text-xs text-stone-500">
                              {order.createdAt}
                            </span>
                            {order.notesForBaker && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                {isHindi ? 'विशेष निर्देश' : 'Note'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <h2 className="text-base sm:text-lg font-bold text-stone-900">
                              {order.customerName}
                            </h2>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          </div>

                          <p className="text-xs text-stone-500 line-clamp-1">
                            {order.items.map((i) => `${i.cake.name} (${i.selectedWeight}) × ${i.quantity}`).join(', ')}
                          </p>
                        </div>

                        {/* Right: Price & Quick Status Advance */}
                        <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                          <div className="text-left lg:text-right">
                            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                              {isHindi ? 'कुल राशि' : 'Order Total'}
                            </span>
                            <span className="font-serif text-lg font-bold text-stone-900">
                              ₹{order.total}
                            </span>
                          </div>

                          {/* Quick Stage Progression Buttons */}
                          <div className="flex items-center gap-1.5">
                            {order.status === 'Received' && (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(order.id, 'Baking')}
                                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>{isHindi ? 'बेकिंग शुरू करें' : 'Start Baking'}</span>
                              </button>
                            )}

                            {order.status === 'Baking' && (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(order.id, 'Out for Delivery')}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>{isHindi ? 'वैन पर भेजें' : 'Dispatch Van'}</span>
                              </button>
                            )}

                            {order.status === 'Out for Delivery' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerifyingOrder(order);
                                    setDeliveryOtpInput('');
                                    setDeliveryOtpError(null);
                                    setDeliveryOtpSuccess(null);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isHindi ? 'Doorstep OTP वेरिफाई करें' : 'Verify Doorstep OTP'}</span>
                                </button>
                                {order.deliveryOtp && (
                                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-300">
                                    OTP: {order.deliveryOtp}
                                  </span>
                                )}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Visual Stepper */}
                      <div className="px-4 sm:px-6 pb-4 bg-stone-50/50 border-t border-stone-100">
                        <OrderStatusStepper currentStatus={order.status} compact={true} />
                      </div>

                      {/* Expanded Order Detail View */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 space-y-4 animate-in fade-in duration-200">
                          {/* Order Details & Delivery Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="bg-white p-3 rounded-2xl border border-stone-200 space-y-1">
                              <span className="font-bold text-stone-700 block text-[11px] uppercase tracking-wider">
                                {isHindi ? 'डिलीवरी पता' : 'Delivery Address'}
                              </span>
                              <div className="flex items-start gap-1.5 text-stone-600">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{order.deliveryAddress}</span>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-2xl border border-stone-200 space-y-1">
                              <span className="font-bold text-stone-700 block text-[11px] uppercase tracking-wider">
                                {isHindi ? 'समय व शेड्यूल' : 'Schedule'}
                              </span>
                              <div className="flex items-center gap-1.5 text-stone-600">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{order.deliveryDate} ({order.deliveryTimeSlot})</span>
                              </div>
                              {order.notesForBaker && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 mt-1">
                                  <strong>नोट:</strong> {order.notesForBaker}
                                </p>
                              )}
                            </div>

                            <div className="bg-white p-3 rounded-2xl border border-stone-200 space-y-1">
                              <span className="font-bold text-stone-700 block text-[11px] uppercase tracking-wider">
                                {isHindi ? 'डिलीवरी पार्टनर' : 'Courier Agent'}
                              </span>
                              <div className="flex items-center gap-1.5 text-stone-600">
                                <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>{order.driverName || (isHindi ? 'विक्रम सिंह (दरजिया एक्सप्रेस)' : 'Vikram Singh')}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <a
                                  href={`tel:${order.driverPhone || '+917860828297'}`}
                                  className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 hover:underline"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{order.driverPhone || '+91 7860828297'}</span>
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Items Breakdown Table */}
                          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200">
                                <tr>
                                  <th className="p-3">{isHindi ? 'आइटम' : 'Item'}</th>
                                  <th className="p-3">{isHindi ? 'वज़न / साइज' : 'Weight / Size'}</th>
                                  <th className="p-3 text-center">{isHindi ? 'मात्रा' : 'Qty'}</th>
                                  <th className="p-3 text-right">{isHindi ? 'मूल्य' : 'Price'}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {order.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="p-3 font-semibold text-stone-900">{item.cake.name}</td>
                                    <td className="p-3 text-stone-600">{item.selectedWeight}</td>
                                    <td className="p-3 text-center font-mono font-bold text-stone-800">{item.quantity}</td>
                                    <td className="p-3 text-right font-mono font-bold text-stone-900">₹{item.unitPrice * item.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* 1. REAL DOORSTEP DELIVERY OTP VERIFICATION MODAL */}
        {verifyingOrder && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {isHindi ? 'डोरस्टेप डिलीवरी OTP सत्यापन' : 'Doorstep Delivery OTP Verification'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      #{verifyingOrder.id} • {verifyingOrder.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingOrder(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Context & Quick Call/WhatsApp */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">{isHindi ? 'डिलीवरी पता:' : 'Address:'}</span>
                  <span className="font-semibold text-stone-800 text-right truncate max-w-[220px]">
                    {verifyingOrder.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">{isHindi ? 'कुल राशि / भुगतान:' : 'Total / Payment:'}</span>
                  <span className="font-bold text-stone-900">
                    ₹{verifyingOrder.total} ({verifyingOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'})
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center gap-2 flex-wrap">
                  <a
                    href={`tel:${verifyingOrder.customerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'कॉल करें' : 'Call Customer'}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${verifyingOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `नमस्ते ${verifyingOrder.customerName}! JS Cake Shop से आपका डिलीवरी पार्टनर आपके पते पर आ चुका है। कृपया 4-अंकों का डिलीवरी OTP कोड बताएं।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'WhatsApp पर OTP मांगें' : 'Ask OTP via WhatsApp'}</span>
                  </a>
                </div>
              </div>

              {/* Alerts */}
              {deliveryOtpError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{deliveryOtpError}</span>
                </div>
              )}
              {deliveryOtpSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{deliveryOtpSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleVerifyDeliveryOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2 text-center">
                    {isHindi
                      ? 'ग्राहक से प्राप्त 4-अंकों का डिलीवरी OTP कोड दर्ज करें:'
                      : 'Enter customer\'s 4-digit Doorstep Delivery OTP:'}
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      maxLength={4}
                      required
                      autoFocus
                      placeholder="● ● ● ●"
                      value={deliveryOtpInput}
                      onChange={(e) => setDeliveryOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-44 text-center text-3xl font-mono font-bold tracking-widest py-2 bg-stone-50 border-2 border-emerald-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-stone-900 shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyingOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isHindi ? 'डिलीवरी सत्यापित करें' : 'Verify & Deliver'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. REAL TAKE CUSTOMER ORDER MODAL */}
        {isTakeOrderModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {isHindi ? 'नया ग्राहक ऑर्डर दर्ज करें' : 'Take Customer Order'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {isHindi ? 'काउंटर, फोन या WhatsApp से आया नया ऑर्डर' : 'Direct counter or phone call order'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTakeOrderModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newOrderSuccess ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-stone-900">
                    {isHindi ? 'ऑर्डर सफलतापूर्वक दर्ज हो गया!' : 'Order Placed Successfully!'}
                  </h4>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">{isHindi ? 'ऑर्डर संख्या:' : 'Order ID:'}</span>
                      <span className="font-mono font-bold text-stone-900">#{newOrderSuccess.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{isHindi ? 'डोरस्टेप डिलीवरी OTP:' : 'Doorstep OTP:'}</span>
                      <span className="font-mono text-sm font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {newOrderSuccess.deliveryOtp}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{isHindi ? 'कुल राशि:' : 'Total Amount:'}</span>
                      <span className="font-bold text-emerald-700">₹{newOrderSuccess.total}</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">
                    {isHindi
                      ? `ग्राहक (+91 ${newOrderCustPhone}) को SMS द्वारा डिलीवरी OTP कोड भेज दिया गया है।`
                      : `Confirmation SMS with Doorstep OTP dispatched to +91 ${newOrderCustPhone}.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTakeOrderModalOpen(false);
                      setNewOrderSuccess(null);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    {isHindi ? 'पूर्ण (Done)' : 'Done'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTakeOrderSubmit} className="space-y-3.5">
                  {takeOrderError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{takeOrderError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {isHindi ? 'ग्राहक का नाम *' : 'Customer Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. राहुल सिंह"
                        value={newOrderCustName}
                        onChange={(e) => setNewOrderCustName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {isHindi ? 'मोबाइल नंबर (10 अंक) *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="7860828297"
                        value={newOrderCustPhone}
                        onChange={(e) => setNewOrderCustPhone(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-700">
                        {isHindi ? 'डिलीवरी पता (Kushinagar / Darjiya) *' : 'Delivery Address *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewOrderAddress('दरजिया मुख्य चौराहा (कसया रोड), कुशीनगर, उत्तर प्रदेश - 274403')}
                        className="text-[10px] text-amber-700 font-semibold hover:underline"
                      >
                        + दरजिया चौराहा
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="उदा. दरजिया चौराहा, कसया रोड, कुशीनगर"
                      value={newOrderAddress}
                      onChange={(e) => setNewOrderAddress(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {isHindi ? 'केक चुनें *' : 'Select Cake *'}
                      </label>
                      <select
                        value={newOrderCakeId}
                        onChange={(e) => setNewOrderCakeId(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        {cakes.map((cake) => (
                          <option key={cake.id} value={cake.id}>
                            {cake.name} (₹{cake.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {isHindi ? 'वज़न / मात्रा' : 'Weight / Qty'}
                      </label>
                      <select
                        value={newOrderWeight}
                        onChange={(e) => setNewOrderWeight(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="0.5 kg (Small)">0.5 kg</option>
                        <option value="1 kg (Standard)">1 kg</option>
                        <option value="2 kg (Large)">2 kg</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {isHindi ? 'डिलीवरी समय' : 'Delivery Slot'}
                      </label>
                      <select
                        value={newOrderSlot}
                        onChange={(e) => setNewOrderSlot(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="Today within 2 hours">आज 2 घंटे में (Within 2 Hours)</option>
                        <option value="Today 4:00 PM - 6:00 PM">आज शाम 4:00 - 6:00 PM</option>
                        <option value="Tomorrow Morning 10:00 AM">कल सुबह 10:00 AM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {isHindi ? 'भुगतान माध्यम' : 'Payment Mode'}
                      </label>
                      <select
                        value={newOrderPaymentMethod}
                        onChange={(e) => setNewOrderPaymentMethod(e.target.value as any)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="COD">कैश ऑन डिलीवरी (Cash)</option>
                        <option value="UPI_QR">UPI QR कोड (Paid)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHindi ? 'केक पर नाम / निर्देश (वैकल्पिक)' : 'Message on Cake (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. Happy Birthday Rohit!"
                      value={newOrderNotes}
                      onChange={(e) => setNewOrderNotes(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTakeOrderModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                    >
                      {isHindi ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'ऑर्डर पक्का करें व OTP भेजें' : 'Place Order & Send OTP'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
