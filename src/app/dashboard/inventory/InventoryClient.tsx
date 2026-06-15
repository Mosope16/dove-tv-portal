"use client";

import { useState, useTransition } from "react";
import { requestEquipmentCheckout, updateEquipmentCheckoutStatus, createEquipment, updateEquipmentStatus } from "@/lib/actions";

type Equipment = {
  id: string;
  name: string;
  serialNumber: string | null;
  category: string;
  status: string;
  condition: string | null;
  notes: string | null;
  quantity: number;
  availableQuantity: number;
};

type Checkout = {
  id: string;
  status: string;
  quantityRequested: number;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  checkoutNotes: string | null;
  requester: { name: string; email: string };
  equipment: { name: string; category: string };
};

const CATEGORY_COLORS: Record<string, string> = {
  CAMERA:    'bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400',
  MONITOR:   'bg-violet-100 text-violet-800 dark:bg-violet-500/10 dark:text-violet-400',
  STREAMBOX: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400',
  CABLES:    'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  MISC:      'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-400',
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:       'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400',
  CHECKED_OUT:     'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  IN_MAINTENANCE:  'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400',
  RETIRED:         'bg-slate-200 text-slate-600 dark:bg-slate-700/30 dark:text-slate-500',
};

const CATEGORIES = ['CAMERA', 'MONITOR', 'STREAMBOX', 'CABLES', 'MISC'];

