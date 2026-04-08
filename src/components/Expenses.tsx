import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, TrendingUp, Wrench, Zap, Utensils, Users, Shield, LayoutGrid, Plus, X, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Expenses() {
  const { expenses, addExpense, estateConfig, updateEstateConfig } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Maintenance');
  const [expenseDesc, setExpenseDesc] = useState('');

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  const totalBudget = estateConfig?.totalBudget || 650000;

  // Calculate total expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate departmental breakdown
  const departments = [
    { name: 'Maintenance', icon: <Wrench size={24} />, target: estateConfig?.departmentTargets?.Maintenance || 150000 },
    { name: 'Utilities', icon: <Zap size={24} />, target: estateConfig?.departmentTargets?.Utilities || 80000 },
    { name: 'Provisions', icon: <Utensils size={24} />, target: estateConfig?.departmentTargets?.Provisions || 120000 },
    { name: 'Staffing', icon: <Users size={24} />, target: estateConfig?.departmentTargets?.Staffing || 250000 },
    { name: 'Security', icon: <Shield size={24} />, target: estateConfig?.departmentTargets?.Security || 50000 },
  ];

  const departmentData = departments.map(dept => {
    const spent = monthlyExpenses.filter(e => e.category === dept.name).reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalMonthlySpend > 0 ? Math.round((spent / totalMonthlySpend) * 100) : 0;
    return { ...dept, spent, percentage };
  });

  const uncategorizedSpent = monthlyExpenses.filter(e => !departments.some(d => d.name === e.category)).reduce((sum, e) => sum + e.amount, 0);

  // Calculate weekly data for the graph
  const weeklyData = [0, 0, 0, 0];
  monthlyExpenses.forEach(e => {
    const d = new Date(e.date);
    const date = d.getDate();
    if (date <= 7) weeklyData[0] += e.amount;
    else if (date <= 14) weeklyData[1] += e.amount;
    else if (date <= 21) weeklyData[2] += e.amount;
    else weeklyData[3] += e.amount;
  });
  const maxWeeklySpend = Math.max(...weeklyData, 1); // Avoid division by zero

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !expenseAmount || !expenseCategory || !expenseDesc) return;
    setIsSubmitting(true);
    try {
      await addExpense({
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDesc,
      });
      setIsExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseDesc('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !newBudget) return;
    setIsSubmitting(true);
    try {
      await updateEstateConfig({ totalBudget: parseFloat(newBudget) });
      setIsBudgetModalOpen(false);
      setNewBudget('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 px-6 max-w-5xl mx-auto pb-32">
      {/* Editorial Header */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <p className="font-label text-on-surface-variant text-sm tracking-widest uppercase">Financial Overview</p>
          <Link to="/shopping-list" className="text-primary font-semibold text-sm hover:underline">
            View Shopping List
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline font-bold text-4xl text-primary tracking-tight">Current Spending</h2>
            <p className="text-on-surface-variant mt-2 max-w-md">Your monthly domestic upkeep is currently {totalMonthlySpend < totalBudget ? 'under' : 'over'} the planned budget.</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 shadow-sm">
              <span className="font-label text-xs text-on-surface-variant block mb-1">TOTAL OUTFLOW</span>
              <span className="font-headline font-extrabold text-3xl text-primary">₹{totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>
        </div>
      </section>

      {/* Main Analytics Canvas (Asymmetric Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Chart Section */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="font-headline font-bold text-xl text-primary">Expense Velocity</h3>
              <p className="text-sm text-on-surface-variant">Weekly operational costs across the estate</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-surface-container-low text-on-surface-variant text-xs font-semibold rounded-lg hover:opacity-80 transition-opacity">WEEKLY</button>
              <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-80 transition-opacity">MONTHLY</button>
            </div>
          </div>

          {/* Stylized Bar Chart */}
          <div className="relative h-64 w-full flex items-end justify-between gap-1 md:gap-3">
            {/* Grid Lines (Subtle Background) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
              <div className="border-b border-surface-container w-full h-0"></div>
              <div className="border-b border-surface-container w-full h-0"></div>
              <div className="border-b border-surface-container w-full h-0"></div>
              <div className="border-b border-surface-container w-full h-0"></div>
            </div>

            {/* Bars */}
            {weeklyData.map((amount, index) => {
              const heightPercent = Math.max(5, (amount / maxWeeklySpend) * 95);
              const isMax = amount === maxWeeklySpend && amount > 0;
              return (
                <div key={index} className="relative flex-1 bg-surface-container-low rounded-t-lg group transition-all hover:bg-primary-container/20" style={{ height: `${heightPercent}%` }}>
                  <div className={`absolute bottom-0 w-full ${isMax ? 'bg-primary' : 'bg-primary-container'} rounded-t-lg h-[90%] shadow-[0px_4px_12px_rgba(4,22,50,0.15)]`}></div>
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] ${isMax ? 'text-primary font-bold' : 'text-on-surface-variant font-medium'}`}>WK{index + 1}</span>
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{amount.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Card: State of Home Gauge */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-primary-container text-white rounded-xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">
            {/* Tertiary Accent Bar (Design System Spec) */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary-fixed-dim"></div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-label text-sm text-on-primary-container tracking-wider uppercase">Budget Health</h4>
                <p className="font-headline font-bold text-3xl mt-2">{totalMonthlySpend > totalBudget ? 'Over Plan' : 'Under Plan'}</p>
              </div>
              <button 
                onClick={() => {
                  setNewBudget(totalBudget.toString());
                  setIsBudgetModalOpen(true);
                }}
                className="text-on-primary-container hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-xs mb-2">
                <span>Remaining Balance</span>
                <span className="font-bold">₹{Math.max(0, totalBudget - totalMonthlySpend).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: `${Math.min(100, (totalMonthlySpend / totalBudget) * 100)}%` }}></div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-on-primary-container">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Total budget is set to ₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline font-bold text-xl text-primary">Departmental Breakdown</h3>
          <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
            Export Report <Download size={16} />
          </button>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentData.map((dept, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                  {dept.icon}
                </div>
                <span className="text-xs font-bold text-primary bg-primary-fixed px-2 py-1 rounded">{dept.percentage}%</span>
              </div>
              <h4 className="font-headline font-bold text-lg text-primary">{dept.name}</h4>
              <p className="text-sm text-on-surface-variant mb-4">Department expenses</p>
              <div className="flex items-baseline gap-1">
                <span className="font-headline font-bold text-xl text-primary">₹{dept.spent.toLocaleString('en-IN')}</span>
                <span className="text-xs text-on-surface-variant">/ ₹{dept.target.toLocaleString('en-IN')}</span>
              </div>
              {dept.spent > dept.target && (
                <div className="mt-2 text-[10px] text-error font-bold flex items-center gap-1">
                  <TrendingUp size={12} /> OVER BUDGET
                </div>
              )}
            </div>
          ))}

          {/* Creative "Other" Card */}
          <div className="bg-tertiary-container text-white p-6 rounded-xl flex flex-col justify-center items-center text-center border-2 border-dashed border-tertiary-fixed-dim/30">
            <LayoutGrid size={36} className="mb-2 text-tertiary-fixed-dim" />
            <h4 className="font-headline font-bold text-lg">Uncategorized</h4>
            <div className="mt-2 text-2xl font-bold">₹{uncategorizedSpent.toLocaleString('en-IN')}</div>
            <p className="text-xs text-on-tertiary-container mt-1">Transactions require your review to finalize this month's books.</p>
            <button className="mt-4 px-4 py-2 bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs rounded-lg hover:opacity-90 transition-opacity">REVIEW NOW</button>
          </div>
        </div>
      </section>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
              <h3 className="font-headline font-bold text-xl text-primary">Add Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 5000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {departments.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Plumber visit"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isSubmitting ? 'Adding...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
              <h3 className="font-headline font-bold text-xl text-primary">Edit Total Budget</h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Total Monthly Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 650000"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isSubmitting ? 'Updating...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
