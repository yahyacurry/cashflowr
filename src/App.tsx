import React, { useState, useEffect } from 'react';
import { ActivePage, Transaction, SavingsGoal, CurrencyCode } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import GoalsView from './components/GoalsView';
import InsightsView from './components/InsightsView';
import PennyView from './components/PennyView';
import UpgradeView from './components/UpgradeView';
import AddTransactionModal from './components/AddTransactionModal';
import Login from './components/Login';
import { Menu, Plus, TrendingUp, Sparkles, User, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-seeded Initial Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    title: 'Monthly Salary',
    amount: 4200.00,
    type: 'income',
    category: 'Salary',
    date: '2026-07-01',
    notes: 'Primary monthly pay stub'
  },
  {
    id: 't2',
    title: 'Whole Foods Weekly',
    amount: 142.50,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-07-01',
    notes: 'Organic groceries for the week'
  },
  {
    id: 't3',
    title: 'Electricity Bill',
    amount: 118.90,
    type: 'expense',
    category: 'Housing & Utilities',
    date: '2026-06-30'
  },
  {
    id: 't4',
    title: 'Starbucks Coffee',
    amount: 6.75,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-06-29'
  },
  {
    id: 't5',
    title: 'Uber Ride',
    amount: 18.50,
    type: 'expense',
    category: 'Transport',
    date: '2026-06-28'
  },
  {
    id: 't6',
    title: 'Netflix Subscription',
    amount: 15.49,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-06-27'
  },
  {
    id: 't7',
    title: 'Dinner with Friends',
    amount: 84.20,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-06-25'
  },
  {
    id: 't8',
    title: 'Weekly Groceries',
    amount: 115.30,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-06-22'
  },
  {
    id: 't9',
    title: 'Freelance Logo Project',
    amount: 650.00,
    type: 'income',
    category: 'Freelance',
    date: '2026-06-20'
  },
  {
    id: 't10',
    title: 'Target Home Goods',
    amount: 54.10,
    type: 'expense',
    category: 'Shopping',
    date: '2026-06-18'
  },
  {
    id: 't11',
    title: 'Gas Refuel',
    amount: 45.00,
    type: 'expense',
    category: 'Transport',
    date: '2026-06-15'
  }
];

