export type OrderStatus = 'Received' | 'Baking' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface CakeSizeOption {
  id: string;
  label: string;
  serves: string;
  extraPrice: number;
}

export interface CakeFlavorOption {
  id: string;
  name: string;
  description: string;
}

export interface CakeIcingOption {
  id: string;
  name: string;
  description: string;
  extraPrice?: number;
}

export type ProductCategory =
  | 'Pineapple Cakes'
  | 'Rasmalai & Fusion Cakes'
  | 'Black Forest Cakes'
  | 'Butterscotch Cakes'
  | 'Chocolate Cakes'
  | 'Red Velvet Cakes'
  | 'Fresh Fruit Cakes'
  | 'Fresh Flowers'
  | 'Combos';

export interface Cake {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory | string;
  rating: number;
  reviewsCount: number;
  prepTimeHours: number;
  weights: string[]; // fallback
  sizeOptions?: CakeSizeOption[];
  flavors?: string[];
  flavorOptions?: CakeFlavorOption[];
  icingOptions?: CakeIcingOption[];
  isChefSpecial?: boolean;
  itemType?: 'cake' | 'flower' | 'combo';
}

export interface CartItem {
  id: string; // unique cart item id
  cake: Cake;
  quantity: number;
  selectedWeight: string;
  selectedFlavor?: string;
  selectedIcing?: string;
  unitPrice: number;
  customMessage?: string;
  specialInstructions?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
  completed: boolean;
  actor?: string; // e.g., "Master Baker Liam", "Driver Alex"
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  estimatedDeliveryTime?: string;
  notesForBaker?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryOtp?: string;
  paymentMethod?: 'UPI_QR' | 'COD';
  paymentStatus?: 'PAID' | 'PENDING_ON_DELIVERY';
  upiTransactionRef?: string;
}

export interface ToastNotification {
  id: string;
  orderId: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  title: string;
  message: string;
  customerName: string;
  timestamp: string;
  actor?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  defaultAddress: string;
  memberSince: string;
  loyaltyPoints: number;
  isLoggedIn: boolean;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Store Manager' | 'Kitchen Lead';
  password: string; // PIN or Password
  createdAt: string;
  lastLoginAt: string;
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  contactNumber: string;
  supportWhatsApp: string;
  address: string;
  isOpenForOrders: boolean;
  announcementText: string;
  minimumOrderAmount: number;
  deliveryRadiusKm: number;
  freeDeliveryThreshold: number;
  upiPaymentId: string;
}

