/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Bill, Customer, Product, ShopSettings, SyncLog } from './types';
import { db } from './services/db';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { ProductsView } from './components/ProductsView';
import { CustomersView } from './components/CustomersView';
import { SalesReportsView } from './components/SalesReportsView';
import { BillHistoryView } from './components/BillHistoryView';
import { BackupSyncView } from './components/BackupSyncView';
import { AndroidMobileView } from './components/AndroidMobileView';
import { SourceCodeHubView } from './components/SourceCodeHubView';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import {
  LayoutDashboard,
  Zap,
  Package,
  Users,
  BarChart3,
  Receipt,
  Server,
  FolderCode,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type DesktopTab =
  | 'dashboard'
  | 'billing'
  | 'products'
  | 'customers'
  | 'reports'
  | 'history'
  | 'sync';

export default function App() {
  // App Mode: Desktop POS | Mobile App | Deliverables Hub
  const [activeMode, setActiveMode] = useState<'desktop' | 'mobile' | 'deliverables'>('desktop');
  // Desktop Active Sub-tab
  const [activeTab, setActiveTab] = useState<DesktopTab>('billing');

  // Database State
  const [settings, setSettings] = useState<ShopSettings>(db.getSettings());
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(db.getCustomers());
  const [bills, setBills] = useState<Bill[]>(db.getBills());
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(db.getSyncLogs());

  // Receipt Modal State
  const [activeReceiptBill, setActiveReceiptBill] = useState<Bill | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Reload all data from local DB
  const refreshDatabaseState = useCallback(() => {
    setSettings(db.getSettings());
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());
    setBills(db.getBills());
    setSyncLogs(db.getSyncLogs());
  }, []);

  useEffect(() => {
    refreshDatabaseState();
  }, [refreshDatabaseState]);

  // Keyboard shortcut support for high-speed POS cashier operations:
  // F1: Dashboard, F2: Quick Bill, F3: Products, F4: History, F5: Reports
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('dashboard');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('products');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('history');
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleBillCreated = (newBill: Bill) => {
    refreshDatabaseState();
  };

  const handleOpenReceipt = (bill: Bill) => {
    setActiveReceiptBill(bill);
    setIsReceiptModalOpen(true);
  };

  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = db.syncWithShop(settings.shopId);
      setIsSyncing(false);
      refreshDatabaseState();
      setSyncToast(res.message);
      setTimeout(() => setSyncToast(null), 3000);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Main Navigation Header */}
      <Header
        settings={settings}
        activeMode={activeMode}
        onModeChange={(mode) => setActiveMode(mode)}
        onQuickSync={handleQuickSync}
        isSyncing={isSyncing}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col">
        {/* MODE 1: DESKTOP POS COUNTER */}
        {activeMode === 'desktop' && (
          <div className="flex-1 flex flex-col">
            {/* Desktop Navigation Sub-bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 sticky top-[57px] z-30 backdrop-blur-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'billing'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Quick Billing</span>
                    <span className="text-[10px] text-amber-200 bg-amber-700/60 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                      F2
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'products'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Products Inventory</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                      {products.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'history'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Bill History</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'customers'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Customers</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'reports'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Sales Reports</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('sync')}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'sync'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Backup & Sync</span>
                  </button>
                </nav>

                <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="font-mono text-amber-400 font-bold">
                    Next Bill: #{settings.invoicePrefix}{settings.nextInvoiceNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Tab Contents */}
            <main className="flex-1 pb-10">
              {activeTab === 'dashboard' && (
                <DashboardView
                  products={products}
                  customers={customers}
                  bills={bills}
                  settings={settings}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenReceipt={handleOpenReceipt}
                />
              )}

              {activeTab === 'billing' && (
                <BillingView
                  settings={settings}
                  products={products}
                  customers={customers}
                  onBillCreated={handleBillCreated}
                  onOpenReceipt={handleOpenReceipt}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView
                  products={products}
                  settings={settings}
                  onProductsUpdated={refreshDatabaseState}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  settings={settings}
                  onCustomersUpdated={refreshDatabaseState}
                />
              )}

              {activeTab === 'reports' && (
                <SalesReportsView
                  bills={bills}
                  products={products}
                  settings={settings}
                />
              )}

              {activeTab === 'history' && (
                <BillHistoryView
                  bills={bills}
                  settings={settings}
                  onOpenReceipt={handleOpenReceipt}
                />
              )}

              {activeTab === 'sync' && (
                <BackupSyncView
                  settings={settings}
                  syncLogs={syncLogs}
                  onSettingsUpdated={refreshDatabaseState}
                  onDatabaseRestored={refreshDatabaseState}
                />
              )}
            </main>
          </div>
        )}

        {/* MODE 2: ANDROID MOBILE SIMULATOR */}
        {activeMode === 'mobile' && (
          <main className="flex-1 pb-10">
            <AndroidMobileView
              products={products}
              customers={customers}
              bills={bills}
              settings={settings}
              onBillCreated={handleBillCreated}
              onOpenReceipt={handleOpenReceipt}
            />
          </main>
        )}

        {/* MODE 3: SOURCE CODE & DELIVERABLES HUB */}
        {activeMode === 'deliverables' && (
          <main className="flex-1 pb-10">
            <SourceCodeHubView />
          </main>
        )}
      </div>

      {/* Global Digital Receipt Modal (for WhatsApp sending, previewing, and SMS) */}
      <DigitalReceiptModal
        bill={activeReceiptBill}
        settings={settings}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Bottom Footer Status Bar */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>
              {settings.shopName} • Offline SQLite POS • Digital Bills via WhatsApp (Zero Printing • Non-GST)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span>Desktop: Python / CustomTkinter</span>
            <span>•</span>
            <span>Mobile: Flutter / Android</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-medium">SQLite Engine: Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
