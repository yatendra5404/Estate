import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, Home, Edit3, CreditCard, Settings, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function Layout() {
  const location = useLocation();
  const { user, isAuthReady, login } = useAppContext();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/requests', icon: Edit3, label: 'Requests' },
    { path: '/expenses', icon: CreditCard, label: 'Expenses', matchPaths: ['/expenses', '/shopping-list'] },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.matchPaths) {
      return tab.matchPaths.some(p => location.pathname.startsWith(p) || location.pathname === p);
    }
    return location.pathname === tab.path;
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-high mb-4"></div>
          <div className="h-4 w-24 bg-surface-container-high rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-2">The Estate</h1>
          <p className="text-on-surface-variant font-body">Manage your household with ease.</p>
        </div>
        <button
          onClick={login}
          className="w-full max-w-sm bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-4 left-4 right-4 z-50 bg-white/40 backdrop-blur-2xl border border-white/40 shadow-sm rounded-3xl flex justify-between items-center px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border-2 border-white/60 shadow-sm">
            <img
              alt="User profile photo"
              className="w-full h-full object-cover"
              src={user.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuBv1iKAnY43TlQGphz98IuYmf7EoovdnO3P84q80euFNkeo4EJSY14xB-35d2ihwSyoGEt0Ex0_qvzIYBSLJUoFZ2L-TX_gEEJuJzkqnmxuPsJ86CIwsAZB9Me1alUJ_ttgDc9kDiATYRvaj2elMofncDDFrrRsqDtBgRKD8GS1NtECnRiqgVvKJaKmDmMn8O3imWB_5UEx31dfxOA1JqkSkc8CR308e2q5aE7gbxKU5uB3y388BI24KWwapGcFsE3VgsTi84GTuIzb"}
            />
          </div>
          <span className="font-headline font-extrabold text-primary tracking-tighter text-lg">
            The Estate
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-primary p-2 hover:bg-white/50 transition-colors rounded-full active:scale-95 duration-200">
            <Bell size={24} />
          </button>
        </div>
      </header>

      <Outlet />

      {/* BottomNavBar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-50">
        <nav className="flex justify-around items-center px-2 py-2 bg-white/30 backdrop-blur-3xl shadow-[0px_8px_32px_rgba(0,0,0,0.08)] rounded-3xl border border-white/50">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`relative flex flex-col items-center justify-center w-16 h-14 z-10 transition-colors duration-300 ${
                  active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/50 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={24} fill={active ? 'currentColor' : 'none'} className="mb-0.5" />
                <span className="font-body text-[10px] font-medium tracking-wide">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
