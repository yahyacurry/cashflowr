import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Wallet, 
  Coins, 
  ArrowLeftRight,
  Info
} from 'lucide-react';
import { CurrencyCode, CURRENCY_SYMBOLS } from '../types';

interface LoginProps {
  onLogin: (name: string, isNewAccount?: boolean, initialBalance?: number, monthlyIncome?: number) => void;
  currency: CurrencyCode;
}

const getLocalAccounts = (): any[] => {
  const saved = localStorage.getItem('cashflowr_user_accounts');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  // Fallback / Initial seed
  const seeded = [
    {
      name: 'Yahya Ahmed',
      email: 'yahya@example.com',
      password: '123',
      transactions: [],
      goals: []
    },
    {
      name: 'Redux Wolverine',
      email: 'reduxwolverine@gmail.com',
      password: '123',
      transactions: [],
      goals: []
    }
  ];
  localStorage.setItem('cashflowr_user_accounts', JSON.stringify(seeded));
  return seeded;
};

const saveLocalAccounts = (accounts: any[]) => {
  localStorage.setItem('cashflowr_user_accounts', JSON.stringify(accounts));
};

export default function Login({ onLogin, currency }: LoginProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Basic Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Setup fields for Create Account
  const [startingBalance, setStartingBalance] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  
  // Statuses
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to proceed.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password to proceed.');
      return;
    }
    setError('');

    const accounts = getLocalAccounts();

    if (activeTab === 'signup') {
      const nameExists = accounts.some(
        (acc) => acc.name.toLowerCase() === name.trim().toLowerCase()
      );
      const emailExists = email.trim() && accounts.some(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (nameExists) {
        setError('Incorrect information provided: A user with this name already exists.');
        return;
      }
      if (emailExists) {
        setError('Incorrect information provided: A user with this email already exists.');
        return;
      }

      // Create new account
      const newAccount = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        transactions: [],
        goals: []
      };

      accounts.push(newAccount);
      saveLocalAccounts(accounts);

      const balanceVal = startingBalance ? parseFloat(startingBalance) : 0;
      const incomeVal = monthlyIncome ? parseFloat(monthlyIncome) : 0;
      onLogin(name.trim(), true, balanceVal, incomeVal);
    } else {
      // Login validation
      const matched = accounts.find(
        (acc) =>
          (acc.name.toLowerCase() === name.trim().toLowerCase() ||
           (acc.email && acc.email.toLowerCase() === name.trim().toLowerCase())) &&
          acc.password === password.trim()
      );

      if (!matched) {
        setError('Incorrect information provided.');
        return;
      }

      onLogin(matched.name, false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login-container">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="flex flex-col items-center justify-center text-center mb-6"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-950/50 mb-3.5 relative group">
            <TrendingUp className="h-7 w-7" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-2xl -z-10 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="font-display text-3.5xl font-black tracking-tight text-white">
            CashFlow<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">r</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-bold tracking-wide uppercase">
            Smart fintech companion & wealth tracker
          </p>
        </motion.div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-slate-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-[32px] border border-slate-800/80 backdrop-blur-md relative"
        >
          {/* Custom Slide-Toggle Tab Switcher */}
          <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-slate-850/80 flex items-center mb-8 relative">
            <div className="relative w-full grid grid-cols-2 text-center z-10">
              <button
                type="button"
                id="tab-login"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                id="tab-signup"
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
            
            {/* Sliding backdrop capsule */}
            <motion.div 
              className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-lg -z-0"
              animate={{ x: activeTab === 'login' ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/30 text-rose-400 text-xs font-semibold border border-rose-900/40 animate-shake">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="login-name"
                  name="name"
                  type="text"
                  required
                  placeholder={activeTab === 'login' ? 'e.g. Redux Wolverine' : 'e.g. Sarah Connor'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address <span className="text-[10px] text-slate-500 lowercase font-normal">(optional)</span>
              </label>
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-12 text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* CREATE ACCOUNT BUDGET CONFIGURATION (Only shown in Signup mode) */}
            <AnimatePresence initial={false}>
              {activeTab === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-800/80 pt-4.5 mt-4 space-y-4"
                >
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 flex items-start gap-3">
                    <Info className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">Initialize Clean Slate Ledger</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        This creates a pristine environment. Previous demo/stored expenses will be reset to establish your own budget.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="signup-balance" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Starting Balance ({currencySymbol})
                      </label>
                      <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <span className="text-xs font-extrabold text-indigo-400 font-mono">{currencySymbol}</span>
                        </div>
                        <input
                          id="signup-balance"
                          name="startingBalance"
                          type="number"
                          placeholder="e.g. 2500"
                          value={startingBalance}
                          onChange={(e) => setStartingBalance(e.target.value)}
                          className="block w-full rounded-2xl bg-transparent py-3 pl-8 pr-3 text-xs font-semibold text-slate-100 placeholder-slate-650 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-income" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Monthly Income ({currencySymbol})
                      </label>
                      <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <span className="text-xs font-extrabold text-emerald-400 font-mono">{currencySymbol}</span>
                        </div>
                        <input
                          id="signup-income"
                          name="monthlyIncome"
                          type="number"
                          placeholder="e.g. 4200"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          className="block w-full rounded-2xl bg-transparent py-3 pl-8 pr-3 text-xs font-semibold text-slate-100 placeholder-slate-650 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-login-submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-3.5 px-4 text-sm font-bold shadow-lg shadow-indigo-950/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{activeTab === 'login' ? 'Sign In' : 'Create Account & Start Fresh'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