// ── Add Equipment Modal (Manager only) ──────────────────────────────
function AddEquipmentModal({ onClose, onAdded }: { onClose: () => void; onAdded: (item: Equipment) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEquipment(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Refresh the page to get updated list
        setTimeout(() => { onClose(); window.location.reload(); }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg mx-4 animate-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Add Equipment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Register a new asset to the Gear Vault</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">Equipment added!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Equipment Name <span className="text-rose-500">*</span></label>
                  <input name="name" type="text" required placeholder="e.g. Sony FX9 Full-Frame Camera"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-rose-500">*</span></label>
                  <select name="category" required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Quantity <span className="text-rose-500">*</span></label>
                  <input name="quantity" type="number" min={1} defaultValue={1} required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Serial Number <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input name="serialNumber" type="text" placeholder="e.g. SNY-FX9-003"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Condition <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input name="condition" type="text" placeholder="e.g. Excellent, Good, Fair"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea name="notes" rows={2} placeholder="Any additional information about this equipment..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" />
                </div>
              </div>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {isPending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  Add to Vault
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Checkout Request Modal ───────────────────────────────────────────
function CheckoutModal({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [qty, setQty] = useState(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('equipmentId', equipment.id);
    formData.set('quantityRequested', String(qty));
    startTransition(async () => {
      const result = await requestEquipmentCheckout(null, formData);
      if (result?.error) setError(result.error);
      else { setSuccess(true); setTimeout(onClose, 1500); }
    });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md mx-4 animate-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Request Checkout</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{equipment.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">Request submitted!</p>
              <p className="text-sm text-slate-500 mt-1">Awaiting manager approval.</p>
            </div>
          ) : (
            <>
              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity <span className="text-slate-400 font-normal">({equipment.availableQuantity} available)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-lg transition-colors">−</button>
                  <span className="text-xl font-bold text-slate-900 dark:text-white w-8 text-center">{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(equipment.availableQuantity, q + 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-lg transition-colors">+</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expected Return Date <span className="text-rose-500">*</span></label>
                <input type="date" name="expectedReturnDate" min={minDate} required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea name="checkoutNotes" rows={3} placeholder="Where will this be used?"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" />
              </div>
              {error && <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {isPending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  Submit Request
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Main Client Component ────────────────────────────────────────────
export function InventoryClient({ equipment: initialEquipment, pendingCheckouts, activeCheckouts: initialActiveCheckouts, isManager }: {
  equipment: Equipment[];
  pendingCheckouts: Checkout[];
  activeCheckouts: Checkout[];
  isManager: boolean;
}) {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();
  const [checkouts, setCheckouts] = useState(pendingCheckouts);
  const [activeCheckouts, setActiveCheckouts] = useState(initialActiveCheckouts);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCheckoutAction = (checkoutId: string, status: 'APPROVED' | 'REJECTED' | 'RETURNED') => {
    if (status === 'RETURNED') {
      setActiveCheckouts(c => c.filter(ch => ch.id !== checkoutId));
    } else {
      setCheckouts(c => c.filter(ch => ch.id !== checkoutId));
    }
    startTransition(async () => {
      const result = await updateEquipmentCheckoutStatus(checkoutId, status);
      if (result?.error) showToast(result.error, 'error');
      else showToast(`Checkout ${status.toLowerCase()} successfully.`, 'success');
    });
  };

  const categories = ['ALL', ...Array.from(new Set(equipment.map(e => e.category)))];
  const filtered = activeCategory === 'ALL' ? equipment : equipment.filter(e => e.category === activeCategory);

  const handleEquipmentStatus = (equipmentId: string, newStatus: 'AVAILABLE' | 'IN_MAINTENANCE' | 'RETIRED') => {
    setEquipment(prev => prev.map(e => e.id === equipmentId
      ? { ...e, status: newStatus, availableQuantity: newStatus === 'AVAILABLE' ? e.quantity : 0 }
      : e
    ));
    startTransition(async () => {
      const result = await updateEquipmentStatus(equipmentId, newStatus);
      if (result?.error) {
        showToast(result.error, 'error');
        setEquipment(initialEquipment);
      } else {
        const label = newStatus === 'IN_MAINTENANCE' ? 'sent to maintenance' : newStatus === 'RETIRED' ? 'retired' : 'restored to available';
        showToast(`Equipment ${label}.`, 'success');
      }
    });
  };

  const stats = {
    total: equipment.reduce((s, e) => s + e.quantity, 0),
    available: equipment.reduce((s, e) => s + e.availableQuantity, 0),
    checkedOut: equipment.reduce((s, e) => s + (e.quantity - e.availableQuantity), 0),
    maintenance: equipment.filter(e => e.status === 'IN_MAINTENANCE').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900/50 dark:text-emerald-300'}`}>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {selectedEquipment && <CheckoutModal equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} />}
      {showAddModal && <AddEquipmentModal onClose={() => setShowAddModal(false)} onAdded={() => {}} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: stats.total, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'Available', value: stats.available, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Checked Out', value: stats.checkedOut, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'In Maintenance', value: stats.maintenance, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl px-5 py-4 transition-colors`}>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Gear Currently Out — active checkouts awaiting return */}
      {activeCheckouts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-sky-50/50 dark:bg-sky-500/5">
            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <h2 className="font-semibold text-slate-900 dark:text-white">Gear Currently Out</h2>
            <span className="ml-auto bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full">{activeCheckouts.length}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeCheckouts.map(checkout => {
              const isOverdue = new Date(checkout.expectedReturnDate) < new Date();
              return (
                <div key={checkout.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      <span className="bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold px-2 py-0.5 rounded-full mr-2">{checkout.quantityRequested}x</span>
                      {checkout.equipment.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Checked out by <span className="font-medium text-slate-700 dark:text-slate-300">{checkout.requester.name}</span>
                      {' · '}Due back{' '}
                      <span className={`font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {new Date(checkout.expectedReturnDate).toLocaleDateString()}{isOverdue && ' ⚠ Overdue'}
                      </span>
                    </p>
                    {checkout.checkoutNotes && <p className="text-xs text-slate-400 mt-1 italic">"{checkout.checkoutNotes}"</p>}
                  </div>
                  {isManager && (
                    <button
                      onClick={() => handleCheckoutAction(checkout.id, 'RETURNED')}
                      disabled={isPending}
                      className="shrink-0 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Mark Returned
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manager: Pending Checkouts */}
      {isManager && checkouts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-amber-50/50 dark:bg-amber-500/5">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h2 className="font-semibold text-slate-900 dark:text-white">Pending Checkout Requests</h2>
            <span className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">{checkouts.length}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {checkouts.map(checkout => (
              <div key={checkout.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    <span className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full mr-2">{checkout.quantityRequested}x</span>
                    {checkout.equipment.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Requested by <span className="font-medium text-slate-700 dark:text-slate-300">{checkout.requester.name}</span>
                    {' · '}Return by <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(checkout.expectedReturnDate).toLocaleDateString()}</span>
                  </p>
                  {checkout.checkoutNotes && <p className="text-xs text-slate-400 mt-1 italic">"{checkout.checkoutNotes}"</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleCheckoutAction(checkout.id, 'APPROVED')} disabled={isPending}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors">Approve</button>
                  <button onClick={() => handleCheckoutAction(checkout.id, 'REJECTED')} disabled={isPending}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50 rounded-lg transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalogue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Equipment Catalogue</h2>
          <div className="flex gap-2 flex-wrap sm:ml-auto items-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {cat}
              </button>
            ))}
            {isManager && (
              <button onClick={() => setShowAddModal(true)}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Add Equipment
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Serial</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-center">Available</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 text-sm">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.MISC}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{item.serialNumber ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{item.condition ?? '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold text-lg ${item.availableQuantity === 0 ? 'text-rose-500' : item.availableQuantity < item.quantity ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {item.availableQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Staff: Request checkout */}
                      {item.status === 'AVAILABLE' && item.availableQuantity > 0 && (
                        <button onClick={() => setSelectedEquipment(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors">
                          Request
                        </button>
                      )}
                      {item.status === 'AVAILABLE' && item.availableQuantity === 0 && !isManager && (
                        <span className="text-xs text-slate-400 italic">Out of stock</span>
                      )}
                      {/* Manager: Status controls */}
                      {isManager && (
                        <>
                          {item.status !== 'IN_MAINTENANCE' && (
                            <button
                              onClick={() => handleEquipmentStatus(item.id, 'IN_MAINTENANCE')}
                              disabled={isPending}
                              title="Send to Maintenance"
                              className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-50 rounded-lg transition-colors">
                              🔧 Maintenance
                            </button>
                          )}
                          {item.status === 'IN_MAINTENANCE' && (
                            <button
                              onClick={() => handleEquipmentStatus(item.id, 'AVAILABLE')}
                              disabled={isPending}
                              title="Restore to Available"
                              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 rounded-lg transition-colors">
                              ✓ Restore
                            </button>
                          )}
                          {item.status !== 'RETIRED' && (
                            <button
                              onClick={() => handleEquipmentStatus(item.id, 'RETIRED')}
                              disabled={isPending}
                              title="Retire this equipment"
                              className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors">
                              Retire
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">No equipment found in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
