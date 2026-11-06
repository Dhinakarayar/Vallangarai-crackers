import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Bill, BillItem, CrackerCategory, Customer, Product, ShopSettings } from '../types';
import { db } from '../services/db';
import { formatWhatsAppBill, formatSmsBill, getWhatsAppUrl, getSmsUrl } from '../services/whatsapp';
import confetti from 'canvas-confetti';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Share2,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BillingViewProps {
  settings: ShopSettings;
  products: Product[];
  customers: Customer[];
  onBillCreated: (bill: Bill) => void;
  onOpenReceipt: (bill: Bill) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  settings,
  products,
  customers,
  onBillCreated,
  onOpenReceipt,
}) => {
  // Billing Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI / GPay' | 'Card'>('Cash');
  const [cart, setCart] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(0);
  const [selectedProductForAdd, setSelectedProductForAdd] = useState<Product | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Phone auto-complete lookup
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 10) {
      const match = customers.find((c) => c.phone.replace(/\D/g, '') === clean);
      if (match && !customerName) {
        setCustomerName(match.name);
      }
    }
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  // Select first item on search change
  useEffect(() => {
    setActiveSearchIndex(0);
    if (filteredProducts.length > 0) {
      setSelectedProductForAdd(filteredProducts[0]);
    } else {
      setSelectedProductForAdd(null);
    }
  }, [searchQuery, selectedCategory, filteredProducts]);

  // Key navigation for fast POS billing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex((prev) => Math.min(prev + 1, filteredProducts.length - 1));
      setSelectedProductForAdd(filteredProducts[Math.min(activeSearchIndex + 1, filteredProducts.length - 1)]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex((prev) => Math.max(prev - 1, 0));
      setSelectedProductForAdd(filteredProducts[Math.max(activeSearchIndex - 1, 0)]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedProductForAdd) {
        handleAddProductToCart(selectedProductForAdd, addQuantity);
      }
    }
  };

  // Add product to cart
  const handleAddProductToCart = (prod: Product, qty: number = 1) => {
    if (qty <= 0) return;

    if (prod.stock <= 0) {
      showToast(`Warning: "${prod.name}" is out of stock!`);
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === prod.id);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total: newQty * prod.price,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            productId: prod.id,
            productName: prod.name,
            category: prod.category,
            price: prod.price,
            quantity: qty,
            unit: prod.unit,
            total: qty * prod.price,
          },
        ];
      }
    });

    showToast(`Added ${qty} ${prod.unit} of ${prod.name}`);
    setSearchQuery('');
    setAddQuantity(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const updateCartItemQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeCartItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        total: newQty * updated[index].price,
      };
      return updated;
    });
  };

  const removeCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearBill = () => {
    if (cart.length > 0 && !window.confirm('Are you sure you want to clear this bill?')) {
      return;
    }
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setNotes('');
    setSearchQuery('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculations
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.total, 0), [cart]);
  const grandTotal = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  // Save Bill Action
  const handleSaveBill = (openWhatsApp: boolean = false) => {
    if (cart.length === 0) {
      alert('Please add at least one cracker product to the bill.');
      return;
    }

    const { bill } = db.createBill({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      items: cart,
      subtotal,
      discount,
      grandTotal,
      paymentMode,
      notes: notes.trim() || undefined,
    });

    onBillCreated(bill);

    // Confetti celebration for festive cracker billing
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    if (openWhatsApp) {
      const whatsappText = formatWhatsAppBill(bill, settings);
      const url = getWhatsAppUrl(bill.customerPhone, whatsappText);
      window.open(url, '_blank');
      showToast(`Bill #${bill.invoiceNumber} saved! Opening WhatsApp...`);
    } else {
      showToast(`Bill #${bill.invoiceNumber} saved successfully to SQLite DB!`);
    }

    // Reset bill form for next customer
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setNotes('');
    setSearchQuery('');

    // Open receipt modal preview
    onOpenReceipt(bill);
  };

  const categories: Array<CrackerCategory | 'All'> = [
    'All',
    'Sparklers',
    'Ground Chakkars',
    'Flower Pots',
    'Rockets',
    'Aerial / Multi-Shots',
    'Bombs & Bijili',
    'Garlands & Walas',
    'Gift Boxes',
    'Kids Novelty',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT: Product Catalog & Smart Search (7 Cols on desktop) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Search & Quick Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Smart Cracker Search</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Type name or code • Arrow keys + Enter to add
            </span>
          </div>

          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search sparklers, flower pots, 1000 wala, bombs..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white px-4 py-3 pl-11 rounded-xl text-sm placeholder:text-slate-500 transition-all outline-none"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 mt-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white font-semibold shadow-sm shadow-amber-900/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results / Product Quick Picker Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
            <span>Available Crackers ({filteredProducts.length} items)</span>
            <span>Click card or use [+ Add] button</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredProducts.map((prod, idx) => {
              const isSelected = activeSearchIndex === idx;
              const isLowStock = prod.stock <= prod.minStockAlert;
              const isOutOfStock = prod.stock <= 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    setActiveSearchIndex(idx);
                    setSelectedProductForAdd(prod);
                  }}
                  onDoubleClick={() => handleAddProductToCart(prod, 1)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                          {prod.code}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{prod.category}</span>
                      </div>
                      <h4 className="font-semibold text-white text-xs leading-snug truncate" title={prod.name}>
                        {prod.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-amber-300 text-sm">
                        ₹{prod.price}
                      </div>
                      <span className="text-[10px] text-slate-400">/{prod.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80">
                    <span
                      className={`text-[11px] font-medium flex items-center space-x-1 ${
                        isOutOfStock
                          ? 'text-red-400'
                          : isLowStock
                          ? 'text-yellow-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                      <span>{prod.stock} {prod.unit}s left</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProductToCart(prod, 1);
                      }}
                      className="px-2.5 py-1 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No crackers found matching "{searchQuery}" in {selectedCategory}.</p>
                <p className="text-xs text-slate-600 mt-1">Try another keyword or switch category to 'All'.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Active Bill & WhatsApp Action Center (5 Cols on desktop) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {/* Customer & Bill Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-sm">New Digital Invoice</span>
            </div>
            <div className="font-mono text-xs text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md font-bold">
              {settings.invoicePrefix}{settings.nextInvoiceNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center space-x-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Customer Mobile *</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="10-digit number"
                className="w-full bg-slate-950 border border-slate-700 text-white px-2.5 py-1.5 rounded-lg text-xs placeholder:text-slate-500 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center space-x-1">
                <User className="w-3 h-3 text-blue-400" />
                <span>Customer Name</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full bg-slate-950 border border-slate-700 text-white px-2.5 py-1.5 rounded-lg text-xs placeholder:text-slate-500 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Current Cart Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Bill Items ({cart.length})
            </span>
            {cart.length > 0 && (
              <button
                onClick={handleClearBill}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2 pr-1">
            {cart.map((item, index) => (
              <div
                key={item.productId}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate leading-tight">
                    {item.productName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ₹{item.price} × {item.quantity} {item.unit}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-1 py-0.5 rounded-lg">
                  <button
                    onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-white px-1.5 min-w-[20px] text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[65px]">
                  <div className="font-bold text-amber-300">
                    ₹{item.total.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeCartItem(index)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-10 text-center text-slate-500">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="text-xs">No crackers added yet.</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Select crackers from the left list to start billing.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Calculation Summary (Non-GST) */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Festive Discount (₹):</span>
              </span>
              <input
                type="number"
                min="0"
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-20 bg-slate-950 border border-slate-700 text-right px-2 py-0.5 rounded text-white font-mono text-xs outline-none focus:border-amber-500"
              />
            </div>

            {/* Payment Mode Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Payment Mode:</span>
              <div className="flex space-x-1">
                {(['Cash', 'UPI / GPay', 'Card'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      paymentMode === mode
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Grand Total Highlight */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-sm font-extrabold text-white">GRAND TOTAL:</span>
                <span className="block text-[10px] text-emerald-400 font-medium">Non-GST Digital Bill</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => handleSaveBill(true)}
              disabled={cart.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                cart.length > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-950/50 cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Save & WhatsApp Digital Bill</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSaveBill(false)}
                disabled={cart.length === 0}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
              >
                <Save className="w-3.5 h-3.5 text-blue-400" />
                <span>Save Bill Only</span>
              </button>

              <button
                onClick={() => {
                  if (cart.length === 0) return;
                  const tempBill: Bill = {
                    id: 'temp',
                    invoiceNumber: `${settings.invoicePrefix}${settings.nextInvoiceNumber}`,
                    customerName: customerName || 'Walk-in Customer',
                    customerPhone: customerPhone || 'N/A',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0],
                    items: cart,
                    subtotal,
                    discount,
                    grandTotal,
                    paymentMode,
                    syncStatus: 'pending',
                    createdAt: new Date().toISOString(),
                  };
                  const sms = formatSmsBill(tempBill, settings);
                  navigator.clipboard.writeText(sms);
                  showToast('SMS text copied to clipboard!');
                }}
                disabled={cart.length === 0}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy SMS Text</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
