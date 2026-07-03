import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, DollarSign, Tag, AlignLeft, Check } from 'lucide-react';
import { Transaction, CurrencyCode, CURRENCY_SYMBOLS } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  selectedDate?: string; // Pre-filled date from calendar if applicable
  currency?: CurrencyCode;
}

const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Housing & Utilities',
    'Transport',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Other Expense'
  ],
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
    'Other Income'
  ]
};

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAdd,
  selectedDate,
  currency = 'USD'
}: AddTransactionModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Auto-update category list based on type
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    onAdd({
      title: title.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      type,
      category,
      date,
      notes: notes.trim() || undefined
    });

    // Reset fields
    setTitle('');
    setAmount('');
    setNotes('');
    onClose();
  };

  // Sync date if selectedDate prop changes
  React.useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            id="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl text-slate-100"
            id="transaction-modal-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5 flex-shrink-0">
              <h3 className="font-display text-base font-bold text-slate-100" id="modal-title">
                New Transaction
              </h3>
              <button
                id="btn-close-modal"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-sidebar-scrollbar">
              {/* Type Switcher */}
              <div className="flex rounded-2xl bg-slate-950 p-1.5" id="type-switcher-container">
                <button
                  type="button"
                  id="btn-type-expense"
                  onClick={() => handleTypeChange('expense')}
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  id="btn-type-income"
                  onClick={() => handleTypeChange('income')}
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount
                </label>
                <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5">
                    <span className={`text-base font-extrabold font-mono ${type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                  </div>
                  <input
                    id="input-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-2xl bg-transparent py-3 pl-11 pr-4 text-lg font-bold text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Title/Description Input */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Description
                </label>
                <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-900/30 transition-all">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <AlignLeft className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="input-title"
                    type="text"
                    required
                    maxLength={40}
                    placeholder="e.g. Weekly Groceries"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category & Date in 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </label>
                  <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Tag className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      id="select-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full rounded-2xl bg-slate-950 py-3.5 pl-9 pr-2 text-xs font-semibold text-slate-200 focus:outline-hidden border-0"
                    >
                      {CATEGORIES[type].map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </label>
                  <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 focus-within:border-indigo-500 transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="input-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="block w-full rounded-2xl bg-transparent py-3 pl-9 pr-2 text-xs font-semibold text-slate-200 focus:outline-hidden color-scheme-dark"
                    />
                  </div>
                </div>
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Notes (Optional)
                </label>
                <textarea
                  id="textarea-notes"
                  placeholder="Add any extra details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="block w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-xs font-medium text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-900/30 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-transaction"
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-indigo-950/50 cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <Check className="h-4 w-4" />
                Add {type === 'expense' ? 'Expense' : 'Income'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
