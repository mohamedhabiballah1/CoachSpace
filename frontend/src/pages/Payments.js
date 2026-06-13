import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const daysUntil = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000);

const STATUS_STYLES = {
  active:    'text-[#c8f135] border-[#c8f135]',
  expired:   'text-[#e85d4a] border-[#e85d4a]',
  cancelled: 'text-[#555] border-[#555]',
};

const emptySubForm = () => ({
  clientId: '', packageName: '', price: '', currency: 'MAD',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '', sessionCount: '', paymentMethod: 'cash', paidAt: new Date().toISOString().slice(0, 10),
});

const emptyPayForm = () => ({
  clientId: '', amount: '', currency: 'MAD', method: 'cash', note: '',
  date: new Date().toISOString().slice(0, 10),
});

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={onClose}>
    <div className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[480px] sm:max-w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#383838] rounded-full" /></div>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Bebas_Neue'] text-[24px] sm:text-[28px] text-[#f0ede6]">{title}</h2>
          <button onClick={onClose} className="sm:hidden text-[#555] text-[24px] leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors";
const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";

const Payments = () => {
  const { showToast } = useToast();

  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments]           = useState([]);
  const [clients, setClients]             = useState([]);
  const [revenue, setRevenue]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('Subscriptions');
  const [subModal, setSubModal]           = useState(false);
  const [payModal, setPayModal]           = useState(false);
  const [subForm, setSubForm]             = useState(emptySubForm());
  const [payForm, setPayForm]             = useState(emptyPayForm());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [subsData, paysData, clientsData, revData] = await Promise.all([
        api.get('/api/payments/subscriptions'),
        api.get('/api/payments/payments'),
        api.get('/api/client/clients'),
        api.get('/api/payments/revenue'),
      ]);
      setSubscriptions(subsData.subscriptions || []);
      setPayments(paysData.payments || []);
      setClients(clientsData.clients || clientsData);
      setRevenue(revData.revenue);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const setS = (k, v) => setSubForm(p => ({ ...p, [k]: v }));
  const setP = (k, v) => setPayForm(p => ({ ...p, [k]: v }));

  const handleAddSub = async () => {
    if (!subForm.clientId || !subForm.packageName || !subForm.price || !subForm.endDate) {
      showToast('Client, package name, price, and end date are required.', 'error'); return;
    }
    try {
      await api.post('/api/payments/subscriptions', {
        client: subForm.clientId, packageName: subForm.packageName,
        price: Number(subForm.price), currency: subForm.currency,
        startDate: subForm.startDate, endDate: subForm.endDate,
        sessionCount: subForm.sessionCount ? Number(subForm.sessionCount) : 0,
        paymentMethod: subForm.paymentMethod, paidAt: subForm.paidAt || undefined,
      });
      showToast('Subscription created!', 'success');
      setSubModal(false); setSubForm(emptySubForm()); fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAddPayment = async () => {
    if (!payForm.clientId || !payForm.amount) {
      showToast('Client and amount are required.', 'error'); return;
    }
    try {
      await api.post('/api/payments/payments', {
        client: payForm.clientId, amount: Number(payForm.amount),
        currency: payForm.currency, method: payForm.method,
        note: payForm.note, date: payForm.date,
      });
      showToast('Payment logged!', 'success');
      setPayModal(false); setPayForm(emptyPayForm()); fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/payments/subscriptions/${id}`, { status });
      showToast(`Subscription ${status}.`, 'success'); fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  // Expiring soon: active subs ending in ≤7 days
  const expiringSoon = subscriptions.filter(s => s.status === 'active' && daysUntil(s.endDate) <= 7 && daysUntil(s.endDate) >= 0);

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Bebas_Neue'] text-[40px] text-[#f0ede6] leading-none">Payments</h1>
          <div className="flex gap-2">
            <button onClick={() => setPayModal(true)}
              className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">
              Log Payment
            </button>
            <button onClick={() => setSubModal(true)}
              className="font-['Bebas_Neue'] text-[18px] tracking-[0.04em] px-5 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">
              + Subscription
            </button>
          </div>
        </div>

        {/* Revenue cards */}
        {revenue && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'This Month', value: revenue.thisMonth },
              { label: 'Last Month', value: revenue.lastMonth },
              { label: 'All Time',   value: revenue.allTime   },
            ].map(card => (
              <div key={card.label} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5">
                <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-2">{card.label}</div>
                <div className="font-['Bebas_Neue'] text-[40px] text-[#c8f135] leading-none">
                  {(card.value || 0).toLocaleString()}
                </div>
                <div className="font-['DM_Mono'] text-[11px] text-[#555] mt-1">{revenue.currency}</div>
              </div>
            ))}
          </div>
        )}

        {/* Expiring soon banner */}
        {expiringSoon.length > 0 && (
          <div className="bg-[rgba(245,163,91,0.08)] border border-[#f5a35b] rounded-[4px] px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-[#f5a35b] text-[18px]">⚠</span>
            <span className="font-['DM_Sans'] text-[13px] text-[#f5a35b]">
              {expiringSoon.length} subscription{expiringSoon.length > 1 ? 's' : ''} expiring within 7 days:&nbsp;
              {expiringSoon.map(s => `${s.client?.firstName} ${s.client?.lastName} (${daysUntil(s.endDate)}d)`).join(', ')}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#2a2a2a] mb-6">
          {['Subscriptions', 'Payments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-['DM_Mono'] text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border-b-2 transition-colors -mb-px ${
                activeTab === tab ? 'border-[#c8f135] text-[#c8f135]' : 'border-transparent text-[#555] hover:text-[#888]'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="font-['Bebas_Neue'] text-[#c8f135] text-xl tracking-widest animate-pulse">LOADING...</div>
          </div>
        ) : activeTab === 'Subscriptions' ? (
          subscriptions.length === 0 ? (
            <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
              <div className="font-['Bebas_Neue'] text-[48px] text-[#222] mb-3">NO SUBSCRIPTIONS</div>
              <p className="text-[#555] text-[13px] font-['DM_Sans']">Create a subscription for a client to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Client','Package','Price','Period','Sessions','Status','Actions'].map(h => (
                      <th key={h} className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] text-left px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(s => {
                    const days = daysUntil(s.endDate);
                    return (
                      <tr key={s._id} className="border-b border-[#2a2a2a] hover:bg-[#161616] transition-colors">
                        <td className="px-4 py-3 font-['DM_Sans'] text-[13px] text-[#f0ede6]">
                          {s.client?.firstName} {s.client?.lastName}
                          {s.status === 'active' && days <= 7 && days >= 0 && (
                            <span className="ml-2 text-[#f5a35b] text-[11px] font-['DM_Mono']">({days}d left)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-['DM_Sans'] text-[13px] text-[#888]">{s.packageName}</td>
                        <td className="px-4 py-3 font-['Bebas_Neue'] text-[18px] text-[#c8f135]">{s.price} <span className="text-[#555] text-[11px]">{s.currency}</span></td>
                        <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{fmt(s.startDate)} → {fmt(s.endDate)}</td>
                        <td className="px-4 py-3 font-['DM_Mono'] text-[12px] text-[#888]">{s.sessionsUsed}/{s.sessionCount || '∞'}</td>
                        <td className="px-4 py-3">
                          <span className={`font-['DM_Mono'] text-[10px] uppercase tracking-[0.06em] border px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {s.status === 'active' && (
                              <button onClick={() => handleUpdateStatus(s._id, 'cancelled')}
                                className="text-[11px] font-['DM_Mono'] text-[#555] hover:text-[#e85d4a] transition-colors">Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          payments.length === 0 ? (
            <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
              <div className="font-['Bebas_Neue'] text-[48px] text-[#222] mb-3">NO PAYMENTS</div>
              <p className="text-[#555] text-[13px] font-['DM_Sans']">Log your first payment to track revenue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Date','Client','Amount','Method','Note'].map(h => (
                      <th key={h} className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] text-left px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} className="border-b border-[#2a2a2a] hover:bg-[#161616] transition-colors">
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{fmt(p.date)}</td>
                      <td className="px-4 py-3 font-['DM_Sans'] text-[13px] text-[#f0ede6]">{p.client?.firstName} {p.client?.lastName}</td>
                      <td className="px-4 py-3 font-['Bebas_Neue'] text-[18px] text-[#c8f135]">{p.amount} <span className="text-[#555] text-[11px]">{p.currency}</span></td>
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{p.method}</td>
                      <td className="px-4 py-3 font-['DM_Sans'] text-[12px] text-[#555] max-w-[200px] truncate">{p.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>

      {/* Add Subscription Modal */}
      {subModal && (
        <Modal title="NEW SUBSCRIPTION" onClose={() => setSubModal(false)}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Client *</label>
              <select value={subForm.clientId} onChange={e => setS('clientId', e.target.value)} className={inputClass}>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Package Name *</label>
              <input type="text" value={subForm.packageName} onChange={e => setS('packageName', e.target.value)} placeholder="Monthly Training" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price *</label>
                <input type="number" value={subForm.price} onChange={e => setS('price', e.target.value)} placeholder="500" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select value={subForm.currency} onChange={e => setS('currency', e.target.value)} className={inputClass}>
                  <option value="MAD">MAD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={subForm.startDate} onChange={e => setS('startDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date *</label>
                <input type="date" value={subForm.endDate} onChange={e => setS('endDate', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Sessions</label>
                <input type="number" value={subForm.sessionCount} onChange={e => setS('sessionCount', e.target.value)} placeholder="12" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select value={subForm.paymentMethod} onChange={e => setS('paymentMethod', e.target.value)} className={inputClass}>
                  <option value="cash">Cash</option>
                  <option value="cmi">CMI</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSubModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Cancel</button>
              <button onClick={handleAddSub} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">Create</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Payment Modal */}
      {payModal && (
        <Modal title="LOG PAYMENT" onClose={() => setPayModal(false)}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Client *</label>
              <select value={payForm.clientId} onChange={e => setP('clientId', e.target.value)} className={inputClass}>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Amount *</label>
                <input type="number" value={payForm.amount} onChange={e => setP('amount', e.target.value)} placeholder="500" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select value={payForm.currency} onChange={e => setP('currency', e.target.value)} className={inputClass}>
                  <option value="MAD">MAD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Method</label>
                <select value={payForm.method} onChange={e => setP('method', e.target.value)} className={inputClass}>
                  <option value="cash">Cash</option>
                  <option value="cmi">CMI</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" value={payForm.date} onChange={e => setP('date', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Note</label>
              <input type="text" value={payForm.note} onChange={e => setP('note', e.target.value)} placeholder="Optional note..." className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPayModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Cancel</button>
              <button onClick={handleAddPayment} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">Log</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
