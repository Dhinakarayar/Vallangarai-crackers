import React, { useState } from 'react';
import { ShopSettings, SyncLog } from '../types';
import { db } from '../services/db';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Server,
  FileCode,
  FileJson
} from 'lucide-react';

interface BackupSyncViewProps {
  settings: ShopSettings;
  syncLogs: SyncLog[];
  onSettingsUpdated: () => void;
  onDatabaseRestored: () => void;
}

export const BackupSyncView: React.FC<BackupSyncViewProps> = ({
  settings,
  syncLogs,
  onSettingsUpdated,
  onDatabaseRestored,
}) => {
  const [shopIdInput, setShopIdInput] = useState(settings.shopId);
  const [shopNameInput, setShopNameInput] = useState(settings.shopName);
  const [phoneInput, setPhoneInput] = useState(settings.phone);
  const [taglineInput, setTaglineInput] = useState(settings.tagline);
  const [whatsappFooterInput, setWhatsappFooterInput] = useState(settings.whatsappFooter);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.setSettings({
      ...settings,
      shopId: shopIdInput.trim() || 'SIVAKASI-CRACKERS-789',
      shopName: shopNameInput.trim() || 'VALLANGARAI Crackers',
      phone: phoneInput.trim() || '9842154321',
      tagline: taglineInput.trim() || '',
      whatsappFooter: whatsappFooterInput.trim() || '',
    });
    setSyncStatusMsg({ type: 'success', text: 'Shop settings updated successfully!' });
    setTimeout(() => setSyncStatusMsg(null), 3000);
    onSettingsUpdated();
  };

  // Download SQL Script
  const handleDownloadSQL = () => {
    const sql = db.generateSQLiteDump();
    const blob = new Blob([sql], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crackers_shop_backup_${settings.shopId}_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download JSON Backup
  const handleDownloadJSON = () => {
    const jsonStr = db.generateBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crackers_shop_full_db_${settings.shopId}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore Backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = db.restoreFromJSON(content);
      if (res.success) {
        setSyncStatusMsg({ type: 'success', text: res.message });
        onDatabaseRestored();
      } else {
        setSyncStatusMsg({ type: 'error', text: res.message });
      }
      setTimeout(() => setSyncStatusMsg(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Run Synchronization
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    setTimeout(() => {
      const res = db.syncWithShop(shopIdInput);
      setIsSyncing(false);
      if (res.success) {
        setSyncStatusMsg({ type: 'success', text: res.message });
      } else {
        setSyncStatusMsg({ type: 'error', text: res.message });
      }
      onSettingsUpdated();
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }, 800);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset database to authentic Sivakasi sample catalog? All current custom bills will be reset.')) {
      db.resetToDefault();
      onDatabaseRestored();
      setSyncStatusMsg({ type: 'success', text: 'Reset to Sivakasi standard catalog successfully.' });
      setTimeout(() => setSyncStatusMsg(null), 3000);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-5">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-amber-400" />
            <span>Database Backup, Restore & Multi-Device Sync</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronize between Windows Desktop and Android Mobile using your unique Shop ID, with full SQLite backup and restore.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing...' : 'Sync Desktop & Mobile'}</span>
        </button>
      </div>

      {syncStatusMsg && (
        <div
          className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
            syncStatusMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border border-red-800 text-red-300'
          }`}
        >
          {syncStatusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      {/* Grid: Backup & Sync Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Backup & Restore Actions (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Offline Database Backup & Restore</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Export your full database with all crackers products, customers, bills, and pricing histories. Files can be kept on a USB drive or restored anytime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* SQLite Dump Button */}
              <button
                onClick={handleDownloadSQL}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700/80 p-3.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <FileCode className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>
                <div className="font-bold text-white text-xs">Download SQLite SQL Dump</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Complete .sql file with DDL and INSERT statements
                </div>
              </button>

              {/* JSON Backup Button */}
              <button
                onClick={handleDownloadJSON}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700/80 p-3.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <FileJson className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs">Download JSON Backup</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Universal JSON backup with all tables & settings
                </div>
              </button>
            </div>

            {/* Restore File Input */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Restore Database From Backup (.json)</span>
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Restoring overwrites or merges data safely with validation.
              </span>
            </div>

            {/* Reset to Default */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleResetDefaults}
                className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Sivakasi Sample Catalog</span>
              </button>
            </div>
          </div>

          {/* Sync Engine Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
              <span>Sync Audit Logs</span>
              <span className="text-emerald-400 font-mono text-[11px]">Last: {settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleTimeString() : 'Ready'}</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto text-[11px] font-mono">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">{log.timestamp}</span>
                      <span className="text-amber-400 font-bold">[{log.action}]</span>
                      <span className="text-emerald-400">STATUS: {log.status}</span>
                    </div>
                    <div className="text-slate-300 text-[10px] font-sans">{log.details}</div>
                  </div>
                  <span className="text-slate-500 text-[10px] shrink-0 font-bold">
                    {log.recordsCount} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Shop ID & Configuration (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Shop ID & Invoicing Configuration</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            {/* Shop ID */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Unique Shop ID (Shared across Desktop & Mobile) *
              </label>
              <input
                type="text"
                required
                value={shopIdInput}
                onChange={(e) => setShopIdInput(e.target.value.toUpperCase())}
                placeholder="e.g. SIVAKASI-CRACKERS-789"
                className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 uppercase"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Enter the exact same Shop ID on your Android mobile device to sync the same stock and sales data.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Shop Display Name *
              </label>
              <input
                type="text"
                required
                value={shopNameInput}
                onChange={(e) => setShopNameInput(e.target.value)}
                placeholder="e.g. VALLANGARAI Crackers"
                className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={taglineInput}
                onChange={(e) => setTaglineInput(e.target.value)}
                placeholder="Standard Fireworks & Sparklers - Sivakasi Agency"
                className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Shop Helpline / WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="9842154321"
                className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                WhatsApp Bill Footer Note
              </label>
              <input
                type="text"
                value={whatsappFooterInput}
                onChange={(e) => setWhatsappFooterInput(e.target.value)}
                placeholder="Wishing you a Safe & Sparkly Diwali! 🎆✨"
                className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-amber-950/40 cursor-pointer"
              >
                Save Shop Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
