import React, { useState } from 'react';
import { Send, ChevronDown, Droplets, Lightbulb, Waves, Refrigerator, Car } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays}d ago`;
}

export default function Requests() {
  const { requests, addRequest, user, estateConfig, expenses } = useAppContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [urgency, setUrgency] = useState<'LOW' | 'MID' | 'HIGH'>('LOW');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = estateConfig?.totalBudget || 650000;
  const budgetRemaining = Math.max(0, totalBudget - totalMonthlySpend);
  const budgetRemainingPercent = Math.min(100, Math.round((budgetRemaining / totalBudget) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addRequest({
        name,
        category,
        urgency,
        notes,
      });
      setName('');
      setNotes('');
      setUrgency('LOW');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentRequests = requests.slice(0, 2);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Maintenance': return <Waves className="text-primary" size={20} />;
      case 'Groceries': return <Refrigerator className="text-primary" size={20} />;
      case 'Automotive': return <Car className="text-primary" size={20} />;
      default: return <Lightbulb className="text-primary" size={20} />;
    }
  };

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
      {/* Hero Section */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-2">New Request</h1>
        <p className="text-on-surface-variant font-body">Submit an item for the weekly estate inventory.</p>
      </div>

      {/* Request Form Card */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Item Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary font-label px-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-surface-tint focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50 outline-none"
              placeholder="What do we need?"
              required
            />
          </div>

          {/* Bento Grid for Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary font-label px-1">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 appearance-none text-on-surface focus:ring-1 focus:ring-surface-tint cursor-pointer outline-none"
                >
                  <option>Groceries</option>
                  <option>Household</option>
                  <option>Personal</option>
                  <option>Garden</option>
                  <option>Maintenance</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={20} />
              </div>
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary font-label px-1">Urgency</label>
              <div className="flex bg-surface-container-low p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUrgency('LOW')}
                  className={`flex-1 py-3 text-xs font-bold rounded-md transition-colors ${
                    urgency === 'LOW' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  LOW
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('MID')}
                  className={`flex-1 py-3 text-xs font-bold rounded-md transition-colors ${
                    urgency === 'MID' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  MID
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('HIGH')}
                  className={`flex-1 py-3 text-xs font-bold rounded-md transition-colors ${
                    urgency === 'HIGH' ? 'bg-surface-container-lowest shadow-sm text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
                  }`}
                >
                  HIGH
                </button>
              </div>
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary font-label px-1">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-surface-tint focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50 outline-none resize-none"
              placeholder="Any specifics? Brand, size, or quantity..."
              rows={3}
            ></textarea>
          </div>

          {/* Visual Context (State-of-Home Gauge) */}
          <div className="bg-primary-container rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-on-primary-container text-xs font-bold tracking-widest uppercase mb-1">Household Budget Status</h4>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-headline font-bold text-white leading-none">{budgetRemainingPercent > 20 ? 'Healthy' : 'Low'}</span>
                <span className="text-tertiary-fixed text-xs font-medium pb-1">{budgetRemainingPercent}% remaining</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${budgetRemainingPercent > 20 ? 'bg-tertiary-fixed-dim' : 'bg-error'}`} style={{ width: `${budgetRemainingPercent}%` }}></div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/20 rounded-full blur-2xl"></div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold py-5 rounded-lg shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <Send size={20} />
            {isSubmitting ? 'Sending...' : 'Send to Dad'}
          </button>
        </form>
      </div>

      {/* Recent Activity Mini Section */}
      <div className="mt-12 space-y-4">
        <h3 className="font-headline font-bold text-primary px-1">Recently Requested</h3>
        <div className="space-y-3">
          {recentRequests.map((req, i) => (
            <div key={req.id} className="bg-surface-container-low rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  {getIconForCategory(req.category)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-primary">{req.name}</p>
                  <p className="text-xs text-on-surface-variant">Requested by {req.requestedBy} • {formatTimeAgo(req.createdAt)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                req.status === 'URGENT' 
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed' 
                  : 'bg-secondary-container text-on-secondary-container'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
          {recentRequests.length === 0 && (
            <div className="text-center py-4 text-on-surface-variant text-sm">
              No recent requests.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
