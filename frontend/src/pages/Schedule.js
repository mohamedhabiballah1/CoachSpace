import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const STATUS_STYLES = {
  scheduled:  'text-[#5b8af5] border-[#5b8af5]',
  completed:  'text-[#c8f135] border-[#c8f135]',
  cancelled:  'text-[#555] border-[#555]',
  'no-show':  'text-[#e85d4a] border-[#e85d4a]',
};

const startOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0,0,0,0);
  return d;
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const isoDate = (d) => new Date(d).toISOString().slice(0,10);

const emptyForm = (date) => ({
  clientId: '', date: date || new Date().toISOString().slice(0,10),
  time: '09:00', duration: '60', type: 'in-person', notes: '',
});

const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors";
const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";

const Schedule = () => {
  const { showToast } = useToast();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [sessions, setSessions]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/sessions');
      setSessions(data.sessions || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => {
    fetchSessions();
    api.get('/api/client/clients').then(d => setClients(d.clients || d)).catch(() => {});
  }, [fetchSessions]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = (dateStr) => {
    setEditingId(null);
    setForm(emptyForm(dateStr));
    setModal(true);
  };

  const openEdit = (session) => {
    setEditingId(session._id);
    setForm({
      clientId: session.client?._id || '',
      date: isoDate(session.date),
      time: session.time,
      duration: String(session.duration),
      type: session.type,
      notes: session.notes || '',
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.clientId || !form.date || !form.time) {
      showToast('Client, date, and time are required.', 'error'); return;
    }
    try {
      const payload = {
        client: form.clientId, date: form.date, time: form.time,
        duration: Number(form.duration) || 60, type: form.type, notes: form.notes,
      };
      if (editingId) {
        await api.put(`/api/sessions/${editingId}`, payload);
        showToast('Session updated!', 'success');
      } else {
        await api.post('/api/sessions', payload);
        showToast('Session added!', 'success');
      }
      setModal(false); fetchSessions();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/api/sessions/${id}`, { status });
      showToast(`Marked as ${status}.`, 'success'); fetchSessions();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.delete(`/api/sessions/${id}`);
      showToast('Session cancelled.', 'success'); fetchSessions();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const sessionsOnDay = (day) => {
    const dayStr = isoDate(day);
    return sessions.filter(s => isoDate(s.date) === dayStr);
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };
  const today    = () => setWeekStart(startOfWeek(new Date()));

  const todayStr = isoDate(new Date());

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-['Bebas_Neue'] text-[40px] text-[#f0ede6] leading-none">Schedule</h1>
            <p className="font-['DM_Mono'] text-[11px] text-[#555] mt-1">
              {fmtDate(weekDays[0])} — {fmtDate(weekDays[6])}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevWeek} className="font-['DM_Mono'] text-[13px] px-3 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">←</button>
            <button onClick={today}    className="font-['DM_Mono'] text-[11px] px-3 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Today</button>
            <button onClick={nextWeek} className="font-['DM_Mono'] text-[13px] px-3 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">→</button>
            <button onClick={() => openAdd(todayStr)} className="font-['Bebas_Neue'] text-[18px] tracking-[0.04em] px-5 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">
              + Session
            </button>
          </div>
        </div>

        {/* Weekly grid */}
        <div className="grid grid-cols-7 gap-[1px] bg-[#2a2a2a] border border-[#2a2a2a] rounded-[4px] overflow-hidden">
          {weekDays.map((day) => {
            const isToday = isoDate(day) === todayStr;
            const daySessions = sessionsOnDay(day);
            return (
              <div key={day.toISOString()} className="bg-[#0e0e0e] min-h-[160px] flex flex-col">
                {/* Day header */}
                <div className={`px-3 py-2 border-b border-[#2a2a2a] flex items-center justify-between ${isToday ? 'bg-[rgba(200,241,53,0.04)]' : ''}`}>
                  <div>
                    <div className="font-['DM_Mono'] text-[9px] uppercase tracking-[0.1em] text-[#555]">{DAYS[day.getDay()]}</div>
                    <div className={`font-['Bebas_Neue'] text-[22px] leading-none ${isToday ? 'text-[#c8f135]' : 'text-[#f0ede6]'}`}>{day.getDate()}</div>
                  </div>
                  <button onClick={() => openAdd(isoDate(day))} className="text-[#383838] hover:text-[#c8f135] text-[16px] transition-colors" title="Add session">+</button>
                </div>
                {/* Sessions */}
                <div className="flex-1 p-1.5 flex flex-col gap-1 overflow-y-auto">
                  {daySessions.map(s => (
                    <div key={s._id}
                      className="bg-[#161616] border border-[#2a2a2a] rounded-[3px] px-2 py-1.5 cursor-pointer hover:border-[#383838] transition-colors group"
                      onClick={() => openEdit(s)}
                    >
                      <div className="font-['DM_Mono'] text-[9px] text-[#555]">{s.time}</div>
                      <div className="font-['DM_Sans'] text-[11px] text-[#f0ede6] truncate">{s.client?.firstName} {s.client?.lastName}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`font-['DM_Mono'] text-[8px] uppercase border px-1.5 rounded-full ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          {s.status === 'scheduled' && (
                            <>
                              <button onClick={e => { e.stopPropagation(); handleStatus(s._id, 'completed'); }} title="Complete" className="text-[10px] text-[#c8f135] hover:opacity-80">✓</button>
                              <button onClick={e => { e.stopPropagation(); handleStatus(s._id, 'no-show'); }} title="No show" className="text-[10px] text-[#f5a35b] hover:opacity-80">✗</button>
                            </>
                          )}
                          <button onClick={e => { e.stopPropagation(); handleDelete(s._id); }} title="Delete" className="text-[10px] text-[#e85d4a] hover:opacity-80">🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming sessions list */}
        <div className="mt-8">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">All Sessions</div>
          {loading ? (
            <div className="text-[#c8f135] font-['Bebas_Neue'] tracking-widest animate-pulse">LOADING...</div>
          ) : sessions.length === 0 ? (
            <div className="border border-[#2a2a2a] rounded-[4px] p-8 text-center">
              <p className="text-[#555] text-[13px] font-['DM_Sans']">No sessions scheduled. Click <span className="text-[#c8f135]">+ Session</span> to add one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Date','Time','Client','Type','Duration','Status','Actions'].map(h => (
                      <th key={h} className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] text-left px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...sessions].sort((a,b) => new Date(b.date) - new Date(a.date)).map(s => (
                    <tr key={s._id} className="border-b border-[#2a2a2a] hover:bg-[#161616] transition-colors">
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{fmtDate(s.date)}</td>
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{s.time}</td>
                      <td className="px-4 py-3 font-['DM_Sans'] text-[13px] text-[#f0ede6]">{s.client?.firstName} {s.client?.lastName}</td>
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{s.type}</td>
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{s.duration}min</td>
                      <td className="px-4 py-3">
                        <span className={`font-['DM_Mono'] text-[10px] uppercase tracking-[0.06em] border px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="text-[11px] font-['DM_Mono'] text-[#888] hover:text-[#c8f135] transition-colors">Edit</button>
                          {s.status === 'scheduled' && (
                            <>
                              <button onClick={() => handleStatus(s._id, 'completed')} className="text-[11px] font-['DM_Mono'] text-[#888] hover:text-[#c8f135] transition-colors">Done</button>
                              <button onClick={() => handleStatus(s._id, 'no-show')} className="text-[11px] font-['DM_Mono'] text-[#888] hover:text-[#f5a35b] transition-colors">No-show</button>
                            </>
                          )}
                          <button onClick={() => handleDelete(s._id)} className="text-[11px] font-['DM_Mono'] text-[#888] hover:text-[#e85d4a] transition-colors">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={() => setModal(false)}>
          <div className="bg-[#161616] border border-[#383838] rounded-[6px] p-8 w-[440px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
            <h2 className="font-['Bebas_Neue'] text-[28px] text-[#f0ede6] mb-6">{editingId ? 'EDIT SESSION' : 'ADD SESSION'}</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Client *</label>
                <select value={form.clientId} onChange={e => set('clientId', e.target.value)} className={inputClass}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Time *</label>
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="60" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className={inputClass}>
                    <option value="in-person">In-Person</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Cancel</button>
                <button onClick={handleSave} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
