import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Check, MoreHorizontal, Waves, Refrigerator, Car } from 'lucide-react';
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

export default function Home() {
  const { user, requests, expenses, estateConfig, toggleRequestStatus } = useAppContext();
  const pendingRequests = requests.filter(r => r.status !== 'BOUGHT' && r.status !== 'COMPLETED');

  // Calculate total expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate previous month's expenses for trend
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === previousMonth && d.getFullYear() === previousYear;
  });
  const previousMonthlySpend = previousMonthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  let trendPercentage = 0;
  if (previousMonthlySpend > 0) {
    trendPercentage = Math.round(((totalMonthlySpend - previousMonthlySpend) / previousMonthlySpend) * 100);
  }

  // Calculate top 3 categories
  const categoryTotals: Record<string, number> = {};
  monthlyExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Maintenance': return <Waves size={24} />;
      case 'Groceries': return <Refrigerator size={24} />;
      case 'Automotive': return <Car size={24} />;
      default: return <Waves size={24} />;
    }
  };

  const homeHealth = estateConfig?.homeHealth || { score: 98, temperature: '72°F Indoor', securityStatus: 'Secure' };

  return (
    <main className="pt-24 px-6 max-w-5xl mx-auto pb-32">
      {/* Greeting Section */}
      <section className="mb-10">
        <p className="text-on-surface-variant font-medium tracking-tight mb-1">Welcome back,</p>
        <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">{user?.displayName?.split(' ')[0] || 'User'}.</h1>
        <p className="text-on-surface-variant mt-2 max-w-md">
          Your residence is operating at optimal efficiency today. You have {pendingRequests.length} pending requests to review.
        </p>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Monthly Expenses Card (Large) */}
        <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant opacity-60">Monthly Spend</span>
              <h2 className="text-3xl font-headline font-bold text-primary mt-1">₹{totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className="flex flex-col items-end">
              <span className={`flex items-center px-3 py-1 rounded-lg text-xs font-bold ${trendPercentage > 0 ? 'bg-error-container text-error' : 'bg-tertiary-fixed text-on-tertiary-container'}`}>
                <TrendingUp size={14} className={`mr-1 ${trendPercentage <= 0 && 'rotate-180'}`} strokeWidth={3} />
                {Math.abs(trendPercentage)}%
              </span>
              <span className="text-[10px] text-on-surface-variant mt-1">vs last month</span>
            </div>
          </div>

          {/* Custom Trend Graph (SVG) */}
          <div className="h-24 w-full mt-8">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#041632" stopOpacity="0.1"></stop>
                  <stop offset="100%" stopColor="#041632" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,80 Q50,70 100,85 T200,40 T300,60 T400,20" fill="none" stroke="#041632" strokeLinecap="round" strokeWidth="3"></path>
              <path d="M0,80 Q50,70 100,85 T200,40 T300,60 T400,20 L400,100 L0,100 Z" fill="url(#gradient)"></path>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-surface-container">
            {topCategories.map(([category, amount], idx) => (
              <div key={idx}>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold truncate">{category}</p>
                <p className="text-sm font-semibold text-primary">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
            {topCategories.length === 0 && (
              <div className="col-span-3 text-sm text-on-surface-variant">No expenses recorded this month.</div>
            )}
          </div>
        </div>

        {/* "State of Home" Gauge (Small) */}
        <div className="md:col-span-5 bg-primary-container text-white rounded-xl p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <span className="text-xs font-bold tracking-widest uppercase text-on-primary-container">Home Health</span>
            <h2 className="text-4xl font-headline font-bold mt-2">{homeHealth.score}%</h2>
            <p className="text-on-primary-container text-sm mt-1">All systems operational</p>
          </div>

          <div className="mt-8 relative z-10">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: `${homeHealth.score}%` }}></div>
            </div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{homeHealth.temperature}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{homeHealth.securityStatus}</span>
              </div>
            </div>
          </div>
          {/* Abstract background shape */}
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Recent Requests Section */}
        <div className="md:col-span-12 mt-4">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-headline font-bold text-primary tracking-tight">Recent Requests</h3>
            <Link to="/requests" className="text-sm font-semibold text-on-primary-fixed-variant hover:underline">
              View archive
            </Link>
          </div>

          <div className="space-y-4">
            {pendingRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="bg-surface-container-low p-5 rounded-xl flex items-center gap-5 hover:bg-surface-container-high transition-colors group">
                <div className="w-12 h-12 shrink-0 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  {getIconForCategory(request.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-primary truncate pr-2">{request.name}</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">{formatTimeAgo(request.createdAt)}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate">
                    From {request.requestedBy} {request.notes && <>• <span className="italic">"{request.notes}"</span></>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {request.urgency === 'LOW' ? (
                    <Link to="/shopping-list" className="px-4 py-2 rounded-lg bg-surface-container-highest text-primary font-bold text-xs active:scale-95 duration-200">
                      View
                    </Link>
                  ) : (
                    <>
                      <button 
                        onClick={() => toggleRequestStatus(request.id, request.status)}
                        className="p-2 rounded-lg bg-primary text-white active:scale-95 duration-200"
                      >
                        <Check size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant border border-transparent hover:border-outline-variant active:scale-95 duration-200">
                        <MoreHorizontal size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant">
                No pending requests.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
