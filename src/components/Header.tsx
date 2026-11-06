import React, { useEffect, useState } from 'react';
import { ShopSettings } from '../types';
import { Flame, Monitor, Smartphone, FolderCode, RefreshCw, Database, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  settings: ShopSettings;
  activeMode: 'desktop' | 'mobile' | 'deliverables';
  onModeChange: (mode: 'desktop' | 'mobile' | 'deliverables') => void;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeMode,
  onModeChange,
  onQuickSync,
  isSyncing,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-40 select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-950/40">
            <Flame className="w-6 h-6 text-yellow-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white leading-none">
                {settings.shopName}
              </h1>
              <span className="bg-red-950/80 text-red-400 border border-red-800/60 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                Non-GST POS
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Mode Switcher: Desktop | Mobile | Source Code */}
        <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center shadow-inner">
          <button
            onClick={() => onModeChange('desktop')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'desktop'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop POS</span>
            <span className="sm:hidden">Desktop</span>
          </button>

          <button
            onClick={() => onModeChange('mobile')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'mobile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Android Mobile</span>
            <span className="sm:hidden">Mobile</span>
          </button>

          <button
            onClick={() => onModeChange('deliverables')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'deliverables'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FolderCode className="w-4 h-4" />
            <span className="hidden sm:inline">Source Code & ZIP</span>
            <span className="sm:hidden">Deliverables</span>
          </button>
        </div>

        {/* Status, Time & Sync */}
        <div className="flex items-center space-x-3 text-xs">
          {/* SQLite Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-emerald-400 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite Offline DB</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>

          {/* Shop ID */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
            <span className="text-slate-500">Shop ID:</span>
            <strong className="text-amber-400 font-mono text-[11px]">{settings.shopId}</strong>
          </div>

          {/* Sync Trigger */}
          <button
            onClick={onQuickSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
            title="Synchronize data between Desktop & Mobile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Clock */}
          <div className="hidden xl:block font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
};
