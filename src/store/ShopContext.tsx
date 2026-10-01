import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cake, CartItem, Order, OrderStatus, OrderTimelineEvent, UserProfile, ToastNotification, AdminAccount, StoreSettings } from '../types';
import { INITIAL_CAKES, INITIAL_ORDERS } from '../data/cakes';
import { smsService } from '../services/smsService';

export interface AddToCartCustomConfig {
  selectedWeight: string;
  selectedFlavor?: string;
  selectedIcing?: string;
  customMessage?: string;
  specialInstructions?: string;
  unitPrice?: number;
  quantity?: number;
}

export interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  notesForBaker?: string;
  paymentMethod?: 'UPI_QR' | 'COD';
  paymentStatus?: 'PAID' | 'PENDING_ON_DELIVERY';
  upiTransactionRef?: string;
}

interface ShopContextType {
  cakes: Cake[];
  cart: CartItem[];
  orders: Order[];
  userProfile: UserProfile;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  sendOtp: (identifier: string) => { success: boolean; otp: string; message: string };
  verifyOtpAndLogin: (params: {
    identifier: string;
    otp: string;
    name?: string;
    deliveryAddress?: string;
    isSignUp?: boolean;
  }) => { success: boolean; message: string };
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  logout: () => void;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  updateCakePrice: (cakeId: string, newPrice: number) => void;
  resetCakePrices: () => void;
  addToCart: (
    cake: Cake,
    configOrWeight?: string | AddToCartCustomConfig,
    customMessage?: string,
    specialInstructions?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (data: PlaceOrderInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, actor?: string) => void;
  advanceOrderStep: (orderId: string) => OrderStatus | null;
  verifyDeliveryOtp: (orderId: string, enteredOtp: string) => { success: boolean; message: string };
  resetDemoOrders: () => void;
  getOrderById: (orderId: string) => Order | undefined;
  adminAccount: AdminAccount | null;
  isAdminLoggedIn: boolean;
  createAdminAccount: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'Owner' | 'Store Manager' | 'Kitchen Lead';
  }) => { success: boolean; message: string };
  loginAdmin: (passwordOrPin: string, usernameOrEmail?: string) => { success: boolean; message: string };
  loginAdminWithOtp: (phone: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  updateAdminAccount: (data: Partial<AdminAccount>) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
}

const LOCAL_STORAGE_ORDERS_KEY = 'js_cake_shop_orders_kushinagar_v4';
const LOCAL_STORAGE_CART_KEY = 'js_cake_shop_cart_kushinagar_v4';
const LOCAL_STORAGE_CAKES_KEY = 'js_cake_shop_cakes_india_v5_sections';
const LOCAL_STORAGE_USER_KEY = 'js_cake_shop_user_profile_kushinagar_v5';
const LOCAL_STORAGE_ADMIN_ACCOUNT_KEY = 'js_cake_shop_admin_account_v2';
const LOCAL_STORAGE_ADMIN_SESSION_KEY = 'js_cake_shop_admin_session_v2';
const LOCAL_STORAGE_STORE_SETTINGS_KEY = 'js_cake_shop_store_settings_v2';

const DEFAULT_ADMIN: AdminAccount = {
  id: 'admin-master-1',
  name: 'JS Cake Shop Admin',
  email: 'admin@jscakeshop.in',
  phone: '+91 7860828297',
  role: 'Owner',
  password: '7860',
  createdAt: '2024-01-01',
  lastLoginAt: '2024-10-01T00:00:00.000Z',
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'JS Cake Shop & Fresh Flowers',
  ownerName: 'JS Bakery Lead',
  contactNumber: '+91 7860828297',
  supportWhatsApp: '+91 7860828297',
  address: 'दरजिया मुख्य चौराहा (कसया रोड), कुशीनगर, उत्तर प्रदेश - 274403',
  isOpenForOrders: true,
  announcementText: '🎉 100% शुद्ध शाकाहारी (Eggless) फ्रेश केक व ताज़ा फूल उपलब्ध! 2 घंटे में डिलीवरी।',
  minimumOrderAmount: 250,
  deliveryRadiusKm: 25,
  freeDeliveryThreshold: 499,
  upiPaymentId: '7860828297@upi',
};

