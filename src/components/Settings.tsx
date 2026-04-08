import React, { useState, useRef, useEffect } from 'react';
import { Verified, Users, Key, Bell, Wallet, Moon, Banknote, LogOut, ChevronRight, X, Shield, AlertTriangle } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function Settings() {
  const { user, logout, appUsers, updateUserRole, resetAllData } = useAppContext();
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentUserRole = appUsers.find(u => u.id === user?.uid)?.role || 'member';
  const isAdmin = currentUserRole === 'admin';

  // Slider Logic
  const sliderWidth = 280;
  const knobWidth = 56;
  const maxDrag = sliderWidth - knobWidth - 8; // 8px padding
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const opacity = useTransform(x, [0, maxDrag * 0.8], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxDrag], [0, 1]);

  const handleDragEnd = async () => {
    if (x.get() >= maxDrag * 0.9) {
      // Trigger reset
      setIsResetting(true);
      await controls.start({ x: maxDrag });
      await resetAllData();
      setIsResetting(false);
      controls.start({ x: 0 });
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      {/* Profile Header Section */}
      <section className="flex flex-col items-center text-center space-y-4 mb-10">
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 rotate-3">
            <img
              alt={user?.displayName || 'User'}
              className="w-full h-full object-cover -rotate-3 scale-110"
              src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuBhhh4Eq8Fnl6lgVvSkCwZidVdunCJkpfv8ZJUqdw-OEoT6M5S2nQJmZtAnK_UmYY9zxyU2hwcu7x8TRYGP3ZYbWz7fkli_9uAd_YRPECvnlnL06NkB2Ki84qZzt2L0-sor-05BUQovnLUHMy4dZN56NOsbtKmB_RNxHBli_ljX67QuaJ7BIKox04fEdoRXfU7b9gRA20go2o-pH5uQjKVqu8VXM5q-TZnBvh9JoYibxbpgcvKhfdwNBBUGiXGbnZ_jibLaRXvFWZ_H"}
            />
          </div>
          {isAdmin && (
            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg">
              <Verified className="text-primary" size={24} />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="font-headline font-bold text-3xl tracking-tight text-primary">{user?.displayName || 'User'}</h1>
          <p className="text-on-surface-variant font-medium">{user?.email}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mt-1">{currentUserRole}</p>
        </div>
        <button className="px-6 py-2 bg-surface-container-high text-on-primary-fixed-variant rounded-lg font-semibold text-sm hover:opacity-80 transition-opacity active:scale-95">
          Edit Profile
        </button>
      </section>

      {/* Household Management */}
      <section className="space-y-4">
        <h2 className="px-2 font-headline font-bold text-primary tracking-tight text-lg">Household Management</h2>
        <div className="bg-surface-container-lowest rounded-xl p-2 space-y-1">
          <div 
            onClick={() => setIsMembersModalOpen(true)}
            className="flex items-center justify-between p-4 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <Users className="text-secondary" size={20} />
              </div>
              <span className="font-medium text-primary">Manage Members</span>
            </div>
            <ChevronRight className="text-outline-variant group-hover:translate-x-1 transition-transform" size={20} />
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <Key className="text-secondary" size={20} />
              </div>
              <span className="font-medium text-primary">Invite Codes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded">2 ACTIVE</span>
              <ChevronRight className="text-outline-variant group-hover:translate-x-1 transition-transform" size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <h2 className="px-2 font-headline font-bold text-primary tracking-tight text-lg">Notifications</h2>
        <div className="bg-surface-container-lowest rounded-xl p-2 space-y-1">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <Bell className="text-secondary" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-primary">Request Alerts</span>
                <span className="text-xs text-on-surface-variant">Instant push for staff requests</span>
              </div>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full relative flex items-center px-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <Wallet className="text-secondary" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-primary">Budget Warnings</span>
                <span className="text-xs text-on-surface-variant">Alert when nearing monthly limit</span>
              </div>
            </div>
            <div className="w-12 h-6 bg-surface-container-high rounded-full relative flex items-center px-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preferences */}
      <section className="space-y-4">
        <h2 className="px-2 font-headline font-bold text-primary tracking-tight text-lg">App Preferences</h2>
        <div className="bg-surface-container-lowest rounded-xl p-2 space-y-1">
          <div className="flex items-center justify-between p-4 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <Moon className="text-secondary" size={20} />
              </div>
              <span className="font-medium text-primary">Dark Mode</span>
            </div>
            <span className="text-sm font-semibold text-on-surface-variant mr-1">System</span>
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <Banknote className="text-secondary" size={20} />
              </div>
              <span className="font-medium text-primary">Currency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">INR (₹)</span>
              <ChevronRight className="text-outline-variant group-hover:translate-x-1 transition-transform" size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 pt-4">
        <h2 className="px-2 font-headline font-bold text-error tracking-tight text-lg flex items-center gap-2">
          <AlertTriangle size={20} />
          Danger Zone
        </h2>
        <div className="bg-error-container/10 rounded-2xl p-6 border border-error/20 flex flex-col items-center text-center space-y-6">
          <div>
            <h3 className="font-headline font-bold text-error text-xl mb-2">Reset All Data</h3>
            <p className="text-on-surface-variant text-sm">
              This will permanently delete all requests, shopping lists, and expenses. This action cannot be undone.
            </p>
          </div>

          <div 
            ref={containerRef}
            className="relative h-16 rounded-full bg-surface-container-high overflow-hidden shadow-inner flex items-center p-1"
            style={{ width: sliderWidth }}
          >
            {/* Animated Background */}
            <motion.div 
              className="absolute inset-0 bg-error"
              style={{ opacity: bgOpacity }}
            />

            {/* Slide Text */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity }}
            >
              <span className="font-headline font-bold text-on-surface-variant/60 tracking-widest uppercase text-sm ml-8">
                {isResetting ? 'Resetting...' : 'slide to reset'}
              </span>
            </motion.div>

            {/* Draggable Knob */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: maxDrag }}
              dragElastic={0.05}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{ x }}
              className="relative z-10 h-14 w-14 bg-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <AlertTriangle size={24} className="text-error" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logout Button */}
      <section className="pt-4">
        <button 
          onClick={logout}
          className="w-full py-4 bg-surface-container-low text-error font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-error-container/20 transition-colors active:scale-[0.98] duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
        <p className="text-center text-outline-variant text-[11px] mt-6 tracking-widest font-medium uppercase">The Estate v2.4.0 • Enterprise Edition</p>
      </section>

      {/* Manage Members Modal */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center shrink-0">
              <h3 className="font-headline font-bold text-xl text-primary">Manage Members</h3>
              <button onClick={() => setIsMembersModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {appUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div>
                    <p className="font-bold text-primary">{u.name}</p>
                    <p className="text-xs text-on-surface-variant">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && u.id !== user?.uid ? (
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as 'admin' | 'member')}
                        className="bg-surface-container text-xs font-bold text-primary px-2 py-1 rounded outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-1 rounded ${u.role === 'admin' ? 'bg-primary-container text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
