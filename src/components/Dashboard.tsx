import React from 'react';
import { Transaction, ActivePage, CurrencyCode, CURRENCY_SYMBOLS } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  Calendar as CalendarIcon, 
  Trophy, 
  BarChart3, 
  Plus, 
  Trash2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransactionClick: () => void;
  onNavigate: (page: ActivePage) => void;
  onDeleteTransaction: (id: string) => void;
  currency: CurrencyCode;
}

export default function Dashboard({
  transactions,
  onAddTransactionClick,
  onNavigate,
  onDeleteTransaction,
  currency
}: DashboardProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  // Compute Stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalSavingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Icons based on category
  const getCategoryColorClass = (cat: string) => {
    switch (cat) {
      case 'Food & Dining': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Housing & Utilities': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Transport': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Entertainment': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Shopping': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Healthcare': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'Education': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'Salary': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Freelance': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Investments': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
      id="dashboard-root"
    >
      {/* Top Banner with AI insight */}
      <motion.div 
        variants={itemVariants} 
        className="rounded-3xl bg-slate-900 border border-slate-800 text-white p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        id="dashboard-header-banner"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-rose-500/10 rounded-full blur-xl" />
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            CashFlowr Smart Assistant
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            {balance >= 0 ? "You're in a great financial health!" : "Let's work on boosting your Cash Flow!"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            {balance >= 0 
              ? `You saved ${currencySymbol}${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} this period. Consider allocating ${currencySymbol}${(balance * 0.4).toLocaleString(undefined, {maximumFractionDigits: 0})} to your Emergency savings goal.`
              : "Your recent expenses exceed your income. Take a look at your Analytics Insights to curb excess restaurant bills."
            }
          </p>
        </div>

        <button
          id="btn-quick-add"
          onClick={onAddTransactionClick}
          className="relative z-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all hover:-translate-y-0.5 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Transaction
        </button>
      </motion.div>

      {/* Balance Overview section */}
      <motion.section 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        id="dashboard-balance-section"
      >
        {/* Total Balance Card */}
        <div className="md:col-span-2 bg-slate-900 p-8 rounded-[32px] shadow-lg border border-slate-800/80 flex flex-col sm:flex-row justify-between sm:items-end gap-6 bg-gradient-to-br from-slate-900 to-indigo-950/20">
          <div>
            <p className="text-slate-400 font-semibold mb-1">Total Balance</p>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2" id="balance-amount">
              {currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className={`font-semibold flex items-center gap-1 text-sm ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{balance >= 0 ? '▲' : '▼'}</span> 
              {balance >= 0 ? '+12.4%' : '-4.2%'} <span className="text-slate-500 font-normal">from last month</span>
            </p>
          </div>
          
          {/* Vertical mini bars representing budget trends */}
          <div className="flex gap-2 items-end h-24 self-start sm:self-auto">
            <div className="w-3 bg-indigo-950 rounded-full h-12" />
            <div className="w-3 bg-indigo-900 rounded-full h-16" />
            <div className="w-3 bg-indigo-800 rounded-full h-20" />
            <div className="w-3 bg-indigo-600 rounded-full h-24" />
            <div className="w-3 bg-indigo-500 rounded-full h-18" />
          </div>
        </div>
        
        {/* Saved this month card */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-900 p-8 rounded-[32px] text-white flex flex-col justify-between overflow-hidden relative shadow-lg shadow-indigo-950/50 border border-indigo-500/20">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
          <div>
            <p className="text-indigo-200 font-medium mb-1">Saved this month</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight" id="saved-month-amount">
              {currencySymbol}{(totalIncome - totalExpense > 0 ? totalIncome - totalExpense : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}.00
            </h3>
          </div>
          <div className="mt-6">
            <div className="w-full bg-indigo-950/50 h-2 rounded-full">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, totalSavingsRate)}%` }} 
              />
            </div>
            <p className="text-xs text-indigo-200 mt-2.5 font-semibold">
              {totalSavingsRate}% of your income saved this period
            </p>
          </div>
        </div>
      </motion.section>

      {/* RECENT EXPENSES & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions list */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-900/80 rounded-[32px] p-6 shadow-lg border border-slate-800/80 backdrop-blur-md flex flex-col"
          id="dashboard-recent-transactions"
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="font-bold text-lg text-white">Recent Expenses</h4>
              <p className="text-xs font-semibold text-slate-500">Deposits & expenditures</p>
            </div>
            <button
              id="btn-view-calendar"
              onClick={() => onNavigate('calendar')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="space-y-3.5 overflow-hidden">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center" id="empty-transactions-state">
                <p className="text-sm font-semibold text-slate-500">No transactions added yet.</p>
                <button
                  id="btn-empty-add"
                  onClick={onAddTransactionClick}
                  className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Create your first transaction
                </button>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  id={`tx-item-${tx.id}`}
                  className="flex items-center gap-4 p-3 hover:bg-slate-800/60 rounded-2xl transition-all group border border-transparent hover:border-slate-800/80"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold ${getCategoryColorClass(tx.category)}`}>
                    {tx.category === 'Food & Dining' ? '🛒' : tx.category === 'Entertainment' ? '🎮' : tx.category === 'Transport' ? '🚗' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200 truncate">{tx.title}</p>
                    <p className="text-xs text-slate-500 font-medium capitalize">
                      {tx.category} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold font-mono text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <button
                      id={`btn-delete-tx-${tx.id}`}
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-rose-950/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-900/80 rounded-[32px] p-6 shadow-lg border border-slate-800/80 backdrop-blur-md flex flex-col justify-between gap-6"
          id="dashboard-stats-card"
        >
          <div>
            <h4 className="font-bold text-lg text-white mb-4">Quick Stats</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-950/25 rounded-3xl border border-indigo-900/30">
                <p className="text-indigo-400 text-xs font-bold uppercase mb-1">Weekly Limit</p>
                <p className="text-2xl font-extrabold text-slate-100">{currencySymbol}450 / {currencySymbol}600</p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Active allowance tracker</p>
              </div>
              <div className="p-5 bg-emerald-950/25 rounded-3xl border border-emerald-900/30">
                <p className="text-emerald-400 text-xs font-bold uppercase mb-1">Credit Score</p>
                <p className="text-2xl font-extrabold text-slate-100">784</p>
                <p className="text-[10px] text-emerald-500 mt-1 font-semibold">Excellent Score Rating</p>
              </div>
              <div className="sm:col-span-2 p-5 bg-slate-950/50 rounded-3xl border border-slate-800/60 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Subscriptions Tracker</p>
                  <p className="text-lg font-bold text-slate-200 truncate">8 Active Plans ({currencySymbol}142)</p>
                </div>
                <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                  <div className="bg-indigo-500 h-full w-[75%]" />
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-goto-insights"
            onClick={() => onNavigate('insights')}
            className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 text-slate-300 py-3 text-xs font-bold border border-slate-800 transition-colors cursor-pointer"
          >
            Detailed Analytics & Recommendations <ArrowUpRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
