import React from 'react';
import { X, LayoutDashboard, Calendar, Trophy, BarChart3, TrendingUp, LogOut, Sparkles } from 'lucide-react';
import { ActivePage, CurrencyCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  userName: string;
  onLogout?: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  isPro: boolean;
}

export default function Sidebar({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  userName,
  onLogout,
  currency,
  onCurrencyChange,
  isPro
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as ActivePage, label: 'Calendar Tracker', icon: Calendar },
    { id: 'goals' as ActivePage, label: 'Savings Goals', icon: Trophy },
    { id: 'insights' as ActivePage, label: 'Analytics Insights', icon: BarChart3 },
    { id: 'penny' as ActivePage, label: 'Ask Penny AI', icon: Sparkles }
  ];

  const getInitials = (name: string) => {
    if (!name) return 'YA';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" id="sidebar-container">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            id="sidebar-backdrop"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ translateX: '-100%' }}
            animate={{ translateX: 0 }}
            exit={{ translateX: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative flex h-full w-[290px] flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/80 p-8 text-white shadow-2xl overflow-y-auto custom-sidebar-scrollbar"
            id="sidebar-drawer"
          >
            {/* Logo/Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl">
                  {/* Outer glowing border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-xs opacity-60" />
                  
                  {/* Inner dark card casing */}
                  <div className="absolute inset-[1.5px] bg-slate-950 rounded-[10px] flex items-center justify-center z-10">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <h1 className="font-display text-2xl font-black tracking-tight text-white">
                    CashFlow<span className="text-indigo-400">r</span>
                  </h1>
                </div>
              </div>
              <button
                id="btn-close-sidebar"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile widget */}
            <div className="mb-8 rounded-[24px] bg-slate-950/40 p-4 border border-slate-850">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white font-bold font-display text-sm shadow-md shadow-indigo-950/50">
                    {getInitials(userName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-100 truncate">{userName}</h4>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Premium Member ✨
                    </p>
                  </div>
                </div>
                {onLogout && (
                  <button
                    id="btn-sidebar-logout"
                    onClick={onLogout}
                    title="Log Out"
                    className="p-2 rounded-lg text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition-all cursor-pointer flex-shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Currency Change Widget */}
            <div className="mb-8 rounded-[24px] bg-slate-900/60 p-4.5 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2.5">
                Currency Settings
              </span>
              <div className="relative">
                <select
                  id="select-display-currency"
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="w-full bg-slate-950 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-800 hover:border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
                >
                  <option value="USD">🇺🇸 USD ($)</option>
                  <option value="EUR">🇪🇺 EUR (€)</option>
                  <option value="GBP">🇬🇧 GBP (£)</option>
                  <option value="JPY">🇯🇵 JPY (¥)</option>
                  <option value="CAD">🇨🇦 CAD (CA$)</option>
                  <option value="AUD">🇦🇺 AUD (A$)</option>
                  <option value="INR">🇮🇳 INR (₹)</option>
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex-1 space-y-2">
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Main Menu
              </span>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 font-bold shadow-xs'
                        : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Upgrade section */}
            <div className="mt-auto pt-6 border-t border-slate-800/60">
              <div className="rounded-3xl bg-emerald-950/20 p-5 border border-emerald-900/30 text-white text-center">
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1 font-bold">✨ Premium Account Active</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">Enjoy your unlimited access to insights and Penny AI!</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