const DEFAULT_USER: UserProfile = {
  id: 'cust-demo-1',
  name: 'अमित कुमार (Amit Kumar)',
  email: 'amit.kushinagar@example.in',
  phone: '+91 7860828297',
  defaultAddress: '',
  memberSince: 'October 2024',
  loyaltyPoints: 340,
  isLoggedIn: true,
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const STAGES_ORDER: OrderStatus[] = ['Received', 'Baking', 'Out for Delivery', 'Delivered'];

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cakes, setCakes] = useState<Cake[]>(() => {
    try {
      // Clear legacy storage keys that held outdated cake data
      [
        'js_cake_shop_cakes',
        'js_cake_shop_cakes_v2',
        'js_cake_shop_cakes_kushinagar',
        'js_cake_shop_cakes_kushinagar_v2',
        'js_cake_shop_cakes_kushinagar_v3',
      ].forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // Ignore
        }
      });

      const saved = localStorage.getItem(LOCAL_STORAGE_CAKES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasNewCategories =
          Array.isArray(parsed) &&
          parsed.some((c) => c.category === 'Pineapple Cakes') &&
          parsed.some((c) => c.category === 'Rasmalai & Fusion Cakes');

        if (hasNewCategories) return parsed;
      }
    } catch {
      // Ignore
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_CAKES_KEY, JSON.stringify(INITIAL_CAKES));
    } catch {
      // Ignore
    }

    return INITIAL_CAKES;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_USER;
  });

  const [adminAccount, setAdminAccount] = useState<AdminAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN_ACCOUNT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_ADMIN;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STORE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeOtps, setActiveOtps] = useState<Record<string, string>>({});

  const sendOtp = (identifier: string): { success: boolean; otp: string; message: string } => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, otp: '', message: 'कृपया मोबाइल नंबर या ईमेल दर्ज करें।' };
    }
    // Generate secure randomized 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtps((prev) => ({ ...prev, [cleanId]: code }));

    const isEmail = cleanId.includes('@');
    return {
      success: true,
      otp: code,
      message: isEmail
        ? `वेरिफिकेशन कोड ${code} आपके ईमेल (${cleanId}) पर भेज दिया गया है।`
        : `वेरिफिकेशन कोड ${code} आपके मोबाइल नंबर (${cleanId}) पर भेज दिया गया है।`,
    };
  };

  const verifyOtpAndLogin = (params: {
    identifier: string;
    otp: string;
    name?: string;
    deliveryAddress?: string;
    isSignUp?: boolean;
  }): { success: boolean; message: string } => {
    const cleanId = params.identifier.trim();
    const cleanOtp = params.otp.trim();
    const expectedOtp = activeOtps[cleanId];

    if (!expectedOtp || cleanOtp !== expectedOtp) {
      return {
        success: false,
        message: 'गलत OTP कोड! कृपया प्राप्त 6 अंकों का सही OTP कोड दर्ज करें।',
      };
    }

    const isEmail = cleanId.includes('@');
    const updatedProfile: UserProfile = {
      id: userProfile.id || `cust-${Date.now()}`,
      name:
        params.name?.trim() ||
        userProfile.name ||
        (isEmail ? cleanId.split('@')[0] : 'ग्राहक (Customer)'),
      email: isEmail ? cleanId : userProfile.email || 'customer@kushinagar.in',
      phone: !isEmail ? cleanId : userProfile.phone || '+91 7860828297',
      defaultAddress: params.deliveryAddress?.trim() || userProfile.defaultAddress || '',
      memberSince: userProfile.memberSince || 'October 2024',
      loyaltyPoints: userProfile.loyaltyPoints || 250,
      isLoggedIn: true,
    };

    setUserProfile(updatedProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedProfile));
    } catch {
      // Ignore
    }
    setIsAuthModalOpen(false);

    return {
      success: true,
      message: `नमस्ते ${updatedProfile.name}! आपका प्रोफ़ाइल सफलतापूर्वक वेरिफाई व लॉग इन हो गया है।`,
    };
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const logout = () => {
    setUserProfile((prev) => {
      const next = { ...prev, isLoggedIn: false };
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const createAdminAccount = (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'Owner' | 'Store Manager' | 'Kitchen Lead';
  }): { success: boolean; message: string } => {
    const newAdmin: AdminAccount = {
      id: `admin-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: data.role || 'Owner',
      password: data.password.trim(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setAdminAccount(newAdmin);
    setIsAdminLoggedIn(true);

    try {
      localStorage.setItem(LOCAL_STORAGE_ADMIN_ACCOUNT_KEY, JSON.stringify(newAdmin));
      localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
    } catch {
      // Ignore
    }

    return {
      success: true,
      message: `एडमिन अकाउंट '${newAdmin.name}' सफलतापूर्वक बन गया और लॉगिन हो गया!`,
    };
  };

  const loginAdmin = (
    passwordOrPin: string,
    usernameOrEmail?: string
  ): { success: boolean; message: string } => {
    const cleanPass = passwordOrPin.trim();
    const currentAdmin = adminAccount || DEFAULT_ADMIN;

    const matchesPass = cleanPass === currentAdmin.password;

    let matchesUser = true;
    if (usernameOrEmail && usernameOrEmail.trim()) {
      const u = usernameOrEmail.trim().toLowerCase();
      const currentPhone = currentAdmin.phone?.replace(/\D/g, '') || '';
      matchesUser =
        u === currentAdmin.email.toLowerCase() ||
        u === currentAdmin.phone.toLowerCase() ||
        (cleanPass && u === currentPhone) ||
        u === 'admin' ||
        u === currentAdmin.name.toLowerCase();
    }

    if (matchesPass && matchesUser) {
      const updated = { ...currentAdmin, lastLoginAt: new Date().toISOString() };
      setAdminAccount(updated);
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_ADMIN_ACCOUNT_KEY, JSON.stringify(updated));
        localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
      } catch {
        // Ignore
      }
      return { success: true, message: `नमस्ते ${updated.name}! एडमिन पैनल में आपका स्वागत है।` };
    }

    return {
      success: false,
      message: 'गलत पासवर्ड / पिन! कृपया सही एडमिन पासवर्ड दर्ज करें।',
    };
  };

  const loginAdminWithOtp = (phone: string): { success: boolean; message: string } => {
    const currentAdmin = adminAccount || DEFAULT_ADMIN;
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91 ${cleanPhone}`;
    const updated = {
      ...currentAdmin,
      phone: currentAdmin.phone || formattedPhone,
      lastLoginAt: new Date().toISOString(),
    };
    setAdminAccount(updated);
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_ADMIN_ACCOUNT_KEY, JSON.stringify(updated));
      localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
    } catch {
      // Ignore
    }
    return { success: true, message: `नमस्ते ${updated.name}! एडमिन पैनल में आपका स्वागत है।` };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const updateAdminAccount = (data: Partial<AdminAccount>) => {
    setAdminAccount((prev) => {
      const base = prev || DEFAULT_ADMIN;
      const next = { ...base, ...data };
      try {
        localStorage.setItem(LOCAL_STORAGE_ADMIN_ACCOUNT_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const updateStoreSettings = (settings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const next = { ...prev, ...settings };
      try {
        localStorage.setItem(LOCAL_STORAGE_STORE_SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const updateCakePrice = (cakeId: string, newPrice: number) => {
    setCakes((prev) => {
      const updated = prev.map((c) => (c.id === cakeId ? { ...c, price: Math.max(0, newPrice) } : c));
      try {
        localStorage.setItem(LOCAL_STORAGE_CAKES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const resetCakePrices = () => {
    setCakes(INITIAL_CAKES);
    try {
      localStorage.removeItem(LOCAL_STORAGE_CAKES_KEY);
    } catch {
      // Ignore
    }
  };

  // Initialize cart from localStorage if available
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize orders from localStorage if available, or fallback to INITIAL_ORDERS
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_ORDERS;
  });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllToasts = () => setToasts([]);

  const triggerStatusToast = (
    orderId: string,
    newStatus: OrderStatus,
    previousStatus?: OrderStatus,
    orderData?: Order,
    customNote?: string,
    actor?: string
  ) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let title = `Order #${orderId} Updated`;
    let defaultMessage = `Your order status has changed to ${newStatus}.`;

    if (newStatus === 'Received') {
      title = `Order #${orderId} Confirmed & Queued`;
      defaultMessage = 'Your order is verified and ingredients are being measured in the bakehouse.';
    } else if (newStatus === 'Baking') {
      title = `Order #${orderId} is now in the Oven!`;
      defaultMessage = 'Pastry chefs have preheated ovens and are baking your fresh sponge layers.';
    } else if (newStatus === 'Out for Delivery') {
      title = `Order #${orderId} is Out for Delivery!`;
      defaultMessage = `Your cake is in a chilled temperature-monitored vehicle with driver ${orderData?.driverName || 'Alex Bennett'}.`;
    } else if (newStatus === 'Delivered') {
      title = `Order #${orderId} Delivered Fresh!`;
      defaultMessage = `Safely handed over at ${orderData?.deliveryAddress || 'your address'}. Bon Appétit!`;
    } else if (newStatus === 'Cancelled') {
      title = `Order #${orderId} Cancelled`;
      defaultMessage = customNote || 'Order was cancelled by the bakery manager or customer request.';
    }

    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      previousStatus,
      newStatus,
      title,
      message: customNote || defaultMessage,
      customerName: orderData?.customerName || 'Customer',
      timestamp: formattedTime,
      actor: actor || 'Bakery Dispatch',
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep max 4 toasts
  };

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_ORDERS_KEY && e.newValue) {
        try {
          const updatedOrders: Order[] = JSON.parse(e.newValue);
          const changedNotifications: {
            orderId: string;
            newStatus: OrderStatus;
            oldStatus?: OrderStatus;
            orderData: Order;
          }[] = [];

          setOrders((currentOrders) => {
            updatedOrders.forEach((newOrder) => {
              const oldOrder = currentOrders.find((o) => o.id === newOrder.id);
              if (oldOrder && oldOrder.status !== newOrder.status) {
                changedNotifications.push({
                  orderId: newOrder.id,
                  newStatus: newOrder.status,
                  oldStatus: oldOrder.status,
                  orderData: newOrder,
                });
              }
            });
            return updatedOrders;
          });

          changedNotifications.forEach((n) => {
            triggerStatusToast(
              n.orderId,
              n.newStatus,
              n.oldStatus,
              n.orderData,
              undefined,
              'Bakery Dispatch'
            );
          });
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  const addToCart = (
    cake: Cake,
    configOrWeight?: string | AddToCartCustomConfig,
    customMessageParam = '',
    specialInstructionsParam = ''
  ) => {
    let weight = cake.weights[0] || 'Standard';
    let flavor = cake.flavorOptions?.[0]?.name || 'Signature Recipe';
    let icing = cake.icingOptions?.[0]?.name || 'Swiss Meringue Buttercream';
    let message = customMessageParam;
    let instructions = specialInstructionsParam;
    let unitPrice = cake.price;
    let qty = 1;

    if (typeof configOrWeight === 'object' && configOrWeight !== null) {
      weight = configOrWeight.selectedWeight || weight;
      flavor = configOrWeight.selectedFlavor || flavor;
      icing = configOrWeight.selectedIcing || icing;
      message = configOrWeight.customMessage || '';
      instructions = configOrWeight.specialInstructions || '';
      unitPrice = configOrWeight.unitPrice ?? cake.price;
      qty = configOrWeight.quantity || 1;
    } else if (typeof configOrWeight === 'string') {
      weight = configOrWeight;
    }

    const cartItemId = `${cake.id}-${weight}-${flavor}-${icing}-${message.trim().toLowerCase()}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          cake,
          quantity: qty,
          selectedWeight: weight,
          selectedFlavor: flavor,
          selectedIcing: icing,
          unitPrice,
          customMessage: message.trim(),
          specialInstructions: instructions.trim(),
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = (data: PlaceOrderInput): Order => {
    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice || item.cake.price) * item.quantity, 0);
    const deliveryFee = cart.length > 0 ? (subtotal >= (storeSettings?.freeDeliveryThreshold || 499) ? 0 : 50) : 0;
    const total = subtotal + deliveryFee;

    const newOrderId = `JS-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const newTimeline: OrderTimelineEvent[] = [
      {
        status: 'Received',
        timestamp: `${formattedTime}, ${formattedDate}`,
        title: 'Order Confirmed',
        description: 'Order registered in bakery kitchen and scheduled with pastry team.',
        completed: true,
        actor: 'Bakery Automated Queue',
      },
      {
        status: 'Baking',
        timestamp: 'Estimated 30-45 mins',
        title: 'Baking & Handcrafting',
        description: 'Fresh eggless sponge baking, chilled layering, and bespoke icing.',
        completed: false,
      },
      {
        status: 'Out for Delivery',
        timestamp: 'Temperature-controlled Van Dispatch',
        title: 'Out for Delivery',
        description: 'Chilled delivery van en route. Customer OTP verification required.',
        completed: false,
      },
      {
        status: 'Delivered',
        timestamp: 'Upon delivery',
        title: 'Delivered Fresh & Verified',
        description: 'Doorstep handover verified via 4-digit Delivery OTP.',
        completed: false,
      },
    ];

    const newOrder: Order = {
      id: newOrderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      deliveryDate: data.deliveryDate || 'Today',
      deliveryTimeSlot: data.deliveryTimeSlot || '3:00 PM - 5:00 PM',
      items: [...cart],
      subtotal,
      deliveryFee,
      total,
      status: 'Received',
      deliveryOtp,
      paymentMethod: data.paymentMethod || 'UPI_QR',
      paymentStatus: data.paymentStatus || (data.paymentMethod === 'COD' ? 'PENDING_ON_DELIVERY' : 'PAID'),
      upiTransactionRef: data.upiTransactionRef,
      timeline: newTimeline,
      createdAt: now.toISOString(),
      estimatedDeliveryTime: 'Today within 2 hours',
      notesForBaker: data.notesForBaker,
      driverName: 'विक्रम सिंह (दरजिया एक्सप्रेस)',
      driverPhone: '+91 7860828297',
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Trigger real SMS delivery confirmation
    smsService.sendOrderPlacedSms({
      toPhone: data.customerPhone,
      orderId: newOrderId,
      total,
      deliveryOtp,
      customerName: data.customerName,
      deliverySlot: data.deliveryTimeSlot,
    }).catch(() => {});

    return newOrder;
  };

  const verifyDeliveryOtp = (orderId: string, enteredOtp: string): { success: boolean; message: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'ऑर्डर नहीं मिला!' };

    if (order.deliveryOtp && order.deliveryOtp === enteredOtp.trim()) {
      updateOrderStatus(orderId, 'Delivered', 'Doorstep OTP Verified Successfully', 'Delivery Partner Vikram');
      smsService.sendOrderDeliveredSms({
        toPhone: order.customerPhone,
        orderId: order.id,
        customerName: order.customerName,
      }).catch(() => {});

      return { success: true, message: `डिलीवरी OTP सत्यापित हो गया! ऑर्डर #${orderId} सफलतापूर्वक डिलीवर हुआ।` };
    }

    return { success: false, message: 'गलत डिलीवरी OTP कोड! कृपया ग्राहक से 4 अंकों का सही OTP प्राप्त करें।' };
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    actor?: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.status !== newStatus) {
      triggerStatusToast(orderId, newStatus, targetOrder.status, targetOrder, note, actor);
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeStampStr = `${formattedTime}, ${formattedDate}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        // If cancelled
        if (newStatus === 'Cancelled') {
          return {
            ...order,
            status: 'Cancelled',
            timeline: [
              ...order.timeline,
              {
                status: 'Cancelled',
                timestamp: timeStampStr,
                title: 'Order Cancelled',
                description: note || 'Order was cancelled by bakery manager or customer request.',
                completed: true,
                actor: actor || 'Bakery Management',
              },
            ],
          };
        }

        // Determine step index
        const targetIndex = STAGES_ORDER.indexOf(newStatus);

        const updatedTimeline: OrderTimelineEvent[] = STAGES_ORDER.map((stage, idx) => {
          const existing = order.timeline.find((t) => t.status === stage);
          const isTarget = stage === newStatus;
          const isPast = idx < targetIndex;
          const isCompleted = idx <= targetIndex;

          let title = existing?.title || stage;
          let description = existing?.description || '';
          let timestamp = existing?.timestamp || 'Pending';

          if (isTarget) {
            timestamp = timeStampStr;
            if (stage === 'Received') {
              title = 'Order Received & Confirmed';
              description = note || 'Confirmed and queued in the bakehouse.';
            } else if (stage === 'Baking') {
              title = 'In the Oven & Decoration';
              description = note || 'Bakers are handcrafting layers, frosting, and topping fresh.';
            } else if (stage === 'Out for Delivery') {
              title = 'Out for Delivery';
              description = note || `Van dispatched with chilled storage box. Driver: ${order.driverName || 'Alex Bennett'}.`;
            } else if (stage === 'Delivered') {
              title = 'Delivered to Customer';
              description = note || 'Successfully handed over at the destination. Enjoy!';
            }
          } else if (isPast && (!existing || !existing.completed)) {
            timestamp = existing?.timestamp || timeStampStr;
          }

          return {
            status: stage,
            title,
            description,
            timestamp,
            completed: isCompleted,
            actor: isTarget ? actor || existing?.actor : existing?.actor,
          };
        });

        let updatedEst = order.estimatedDeliveryTime;
        if (newStatus === 'Delivered') {
          updatedEst = `Delivered at ${formattedTime}`;
        } else if (newStatus === 'Out for Delivery') {
          updatedEst = 'Estimated in 20-30 mins';
        }

        return {
          ...order,
          status: newStatus,
          timeline: updatedTimeline,
          estimatedDeliveryTime: updatedEst,
        };
      })
    );
  };

  const advanceOrderStep = (orderId: string): OrderStatus | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === 'Cancelled' || order.status === 'Delivered') return null;

    const currentIndex = STAGES_ORDER.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < STAGES_ORDER.length - 1) {
      const nextStatus = STAGES_ORDER[currentIndex + 1];
      updateOrderStatus(orderId, nextStatus);
      return nextStatus;
    }
    return null;
  };

  const resetDemoOrders = () => {
    setOrders(INITIAL_ORDERS);
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    } catch {
      // Ignore
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  return (
    <ShopContext.Provider
      value={{
        cakes,
        cart,
        orders,
        userProfile,
        isLoggedIn: userProfile.isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        sendOtp,
        verifyOtpAndLogin,
        updateUserProfile,
        logout,
        toasts,
        dismissToast,
        clearAllToasts,
        updateCakePrice,
        resetCakePrices,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        advanceOrderStep,
        verifyDeliveryOtp,
        resetDemoOrders,
        getOrderById,
        adminAccount,
        isAdminLoggedIn,
        createAdminAccount,
        loginAdmin,
        loginAdminWithOtp,
        logoutAdmin,
        updateAdminAccount,
        storeSettings,
        updateStoreSettings,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
