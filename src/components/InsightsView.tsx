import React, { useState } from 'react';
import { Transaction, CurrencyCode, CURRENCY_SYMBOLS } from '../types';
import { BarChart3, TrendingUp, TrendingDown, Sparkles, PieChart, Landmark, Percent, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

interface InsightsViewProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function InsightsView({ transactions, currency, isPro, onUpgradeClick }: InsightsViewProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const [activeTab, setActiveTab] = useState<'category' | 'velocity'>('category');

  // Compute metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Group by category
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const categoryTotals = Object.entries(expenseByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Group by date for spending trajectory/velocity
  const dailySpend: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      dailySpend[t.date] = (dailySpend[t.date] || 0) + t.amount;
    });

  // Sort dates
  const sortedSpendDates = Object.entries(dailySpend)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7); // Last 7 active spending days

  // Get custom financial tips
  const getSmartTips = () => {
    const tips = [];

    // Food & Dining threshold check
    const foodTotal = expenseByCategory['Food & Dining'] || 0;
    const foodRatio = totalExpense > 0 ? foodTotal / totalExpense : 0;
    if (foodRatio > 0.25) {
      tips.push({
        id: 'food-tip',
        icon: Coffee,
        title: 'High Food & Dining Outlay',
        description: `Your food and dining represents ${(foodRatio * 100).toFixed(0)}% of your total spend. Cook at home twice more this week to save an estimated ${currencySymbol}60.`,
        urgency: 'high'
      });
    }

    // Savings rate warning
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) : 0;
    if (savingsRate < 0.15 && totalIncome > 0) {
      tips.push({
        id: 'savings-rate-tip',
        icon: Percent,
        title: 'Optimize Savings Velocity',
        description: `Your savings rate is currently ${(savingsRate * 100).toFixed(0)}%, which is below the recommended 20% benchmark. Audit shopping expenses to curb leakage.`,
        urgency: 'high'
      });
    } else if (savingsRate >= 0.3) {
      tips.push({
        id: 'savings-rate-tip',
        icon: Sparkles,
        title: 'Stellar Savings Velocity!',
        description: `Awesome job! Your savings rate is ${(savingsRate * 100).toFixed(0)}%, which exceeds standard benchmarks. Consider locking in these extra funds in high-yield milestones.`,
        urgency: 'low'
      });
    }

    // Shopping check
    const shoppingTotal = expenseByCategory['Shopping'] || 0;
    if (shoppingTotal > 200) {
      tips.push({
        id: 'shopping-tip',
        icon: Landmark,
        title: 'Discretionary Purchase Rule',
        description: `You've spent ${currencySymbol}${shoppingTotal.toFixed(0)} on shopping. Implement the "48-Hour Wait" rule before buying discretionary items online to avoid impulse spending.`,
        urgency: 'medium'
      });
    }

    // Default tip if list is short
    if (tips.length < 2) {
      tips.push({
        id: 'default-tip',
        icon: Sparkles,
        title: 'Budgeting 50/30/20 Rule',
        description: 'Aim to allocate 50% of your income to Needs (housing, utilities), 30% to Wants (dining, fun), and 20% to Savings or paying down debt.',
        urgency: 'low'
      });
    }

    return tips;
  };

  const smartTips = getSmartTips();

  return (
    <div className="space-y-6" id="insights-view-root">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          Analytics Insights
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Gain clarity on categoric distribution, spend trajectories, and personal finance tips
        </p>
      </div>

      <div className="relative">
        <div className="space-y-6">
          {/* TABS SELECTOR */}
          <div className="flex rounded-2xl bg-slate-950 p-1.5 w-full max-w-sm" id="insights-tabs">
            <button
              id="btn-tab-category"
              onClick={() => setActiveTab('category')}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'category'
                  ? 'bg-slate-900 text-indigo-400 shadow-md shadow-black/25'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Categorical Distribution
            </button>
            <button
              id="btn-tab-velocity"
              onClick={() => setActiveTab('velocity')}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'velocity'
                  ? 'bg-slate-900 text-indigo-400 shadow-md shadow-black/25'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Daily Spend Velocity
            </button>
          </div>

          {/* MAIN VISUAL CHART CARD */}
          <div className="rounded-[32px] bg-slate-900 p-8 shadow-lg border border-slate-800/80" id="insights-chart-card">
            {activeTab === 'category' ? (
              <div className="space-y-6" id="category-analysis-view">
                <div>
                  <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
                    <PieChart className="h-4.5 w-4.5 text-indigo-400" />
                    Expenses by Category
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">Total spent: {currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                {categoryTotals.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-bold" id="empty-category-chart">
                    No expense transactions reported yet. Use the Calendar or Dashboard to report spending.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Horizontal custom bar indicators */}
                    {categoryTotals.map((item) => {
                      let barColor = 'bg-indigo-500';
                      if (item.category === 'Food & Dining') barColor = 'bg-amber-500';
                      if (item.category === 'Housing & Utilities') barColor = 'bg-blue-500';
                      if (item.category === 'Transport') barColor = 'bg-teal-500';
                      if (item.category === 'Shopping') barColor = 'bg-rose-500';
                      if (item.category === 'Entertainment') barColor = 'bg-purple-500';

                      return (
                        <div key={item.category} className="space-y-1.5" id={`category-bar-${item.category.replace(/\s+/g, '-')}`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{item.category}</span>
                            <div className="space-x-2 font-mono text-right">
                              <span className="text-slate-400">{currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span className="font-bold text-indigo-400">({item.percentage}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6" id="velocity-analysis-view">
                <div>
                  <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
                    <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                    Last 7 Spend Transactions Trajectory
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">Analysis of daily spending spikes</p>
                </div>

                {sortedSpendDates.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-bold" id="empty-velocity-chart">
                    No spending trajectory data available. Add daily expenses on the Calendar to see this plot fill.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Columnar visual bar charts */}
                    <div className="flex items-end justify-between h-44 px-4 pt-4 border-b border-slate-800" id="velocity-bars-container">
                      {sortedSpendDates.map(([date, amount]) => {
                        const maxAmount = Math.max(...Object.values(dailySpend), 1);
                        const pctHeight = Math.max(10, Math.round((amount / maxAmount) * 100));
                        const labelDate = new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                        return (
                          <div key={date} className="flex flex-col items-center flex-1 max-w-[50px] group relative">
                            {/* Hover Tooltip tooltip */}
                            <span className="text-[10px] font-bold text-white bg-slate-800 rounded-lg px-2 py-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 shadow-md whitespace-nowrap z-10">
                              {currencySymbol}{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            
                            <div 
                              className="w-8 bg-indigo-600 hover:bg-indigo-500 rounded-t-lg transition-all duration-500 hover:shadow-lg hover:shadow-indigo-500/20"
                              style={{ height: `${pctHeight}%` }}
                            />
                            <span className="text-[9px] font-semibold text-slate-500 mt-2 truncate max-w-full">
                              {labelDate}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-950/50 rounded-2xl p-4 border border-slate-850">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="font-semibold text-slate-500 block text-[10px] uppercase">Peak Spend Day</span>
                          <span className="font-bold text-slate-200">
                            {new Date(Object.entries(dailySpend).sort((a, b) => b[1] - a[1])[0]?.[0] || '').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold text-slate-500 block text-[10px] uppercase">Peak Value</span>
                        <span className="font-bold font-mono text-slate-200">
                          {currencySymbol}{Math.max(...Object.values(dailySpend), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CASHFLOWR INTELLIGENT RECOMMENDATION ENGINE */}
          <div className="rounded-[32px] bg-slate-900 p-8 shadow-lg border border-slate-800/80 space-y-5" id="smart-advisor-panel">
            <div>
              <h3 className="font-display text-base font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                CashFlowr Smart Budget Tips
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Automated recommendations based on real active balances and categorical weights
              </p>
            </div>

            <div className="space-y-3.5">
              {smartTips.map((tip) => {
                const Icon = tip.icon;
                let urgencyColor = 'border-l-indigo-500 bg-indigo-950/20 border border-slate-850/60';
                if (tip.urgency === 'high') urgencyColor = 'border-l-rose-500 bg-rose-950/20 border border-rose-950/30';
                if (tip.urgency === 'medium') urgencyColor = 'border-l-amber-500 bg-amber-950/20 border border-amber-950/30';

                return (
                  <div
                    key={tip.id}
                    id={`smart-tip-${tip.id}`}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 ${urgencyColor}`}
                  >
                    <div className="rounded-xl bg-slate-900 p-2.5 shadow-inner border border-slate-800 flex-shrink-0">
                      <Icon className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-200">{tip.title}</h4>
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
