import React, { useMemo } from 'react';
import { Bill, Customer, Product, ShopSettings } from '../types';
import {
  TrendingUp,
  Receipt,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Flame,
  PlusCircle,
  Eye,
  MessageCircle,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  products: Product[];
  customers: Customer[];
  bills: Bill[];
  settings: ShopSettings;
  onNavigate: (tab: 'billing' | 'products' | 'customers' | 'reports' | 'history' | 'sync') => void;
  onOpenReceipt: (bill: Bill) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  customers,
  bills,
  settings,
  onNavigate,
  onOpenReceipt,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's Sales
  const todaySales = useMemo(() => {
    return bills
      .filter((b) => b.date === todayStr)
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills, todayStr]);

  const todayBillsCount = useMemo(() => {
    return bills.filter((b) => b.date === todayStr).length;
  }, [bills, todayStr]);

  // Monthly Sales (last 30 days)
  const monthlySales = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return bills
      .filter((b) => b.date >= thirtyDaysAgo)
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStockAlert);
  }, [products]);

  // Best Selling Products
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    bills.forEach((b) => {
      b.items.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = { name: it.productName, qty: 0, revenue: 0 };
        }
        map[it.productId].qty += it.quantity;
        map[it.productId].revenue += it.total;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [bills]);

  // Recent 5 Bills
  const recentBills = useMemo(() => {
    return bills.slice(0, 5);
  }, [bills]);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-red-950 border border-amber-900/40 rounded-3xl p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Festival Season Ready</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {settings.shopId}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {settings.shopName}
            </h2>
            <p className="text-xs text-amber-200/80 max-w-xl mt-1">
              {settings.tagline} • Direct offline SQLite billing, instant WhatsApp invoices, and real-time inventory tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('billing')}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 px-5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-amber-950/60 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Bill</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl flex items-center space-x-2 transition-all border border-slate-700 cursor-pointer"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>{lowStockItems.length} cracker varieties</strong> are running low on stock (e.g.{' '}
              {lowStockItems.slice(0, 3).map((p) => p.name).join(', ')}).
            </span>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-amber-400 hover:text-white font-bold underline shrink-0 ml-2"
          >
            Review Inventory &rarr;
          </button>
        </div>
      )}

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {settings.currencySymbol}{todaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {todayBillsCount} bills generated today
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monthly Revenue</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {settings.currencySymbol}{monthlySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Last 30 days gross billing
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cracker Catalog</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {products.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Active products in SQLite
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {customers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Registered phone contacts
          </div>
        </div>
      </div>

      {/* Grid: Best Sellers & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Transactions (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Recent Bills & WhatsApp Memos</span>
            </span>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              View All ({bills.length}) &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {recentBills.map((b) => (
              <div
                key={b.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-400">
                      #{b.invoiceNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-white">{b.customerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {b.date} {b.time} • {b.items.length} items • {b.paymentMode}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-300 text-sm">
                      {settings.currencySymbol}{b.grandTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenReceipt(b)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="View Receipt"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {recentBills.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No bills generated yet. Click "Create New Bill" to begin!
              </div>
            )}
          </div>
        </div>

        {/* Top-Selling Fireworks (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Fast-Moving Crackers</span>
            </span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Full Report &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {bestSellers.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <div className="text-white font-medium truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.qty} units sold</div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-amber-300 shrink-0">
                  {settings.currencySymbol}{item.revenue.toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            {bestSellers.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No sales data yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
