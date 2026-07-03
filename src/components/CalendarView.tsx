import React, { useState } from 'react';
import { Transaction, CurrencyCode, CURRENCY_SYMBOLS } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  transactions: Transaction[];
  onAddTransactionOnDate: (date: string) => void;
  onDeleteTransaction: (id: string) => void;
  currency: CurrencyCode;
}

export default function CalendarView({
  transactions,
  onAddTransactionOnDate,
  onDeleteTransaction,
  currency
}: CalendarViewProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  // Current date pointer in state (defaults to current year/month)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper to get first day of the week (0 = Sunday, 1 = Monday, etc)
  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // Pad the start of grid with previous month days
  const gridCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    gridCells.push({ dayNumber: null, dateString: null });
  }

  // Populate actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    gridCells.push({ dayNumber: day, dateString });
  }

  // Group transactions of the visible month for performance
  const monthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
  });

  // Calculate daily spending totals
  const getDailyTotals = (dateString: string) => {
    const dayTxs = monthTransactions.filter((t) => t.date === dateString);
    const income = dayTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  };

  // Transactions on the selected date
  const selectedDateTxs = transactions.filter((t) => t.date === selectedDateStr);
  const selectedDateTotals = getDailyTotals(selectedDateStr);

  return (
    <div className="space-y-6" id="calendar-view-root">
      {/* Title block */}
      <div>
        <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-indigo-400" />
          Budget Calendar
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Visualize, schedule and audit your daily spending velocity
        </p>
      </div>

      {/* Main Grid Calendar Wrapper */}
      <div className="rounded-[32px] bg-slate-900 p-6 shadow-lg border border-slate-800/80" id="calendar-grid-card">
        {/* Navigation Selector */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-white" id="calendar-month-year-label">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-calendar-prev-month"
              onClick={handlePrevMonth}
              className="rounded-xl p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              id="btn-calendar-today"
              onClick={() => {
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
                setSelectedDateStr(today.toISOString().split('T')[0]);
              }}
              className="rounded-xl px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              id="btn-calendar-next-month"
              onClick={handleNextMonth}
              className="rounded-xl p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 py-1.5">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5" id="calendar-grid-days">
          {gridCells.map((cell, idx) => {
            if (!cell.dayNumber || !cell.dateString) {
              return (
                <div 
                  key={`empty-${idx}`} 
                  className="aspect-square bg-slate-950/20 rounded-xl" 
                />
              );
            }

            const { income, expense } = getDailyTotals(cell.dateString);
            const isSelected = selectedDateStr === cell.dateString;
            const isToday = today.toISOString().split('T')[0] === cell.dateString;

            // Highlight spending levels for dark theme
            let spendClass = '';
            if (expense > 250) {
              spendClass = 'border-rose-900/60 bg-rose-950/30 text-rose-300';
            } else if (expense > 50) {
              spendClass = 'border-amber-900/50 bg-amber-950/20 text-amber-300';
            } else if (expense > 0) {
              spendClass = 'border-indigo-900/40 bg-indigo-950/15 text-indigo-300';
            } else if (income > 0) {
              spendClass = 'border-emerald-900/60 bg-emerald-950/25 text-emerald-300';
            }

            return (
              <button
                key={cell.dateString}
                id={`calendar-day-${cell.dayNumber}`}
                onClick={() => setSelectedDateStr(cell.dateString!)}
                className={`aspect-square flex flex-col justify-between p-2 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500/20 shadow-md ring-2 ring-indigo-500/30 z-10 text-white' 
                    : isToday 
                    ? 'border-slate-400 bg-slate-800 text-white font-extrabold' 
                    : spendClass || 'border-slate-850 hover:border-slate-700 hover:bg-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                {/* Day Number */}
                <span className={`text-xs font-bold leading-none ${
                  isSelected ? 'text-indigo-300' : isToday ? 'text-white font-extrabold' : 'text-slate-300'
                }`}>
                  {cell.dayNumber}
                </span>

                {/* Micro Daily Summary */}
                {expense > 0 && (
                  <span className="text-[8px] md:text-[9px] font-bold text-rose-400 font-mono text-right overflow-hidden tracking-tighter truncate w-full block mt-auto">
                    -{currencySymbol}{Math.round(expense)}
                  </span>
                )}
                {income > 0 && expense === 0 && (
                  <span className="text-[8px] md:text-[9px] font-bold text-emerald-400 font-mono text-right overflow-hidden tracking-tighter truncate w-full block mt-auto">
                    +{currencySymbol}{Math.round(income)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED EXPENSE LIST FOR SELECTED DAY */}
      <div className="rounded-[32px] bg-slate-900 p-6 shadow-lg border border-slate-800/80 space-y-4" id="calendar-day-details">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/60 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Selected Audit Date
            </span>
            <h3 className="font-display text-base font-extrabold text-white" id="selected-day-label">
              {new Date(selectedDateStr).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
          </div>

          <button
            id="btn-calendar-add-on-date"
            onClick={() => onAddTransactionOnDate(selectedDateStr)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 text-xs font-bold transition-all shadow-md shadow-indigo-950/50 hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Add on this Day
          </button>
        </div>

        {/* Selected date transactions list */}
        <div className="space-y-2.5">
          {selectedDateTxs.length === 0 ? (
            <div className="py-6 text-center" id="empty-calendar-day-state">
              <p className="text-xs font-bold text-slate-500">
                No activity reported on this day. Use the add button above to schedule items.
              </p>
            </div>
          ) : (
            selectedDateTxs.map((tx) => (
              <div
                key={tx.id}
                id={`calendar-tx-item-${tx.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-850 border border-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-bold text-xs text-slate-400 shadow-inner border border-slate-800">
                    {tx.category.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{tx.title}</h4>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                      {tx.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    id={`btn-calendar-delete-${tx.id}`}
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-rose-950/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Day Stats */}
        {selectedDateTxs.length > 0 && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 text-xs font-bold">
            <div className="rounded-2xl bg-emerald-950/20 p-3 text-center text-emerald-400 border border-emerald-900/30">
              Total Day Income: +{currencySymbol}{selectedDateTotals.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="rounded-2xl bg-rose-950/20 p-3 text-center text-rose-400 border border-rose-900/30">
              Total Day Expense: -{currencySymbol}{selectedDateTotals.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