const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'g1',
    name: 'Tesla Model Y Fund',
    targetAmount: 45000,
    currentAmount: 12500,
    targetDate: '2027-12-31',
    category: 'Car',
    color: '#3b82f6'
  },
  {
    id: 'g2',
    name: 'Emergency Nest Egg',
    targetAmount: 10000,
    currentAmount: 6500,
    targetDate: '2026-10-15',
    category: 'Emergency',
    color: '#10b981'
  },
  {
    id: 'g3',
    name: 'Japan Adventure 2027',
    targetAmount: 6000,
    currentAmount: 2400,
    targetDate: '2027-04-30',
    category: 'Travel',
    color: '#f43f5e'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('cashflowr_user');
  });
  const [isPro, setIsPro] = useState<boolean>(() => {
    const user = localStorage.getItem('cashflowr_user');
    if (user) {
      const savedAccounts = localStorage.getItem('cashflowr_user_accounts');
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts);
          const matched = accounts.find((acc: any) => acc.name.toLowerCase() === user.toLowerCase() || (acc.email && acc.email.toLowerCase() === user.toLowerCase()));
          if (matched && matched.isPro !== undefined) return matched.isPro;
        } catch (e) {}
      }
    }
    return localStorage.getItem('cashflowr_is_pro') === 'true';
  });

  const handleUpgradeSuccess = (proState: boolean) => {
    setIsPro(proState);
    localStorage.setItem('cashflowr_is_pro', proState ? 'true' : 'false');
    if (currentUser) {
      const accounts = getUserAccounts();
      const updated = accounts.map((acc: any) => {
        if (acc.name.toLowerCase() === currentUser.toLowerCase() || (acc.email && acc.email.toLowerCase() === currentUser.toLowerCase())) {
          return { ...acc, isPro: proState };
        }
        return acc;
      });
      saveUserAccounts(updated);
    }
  };

  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPrefilledDate, setModalPrefilledDate] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('cashflowr_currency') as CurrencyCode) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('cashflowr_currency', currency);
  }, [currency]);

  const getUserAccounts = () => {
    const saved = localStorage.getItem('cashflowr_user_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const seeded = [
      {
        name: 'Yahya Ahmed',
        email: 'yahya@example.com',
        password: '123',
        transactions: INITIAL_TRANSACTIONS,
        goals: INITIAL_GOALS
      },
      {
        name: 'Redux Wolverine',
        email: 'reduxwolverine@gmail.com',
        password: '123',
        transactions: INITIAL_TRANSACTIONS,
        goals: INITIAL_GOALS
      }
    ];
    localStorage.setItem('cashflowr_user_accounts', JSON.stringify(seeded));
    return seeded;
  };

  const saveUserAccounts = (accounts: any[]) => {
    localStorage.setItem('cashflowr_user_accounts', JSON.stringify(accounts));
  };

  const handleLogin = (name: string, isNewAccount?: boolean, initialBalance?: number, monthlyIncome?: number) => {
    setCurrentUser(name);
    localStorage.setItem('cashflowr_user', name);

    const accounts = getUserAccounts();

    if (isNewAccount) {
      const newTxs: Transaction[] = [];
      const nowStr = new Date().toISOString().split('T')[0];
      
      if (initialBalance !== undefined && initialBalance > 0) {
        newTxs.push({
          id: `t_balance_${Date.now()}`,
          title: 'Starting Balance',
          amount: initialBalance,
          type: 'income',
          category: 'Salary',
          date: nowStr,
          notes: 'Initial starting funds entered during account creation'
        });
      }
      
      if (monthlyIncome !== undefined && monthlyIncome > 0) {
        newTxs.push({
          id: `t_income_${Date.now() + 1}`,
          title: 'Monthly Income',
          amount: monthlyIncome,
          type: 'income',
          category: 'Salary',
          date: nowStr,
          notes: 'Expected monthly income entered during account creation'
        });
      }
      
      setTransactions(newTxs);
      setGoals([]);
      setIsPro(false);
      localStorage.setItem('cashflowr_is_pro', 'false');
      
      localStorage.setItem('cashflowr_transactions', JSON.stringify(newTxs));
      localStorage.setItem('cashflowr_goals', JSON.stringify([]));

      const updated = accounts.map(acc => {
        if (acc.name.toLowerCase() === name.toLowerCase()) {
          return { ...acc, transactions: newTxs, goals: [], isPro: false };
        }
        return acc;
      });
      saveUserAccounts(updated);
    } else {
      const userAcc = accounts.find(
          (acc) =>
              acc.name.toLowerCase() === name.toLowerCase() ||
              (acc.email && acc.email.toLowerCase() === name.toLowerCase())
      );
      if (userAcc) {
        setTransactions(userAcc.transactions || []);
        setGoals(userAcc.goals || []);
        const userPro = userAcc.isPro || false;
        setIsPro(userPro);
        localStorage.setItem('cashflowr_is_pro', userPro ? 'true' : 'false');
        localStorage.setItem('cashflowr_transactions', JSON.stringify(userAcc.transactions || []));
        localStorage.setItem('cashflowr_goals', JSON.stringify(userAcc.goals || []));
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cashflowr_user');
    localStorage.removeItem('cashflowr_transactions');
    localStorage.removeItem('cashflowr_goals');
    localStorage.removeItem('cashflowr_is_pro');
    setTransactions([]);
    setGoals([]);
    setIsPro(false);
    setIsSidebarOpen(false);
  };

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const user = localStorage.getItem('cashflowr_user');
    if (user) {
      const savedAccounts = localStorage.getItem('cashflowr_user_accounts');
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts);
          const matched = accounts.find((acc: any) => acc.name.toLowerCase() === user.toLowerCase());
          if (matched && matched.transactions) return matched.transactions;
        } catch (e) {}
      }
    }
    const saved = localStorage.getItem('cashflowr_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Goals State
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const user = localStorage.getItem('cashflowr_user');
    if (user) {
      const savedAccounts = localStorage.getItem('cashflowr_user_accounts');
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts);
          const matched = accounts.find((acc: any) => acc.name.toLowerCase() === user.toLowerCase());
          if (matched && matched.goals) return matched.goals;
        } catch (e) {}
      }
    }
    const saved = localStorage.getItem('cashflowr_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // Sync back to local storage and user database
  useEffect(() => {
    localStorage.setItem('cashflowr_transactions', JSON.stringify(transactions));
    if (currentUser) {
      const accounts = getUserAccounts();
      const updated = accounts.map((acc: any) => {
        if (acc.name.toLowerCase() === currentUser.toLowerCase() || (acc.email && acc.email.toLowerCase() === currentUser.toLowerCase())) {
          return { ...acc, transactions };
        }
        return acc;
      });
      saveUserAccounts(updated);
    }
  }, [transactions, currentUser]);

  useEffect(() => {
    localStorage.setItem('cashflowr_goals', JSON.stringify(goals));
    if (currentUser) {
      const accounts = getUserAccounts();
      const updated = accounts.map((acc: any) => {
        if (acc.name.toLowerCase() === currentUser.toLowerCase() || (acc.email && acc.email.toLowerCase() === currentUser.toLowerCase())) {
          return { ...acc, goals };
        }
        return acc;
      });
      saveUserAccounts(updated);
    }
  }, [goals, currentUser]);

  // Transaction Actions
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transactionWithId: Transaction = {
      ...newTx,
      id: `t_${Date.now()}`
    };
    setTransactions((prev) => [transactionWithId, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Goal Actions
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goalWithId: SavingsGoal = {
      ...newGoal,
      id: `g_${Date.now()}`
    };
    setGoals((prev) => [...prev, goalWithId]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateGoalAmount = (id: string, newAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g))
    );
  };

  // Pre-fill date and open modal
  const handleOpenAddOnDate = (date: string) => {
    setModalPrefilledDate(date);
    setIsModalOpen(true);
  };

  const handleOpenAddGeneric = () => {
    setModalPrefilledDate(undefined);
    setIsModalOpen(true);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} currency={currency} />;
  }

  const getUserInitials = (name: string) => {
    if (!name) return 'CF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden" id="app-root">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* GLOBAL HEADER BAR */}
      <header 
        className="sticky top-0 z-40 bg-slate-900/60 border-b border-slate-850/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between"
        id="app-header"
      >
        <div className="flex items-center gap-3">
          {/* Hamburger Menu trigger */}
          <button
            id="btn-hamburger"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div 
            onClick={() => setActivePage('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            id="header-logo-container"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl group-hover:scale-105 transition-all duration-300">
              {/* Outer glowing border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Inner dark card casing */}
              <div className="absolute inset-[1.5px] bg-slate-950 rounded-[10px] flex items-center justify-center z-10">
                <TrendingUp className="h-5 w-5 text-indigo-400 group-hover:text-cyan-400 transition-colors duration-300" />
              </div>
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors duration-200">
                CashFlow<span className="text-indigo-400">r</span>
              </span>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button
            id="header-btn-quick-add"
            onClick={handleOpenAddGeneric}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3.5 text-xs font-bold transition-all shadow-md shadow-indigo-950/40 hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add</span>
          </button>
          
          <button
            id="header-btn-profile"
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all cursor-pointer"
          >
            <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-inner shadow-indigo-700/30">
              {getUserInitials(currentUser)}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-200 max-w-[120px] truncate">
              {currentUser}
            </span>
          </button>
        </div>
      </header>

      {/* SIDE NAVIGATION DRAWER */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        userName={currentUser}
        onLogout={handleLogout}
        currency={currency}
        onCurrencyChange={setCurrency}
        isPro={isPro}
      />

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8" id="app-main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activePage === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                onAddTransactionClick={handleOpenAddGeneric}
                onNavigate={setActivePage}
                onDeleteTransaction={handleDeleteTransaction}
                currency={currency}
              />
            )}

            {activePage === 'calendar' && (
              <CalendarView
                transactions={transactions}
                onAddTransactionOnDate={handleOpenAddOnDate}
                onDeleteTransaction={handleDeleteTransaction}
                currency={currency}
              />
            )}

            {activePage === 'goals' && (
              <GoalsView
                goals={goals}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
                onUpdateGoalAmount={handleUpdateGoalAmount}
                currency={currency}
              />
            )}

            {activePage === 'insights' && (
              <InsightsView
                transactions={transactions}
                currency={currency}
                isPro={isPro}
                onUpgradeClick={() => setActivePage('upgrade')}
              />
            )}

            {activePage === 'penny' && (
              <PennyView
                transactions={transactions}
                goals={goals}
                userName={currentUser}
                currency={currency}
                isPro={isPro}
                onUpgradeClick={() => setActivePage('upgrade')}
              />
            )}

            {activePage === 'upgrade' && (
              <UpgradeView
                isPro={isPro}
                onUpgradeSuccess={handleUpgradeSuccess}
                onBackToDashboard={() => setActivePage('dashboard')}
                currency={currency}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FLOAT ADD TRANSACTION MODAL */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
        selectedDate={modalPrefilledDate}
        currency={currency}
      />

      {/* APP FOOTER CRUMB */}
      <footer className="py-6 border-t border-slate-800/60 text-center text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-auto">
        CashFlowr Premium Smart App • Crafted Offline Secure
      </footer>
    </div>
  );
}
