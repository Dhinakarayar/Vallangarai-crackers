import React, { useState } from 'react';
import { Bill, BillItem, Customer, Product, ShopSettings } from '../types';
import { db } from '../services/db';
import { formatWhatsAppBill, formatSmsBill, getWhatsAppUrl } from '../services/whatsapp';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  Search,
  Plus,
  Minus,
  Trash2,
  Share2,
  Flashlight,
  Receipt,
  Package,
  BarChart3,
  Flame,
  CheckCircle2,
  Sparkles,
  Wifi,
  Battery,
  ShoppingBag,
  ExternalLink,
  Phone
} from 'lucide-react';

interface AndroidMobileViewProps {
  products: Product[];
  customers: Customer[];
  bills: Bill[];
  settings: ShopSettings;
  onBillCreated: (bill: Bill) => void;
  onOpenReceipt: (bill: Bill) => void;
}

export const AndroidMobileView: React.FC<AndroidMobileViewProps> = ({
  products,
  customers,
  bills,
  settings,
  onBillCreated,
  onOpenReceipt,
}) => {
  const [mobileTab, setMobileTab] = useState<'bill' | 'products' | 'history' | 'reports'>('bill');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const subtotal = cart.reduce((sum, it) => sum + it.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleAddToCart = (p: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === p.id);
      if (idx >= 0) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + 1;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
          total: newQty * p.price,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: p.id,
          productName: p.name,
          category: p.category,
          price: p.price,
          quantity: 1,
          unit: p.unit,
          total: p.price,
        },
      ];
    });

    setToast(`Added ${p.name}`);
    setTimeout(() => setToast(null), 1500);
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== idx);
      }
      updated[idx] = {
        ...updated[idx],
        quantity: newQty,
        total: newQty * updated[idx].price,
      };
      return updated;
    });
  };

  const handleSaveAndWhatsApp = () => {
    if (cart.length === 0) return;

    const { bill } = db.createBill({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      items: cart,
      subtotal,
      discount,
      grandTotal,
      paymentMode: 'Cash',
    });

    onBillCreated(bill);

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    const whatsappText = formatWhatsAppBill(bill, settings);
    const url = getWhatsAppUrl(bill.customerPhone, whatsappText);
    window.open(url, '_blank');

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setIsCartOpen(false);
    onOpenReceipt(bill);
  };

  const categories = ['All', 'Sparklers', 'Ground Chakkars', 'Flower Pots', 'Rockets', 'Bombs & Bijili'];

  return (
    <div className="py-6 flex flex-col items-center justify-center">
      {/* Device frame banner */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-white text-base flex items-center justify-center space-x-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>Android Mobile POS Interface (Flutter Simulation)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Fully operational touch-friendly mobile billing with offline SQLite and direct WhatsApp sharing.
        </p>
      </div>

      {/* Android Device Mockup */}
      <div className="relative w-[375px] h-[780px] bg-slate-950 border-[10px] border-slate-800 rounded-[48px] shadow-2xl overflow-hidden flex flex-col select-none ring-1 ring-slate-700/50">
        {/* Top Camera Notch & Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
        </div>

        {/* Android Status Bar */}
        <div className="pt-3 px-6 pb-1 bg-slate-900 flex justify-between items-center text-[11px] font-mono text-slate-400 z-40">
          <span>10:30 AM</span>
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Mobile App Bar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between z-30">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center shadow-sm">
              <Flame className="w-4 h-4 text-yellow-100" />
            </div>
            <div>
              <div className="font-bold text-white text-xs leading-none truncate max-w-[170px]">
                {settings.shopName}
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                {settings.invoicePrefix}{settings.nextInvoiceNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-mono">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-emerald-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg text-center animate-in fade-in">
            {toast}
          </div>
        )}

        {/* Scrollable Mobile Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-3 pb-24 text-white text-xs">
          {mobileTab === 'bill' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search crackers..."
                  className="w-full bg-slate-900 border border-slate-800 text-white pl-8 pr-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Category Chips */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Cards List */}
              <div className="space-y-2">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-[11px] truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span className="font-bold text-amber-300 font-mono">₹{p.price}</span>
                        <span>•</span>
                        <span>Stock: {p.stock}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
                      className="px-2.5 py-1 bg-amber-600 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow-sm shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mobileTab === 'products' && (
            <div className="space-y-2">
              <div className="font-bold text-white text-xs mb-2">
                All Inventory ({products.length} Products)
              </div>
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-semibold text-white text-[11px]">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.category} • ₹{p.price}/{p.unit}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.stock <= p.minStockAlert ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' : 'bg-emerald-950 text-emerald-400'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}

          {mobileTab === 'history' && (
            <div className="space-y-2">
              <div className="font-bold text-white text-xs mb-2">
                Saved Invoices ({bills.length})
              </div>
              {bills.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onOpenReceipt(b)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex justify-between items-center text-xs cursor-pointer active:bg-slate-800"
                >
                  <div>
                    <div className="font-mono font-bold text-amber-400 text-[11px]">
                      #{b.invoiceNumber}
                    </div>
                    <div className="text-[10px] text-slate-400">{b.customerName} • {b.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">₹{b.grandTotal}</div>
                    <div className="text-[9px] text-emerald-400">WhatsApp Ready</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mobileTab === 'reports' && (
            <div className="space-y-3">
              <div className="font-bold text-white text-xs">Mobile Sales Overview</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total Sales</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                    ₹{bills.reduce((s, b) => s + b.grandTotal, 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total Bills</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {bills.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide-up Cart / Checkout Sheet */}
        {isCartOpen && (
          <div className="absolute inset-x-0 bottom-14 max-h-[480px] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 shadow-2xl z-40 flex flex-col animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-xs">Current Bill ({cart.length} items)</span>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 text-xs hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2 my-2.5">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Mobile *"
                className="bg-slate-950 border border-slate-800 text-white text-[11px] px-2 py-1.5 rounded-lg"
              />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="bg-slate-950 border border-slate-800 text-white text-[11px] px-2 py-1.5 rounded-lg"
              />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-40 my-1 pr-1">
              {cart.map((item, idx) => (
                <div
                  key={item.productId}
                  className="bg-slate-950 p-2 rounded-lg flex items-center justify-between text-[11px]"
                >
                  <div className="truncate flex-1 pr-1">
                    <div className="text-white truncate font-medium">{item.productName}</div>
                    <div className="text-[9px] text-slate-400">₹{item.price} x {item.quantity}</div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateCartQty(idx, -1)}
                      className="p-1 bg-slate-800 rounded"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-mono font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(idx, 1)}
                      className="p-1 bg-slate-800 rounded"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Cart is empty. Add crackers first!
                </div>
              )}
            </div>

            {/* Total and WhatsApp Save Button */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Grand Total:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={handleSaveAndWhatsApp}
                disabled={cart.length === 0}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/60"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Save & WhatsApp Bill</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-slate-900 border-t border-slate-800 grid grid-cols-4 items-center z-50 text-[10px]">
          <button
            onClick={() => {
              setMobileTab('bill');
              setIsCartOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              mobileTab === 'bill' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Flashlight className="w-4 h-4 mb-0.5" />
            <span>Quick Bill</span>
          </button>

          <button
            onClick={() => {
              setMobileTab('products');
              setIsCartOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              mobileTab === 'products' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            <span>Crackers</span>
          </button>

          <button
            onClick={() => {
              setMobileTab('history');
              setIsCartOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              mobileTab === 'history' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Receipt className="w-4 h-4 mb-0.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => {
              setMobileTab('reports');
              setIsCartOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              mobileTab === 'reports' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span>Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
