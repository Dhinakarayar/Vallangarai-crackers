export type CrackerCategory =
  | 'Sparklers'
  | 'Ground Chakkars'
  | 'Flower Pots'
  | 'Rockets'
  | 'Aerial / Multi-Shots'
  | 'Bombs & Bijili'
  | 'Garlands & Walas'
  | 'Gift Boxes'
  | 'Kids Novelty';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: CrackerCategory;
  price: number;
  stock: number;
  minStockAlert: number;
  unit: string; // e.g. "Box", "Pkt", "Piece"
  description?: string;
  updatedAt: string;
}

export interface BillItem {
  productId: string;
  productName: string;
  category: CrackerCategory;
  price: number;
  quantity: number;
  unit: string;
  total: number;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  items: BillItem[];
  subtotal: number;
  discount: number; // Flat discount amount (₹)
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI / GPay' | 'Card';
  notes?: string;
  syncStatus: 'synced' | 'pending';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalBills: number;
  totalSpent: number;
  lastVisit: string;
  createdAt: string;
}

export interface ShopSettings {
  shopId: string;
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappFooter: string;
  currencySymbol: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  syncEnabled: boolean;
  syncEndpoint: string;
  lastSyncedAt?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: 'PUSH' | 'PULL' | 'MERGE';
  status: 'SUCCESS' | 'CONFLICT_RESOLVED' | 'OFFLINE';
  details: string;
  recordsCount: number;
}
