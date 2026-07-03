import React, { useState } from 'react';
import { SavingsGoal, CurrencyCode, CURRENCY_SYMBOLS } from '../types';
import { Trophy, Plus, Trash2, Calendar, Target, DollarSign, Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoalsViewProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalAmount: (id: string, newAmount: number) => void;
  currency: CurrencyCode;
}

export default function GoalsView({
  goals,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalAmount,
  currency
}: GoalsViewProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  // Add goal form visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#4f46e5'); // Indigo default

  // Contribution popup helper state
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');

  const colors = [
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#8b5cf6' }
  ];

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) return;

    onAddGoal({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? Math.max(0, parseFloat(currentAmount)) : 0,
      targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category,
      color
    });

    // Reset Form
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setCategory('General');
    setColor('#4f46e5');
    setShowAddForm(false);
  };

  const handleGoalAction = (goalId: string, goalName: string, type: 'deposit' | 'withdraw') => {
    setSelectedGoalForAction(goalId);
    setActionType(type);
    setActionAmount('');
  };

  const submitGoalAction = () => {
    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0 || !selectedGoalForAction) return;

    const goal = goals.find(g => g.id === selectedGoalForAction);
    if (!goal) return;

    let newAmount = goal.currentAmount;
    if (actionType === 'deposit') {
      newAmount += amt;
    } else {
      newAmount = Math.max(0, newAmount - amt);
    }

    onUpdateGoalAmount(selectedGoalForAction, parseFloat(newAmount.toFixed(2)));
    setSelectedGoalForAction(null);
  };

  return (
    <div className="space-y-6" id="goals-view-root">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-indigo-400" />
            Savings Goals
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Define savings milestones, monitor progress, and lock in funds
          </p>
        </div>

        <button
          id="btn-goals-toggle-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 text-xs font-bold transition-all shadow-md shadow-indigo-950/50 hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? 'Cancel Creation' : 'Create Savings Goal'}
        </button>
      </div>

      {/* CREATE GOAL COLLAPSIBLE FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmitGoal}
              className="rounded-[32px] bg-slate-900 p-8 shadow-lg border border-slate-800/80 space-y-5"
              id="create-goal-form"
            >
              <h3 className="font-display text-base font-bold text-white">
                Create a New Savings Milestone
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Goal Name</label>
                  <input
                    id="goal-input-name"
                    type="text"
                    required
                    placeholder="e.g. New Macbook Pro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Category / Milestone</label>
                  <input
                    id="goal-input-category"
                    type="text"
                    placeholder="e.g. Tech, Vacation, Car"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Target Goal ({currencySymbol})</label>
                  <input
                    id="goal-input-target"
                    type="number"
                    required
                    min="1"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Initial Savings ({currencySymbol} - Optional)</label>
                  <input
                    id="goal-input-initial"
                    type="number"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Target Date</label>
                  <input
                    id="goal-input-date"
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-semibold text-slate-100 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Milestone Accent Theme</label>
                  <div className="flex gap-2 flex-wrap" id="goal-colors-container">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          color === c.value ? 'scale-110 border-white shadow-md shadow-black' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                id="goal-btn-submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 text-xs font-bold shadow-lg shadow-indigo-950/50 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Save Milestone
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTION DIALOG OVERLAY (deposit / withdraw) */}
      <AnimatePresence>
        {selectedGoalForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGoalForAction(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-[32px] bg-slate-900 p-8 shadow-2xl border border-slate-800/80"
            >
              <h3 className="font-display text-base font-bold text-white mb-1" id="goal-action-title">
                {actionType === 'deposit' ? 'Contribute Funds' : 'Withdraw Funds'}
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Adjust savings progress on the selected milestone target.
              </p>

              <div className="relative mb-5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-base font-extrabold font-mono text-slate-500">{currencySymbol}</span>
                </div>
                <input
                  id="goal-action-amount-input"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  required
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-base font-bold text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  id="goal-action-cancel"
                  type="button"
                  onClick={() => setSelectedGoalForAction(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="goal-action-confirm"
                  type="button"
                  onClick={submitGoalAction}
                  className={`flex-1 py-3 rounded-2xl text-white text-xs font-bold cursor-pointer transition-colors ${
                    actionType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAVINGS GOALS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="goals-list-grid">
        {goals.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900 border border-slate-800/80 rounded-[32px] shadow-lg" id="empty-goals-state">
            <Trophy className="h-10 w-10 text-slate-700 mx-auto mb-3 animate-bounce" />
            <h4 className="font-display text-base font-bold text-slate-300">No active milestones</h4>
            <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto mt-1">
              Add a goal to build consistent savings velocity for a car, vacation, or emergency safety net.
            </p>
          </div>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const isCompleted = pct >= 100;

            // Target Days Remaining calculator
            const daysLeft = Math.ceil(
              (new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={g.id}
                layout
                id={`goal-card-${g.id}`}
                className="relative rounded-[32px] border border-slate-850 bg-slate-900 p-6 shadow-lg flex flex-col justify-between overflow-hidden group hover:border-slate-700/80 hover:shadow-xl transition-all duration-300"
              >
                {/* Decorative border bar using the custom color */}
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: g.color }} />

                <div className="space-y-4">
                  {/* Goal Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                        {g.category}
                      </span>
                      <h4 className="font-display text-base font-extrabold text-white mt-0.5">
                        {g.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 px-2.5 py-1 text-[10px] font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Achieved
                        </span>
                      )}
                      <button
                        id={`btn-delete-goal-${g.id}`}
                        onClick={() => onDeleteGoal(g.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/50 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="flex items-baseline justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Saved Amount
                      </span>
                      <span className="font-mono text-xl font-extrabold text-white" id={`goal-current-${g.id}`}>
                        {currencySymbol}{g.currentAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Target Goal
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-400" id={`goal-target-${g.id}`}>
                        {currencySymbol}{g.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Custom Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Milestone Progress</span>
                      <span className="font-mono text-slate-300">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: g.color }}
                      />
                    </div>
                  </div>

                  {/* Target Date Descriptor */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span>Target: {new Date(g.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className={daysLeft > 0 ? 'text-indigo-400' : 'text-rose-400'}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Past due'}
                    </span>
                  </div>
                </div>

                {/* Contribution controls */}
                <div className="mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3.5">
                  <button
                    id={`btn-goal-withdraw-${g.id}`}
                    onClick={() => handleGoalAction(g.id, g.name, 'withdraw')}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-400 py-3 text-xs font-bold transition-all cursor-pointer"
                  >
                    Withdraw
                  </button>
                  <button
                    id={`btn-goal-deposit-${g.id}`}
                    onClick={() => handleGoalAction(g.id, g.name, 'deposit')}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-xs font-bold transition-all hover:scale-[1.01] shadow-md shadow-indigo-950/50 cursor-pointer"
                  >
                    Contribute
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
