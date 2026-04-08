import React, { useState } from 'react';
import { Clock, GripVertical, CheckSquare, Square, Receipt, Plus, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ShoppingList() {
  const { requests, toggleRequestStatus, updateRequestPrice, addRequest, submitPurchases } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');

  const pendingItems = requests.filter(item => item.status === 'PENDING' || item.status === 'URGENT');
  const boughtItems = requests.filter(item => item.status === 'BOUGHT');
  const completedItems = requests.filter(item => item.status === 'COMPLETED').sort((a, b) => {
    const dateA = a.purchasedAt || a.createdAt;
    const dateB = b.purchasedAt || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  const displayItems = [...pendingItems, ...boughtItems];
  
  const totalSpent = boughtItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !newItemName) return;
    setIsSubmitting(true);
    try {
      await addRequest({
        name: newItemName,
        category: newItemCategory,
        urgency: 'MID',
        notes: '',
      });
      setIsAddModalOpen(false);
      setNewItemName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPurchases = async () => {
    if (isSubmitting || boughtItems.length === 0) return;
    setIsSubmitting(true);
    try {
      await submitPurchases();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-2">Shopping List</h1>
          <p className="text-on-surface-variant font-body">Items needed for the estate.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white p-3 rounded-xl shadow-md active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Dashboard Summary Bento */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="col-span-2 md:col-span-1 bg-primary-container p-6 rounded-xl text-white flex flex-col justify-between aspect-auto md:aspect-square lg:aspect-video">
          <div>
            <p className="font-label text-on-primary-container text-xs uppercase tracking-widest mb-1">Items to Buy</p>
            <h2 className="font-headline font-extrabold text-3xl">{pendingItems.length}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Clock size={16} className="text-tertiary-fixed-dim" />
            <span className="font-label text-xs text-on-primary-container">Updated just now</span>
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <p className="font-label text-on-surface-variant text-xs uppercase tracking-widest mb-1">Spent Today</p>
            <h2 className="font-headline font-extrabold text-3xl text-primary">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-on-tertiary-container h-full w-[42%]"></div>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant mt-2">42% of weekly grocery budget</p>
          </div>
        </div>
      </section>

      {/* Shopping List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline font-bold text-xl text-primary">Shopping List</h3>
          <span className="bg-surface-container text-primary px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-tighter">
            {displayItems.length} Items
          </span>
        </div>

        <div className="space-y-4">
          {displayItems.map((item) => {
            const isBought = item.status === 'BOUGHT';
            return (
            <div
              key={item.id}
              className={`group bg-surface-container-lowest p-5 rounded-xl flex flex-col gap-4 transition-all duration-300 ${
                isBought ? 'ring-1 ring-primary/5 shadow-md' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1 cursor-pointer" onClick={() => toggleRequestStatus(item.id, item.status)}>
                    {isBought ? (
                      <CheckSquare size={24} className="text-primary" />
                    ) : (
                      <Square size={24} className="text-outline-variant" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-body font-semibold text-on-surface leading-tight ${isBought ? 'line-through opacity-50' : ''}`}>
                      {item.name}
                    </h4>
                    <p className="font-label text-xs text-on-surface-variant mt-0.5">
                      Requested by {item.requestedBy} • {item.category}
                    </p>
                  </div>
                </div>
                {isBought ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-lg">
                    <span className="font-label text-[10px] text-primary font-bold">BOUGHT</span>
                  </div>
                ) : (
                  <GripVertical size={20} className="text-outline-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                )}
              </div>

              {isBought && (
                <div className="pt-4 mt-2 border-t border-surface-container flex items-center justify-between">
                  <label className="font-label text-sm text-on-surface-variant">Enter Final Price</label>
                  <div className="relative w-24">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">₹</span>
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updateRequestPrice(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-6 text-right font-body font-semibold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )})}
          {displayItems.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-low border-dashed">
              All caught up! No pending items.
            </div>
          )}
        </div>

        {/* Bulk Action */}
        <button 
          onClick={handleSubmitPurchases}
          disabled={isSubmitting || boughtItems.length === 0}
          className="w-full mt-8 py-4 bg-primary text-white rounded-xl font-headline font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
        >
          <Receipt size={20} />
          {isSubmitting ? 'Submitting...' : 'Submit Purchases'}
        </button>
      </section>

      {/* Last Purchased Section */}
      {completedItems.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-xl text-primary">Last Purchased</h3>
            <span className="bg-surface-container text-primary px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-tighter">
              {completedItems.length} Items
            </span>
          </div>
          <div className="space-y-3">
            {completedItems.slice(0, 10).map((item) => (
              <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm opacity-80">
                <div>
                  <h4 className="font-body font-semibold text-on-surface leading-tight">{item.name}</h4>
                  <p className="font-label text-xs text-on-surface-variant mt-0.5">
                    {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently'} • {item.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold text-primary">₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
              <h3 className="font-headline font-bold text-xl text-primary">Add Shopping Item</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Milk, Lightbulbs"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Household">Household</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isSubmitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
