import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck, Sparkles, Star, Zap, Landmark, ArrowLeft } from 'lucide-react';
import { CurrencyCode, CURRENCY_SYMBOLS } from '../types';

interface UpgradeViewProps {
  isPro: boolean;
  onUpgradeSuccess: (proState: boolean) => void;
  onBackToDashboard: () => void;
  currency: CurrencyCode;
}

export default function UpgradeView({ isPro, onUpgradeSuccess, onBackToDashboard, currency }: UpgradeViewProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpgrade = () => {
    setIsUpgrading(true);
    // Simulate premium payment processing
    setTimeout(() => {
      setIsUpgrading(false);
      setShowSuccess(true);
      onUpgradeSuccess(true);
    }, 1800);
  };

  const handleDowngrade = () => {
    // Optional refund / fallback simulation
    if (confirm("Are you sure you want to cancel your Pro membership? This will disable Analytics Insights and Penny AI chatbot.")) {
      onUpgradeSuccess(false);
      alert("Your Pro membership has been cancelled. You are back on the Free tier.");
    }
  };

  const freeBenefits = [
    'Real-time transaction ledger tracking',
    'Calendar expense visualizer & date sync',
    'Standard savings goals (up to 3 goals)',
    'Secure offline-first client-side storage',
  ];

  const proBenefits = [
    'Access to Analytical Insights (Category & daily velocity plots)',
    'Ask Penny AI (Your personal budgeting co-pilot chatbot)',
    'Real-time transaction memory context for chatbot',
    'Dynamic cashflow recommendation engine & alert flags',
    'Premium aesthetic styling & unlimited savings goal targets',
  ];

  return (
    <div className="space-y-8" id="upgrade-view-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors mb-3 cursor-pointer"
            id="btn-back-from-upgrade"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            Pricing Plans
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Choose the ledger tier that fits your smart savings speed
          </p>
        </div>

        {/* Billing cycle toggle */}
        {!isPro && !showSuccess && (
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-900 self-start md:self-auto" id="billing-toggle">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Yearly
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                Save 30%
              </span>
            </button>
          </div>
        )}
      </div>

      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-emerald-900/40 bg-emerald-950/10 p-8 text-center max-w-xl mx-auto space-y-6 shadow-2xl relative overflow-hidden"
          id="upgrade-success-card"
        >
          {/* Ambient celebration glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xl font-extrabold text-white">Welcome to CashFlowr Pro! 🎉</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your premium billing credentials have been configured successfully. All features have been fully unlocked.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-left space-y-2 text-xs text-slate-400">
            <div className="flex justify-between font-bold text-slate-200 border-b border-slate-850 pb-2">
              <span>Selected Tier:</span>
              <span className="text-indigo-400 font-mono">Pro Plan ({billingCycle})</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Status:</span>
              <span className="text-emerald-400 font-extrabold">ACTIVE • PREMIUM INSTANT</span>
            </div>
            <div className="flex justify-between">
              <span>Unlocked:</span>
              <span>Analytical Insights, Chatbot Penny, Smart Tips</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              Review Plans
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/60 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="plans-grid">
          {/* FREE PLAN BOX */}
          <div className="rounded-[32px] bg-slate-900 p-8 border border-slate-800/80 flex flex-col justify-between shadow-md relative" id="plan-card-free">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-black text-white">Free Plan</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Standard Ledger</p>
                </div>
                {(!isPro) && (
                  <span className="bg-indigo-950/60 text-indigo-400 border border-indigo-900/40 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-white">{currencySymbol}0</span>
                <span className="text-xs text-slate-500 font-bold">/ forever</span>
              </div>

              <div className="border-t border-slate-850 pt-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Benefits</p>
                <ul className="space-y-3">
                  {freeBenefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                disabled
                className="w-full py-3.5 rounded-2xl bg-slate-950 text-slate-500 text-xs font-bold border border-slate-850 text-center opacity-60"
              >
                {isPro ? 'Free Tier' : 'Your Active Plan'}
              </button>
            </div>
          </div>

          {/* PRO PLAN BOX */}
          <div className="rounded-[32px] bg-slate-900 p-8 border-2 border-indigo-500 relative flex flex-col justify-between shadow-xl" id="plan-card-pro">
            {/* Best value tag */}
            <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[9px] px-3.5 py-1 rounded-full font-black uppercase tracking-widest shadow-md flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" /> Recommended
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-black text-white flex items-center gap-1.5">
                    Pro Plan <Zap className="h-4.5 w-4.5 text-indigo-400 fill-indigo-400" />
                  </h3>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Smart Co-Pilot Ledger</p>
                </div>
                {isPro && (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                    Active Plan
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-white">
                  {currencySymbol}
                  {billingCycle === 'monthly' ? '5.99' : '49.99'}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  / {billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <div className="border-t border-slate-850 pt-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Premium Benefits</p>
                <ul className="space-y-3">
                  {proBenefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              {isPro ? (
                <button
                  onClick={handleDowngrade}
                  className="w-full py-3.5 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-950/60 active:scale-[0.98] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpgrading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Contacting Bank API...
                    </>
                  ) : (
                    `Unlock Pro Plan ($${billingCycle === 'monthly' ? '5.99/mo' : '49.99/yr'})`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trust seal footer */}
      <div className="rounded-[24px] bg-slate-900/40 border border-slate-850 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <Landmark className="h-5 w-5 text-slate-400" />
          <div>
            <p className="font-bold text-slate-300">Bank-Grade Sandbox Encryption</p>
            <p className="text-[10px]">Your personal tokens are simulated locally inside your sandbox workspace.</p>
          </div>
        </div>
        <div className="text-right sm:max-w-xs">
          <p className="font-semibold text-slate-400">Cancel or upgrade anytime</p>
          <p className="text-[10px]">No hidden transaction margins or credit report pulling.</p>
        </div>
      </div>
    </div>
  );
}
