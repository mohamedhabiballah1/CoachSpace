import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Plus, Calendar, User, MessageCircle, Mail, Trash2, ExternalLink,
  Clock, CheckCircle, XCircle, AlertTriangle, Send,
} from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors min-h-[44px]";
const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";

const TYPE_ICONS = {
  session: <Calendar size={16} />,
  checkin: <CheckCircle size={16} />,
  payment: <AlertTriangle size={16} />,
  custom:  <Bell size={16} />,
};

const TYPE_COLORS = {
  session: 'text-[#5b8af5] border-[#5b8af5]',
  checkin: 'text-[#c8f135] border-[#c8f135]',
  payment: 'text-[#f5a35b] border-[#f5a35b]',
  custom:  'text-[#888] border-[#555]',
};

const STATUS_ICONS = {
  pending: <Clock size={14} className="text-[#f5a35b]" />,
  sent:    <CheckCircle size={14} className="text-[#c8f135]" />,
  failed:  <XCircle size={14} className="text-[#e85d4a]" />,
};

const MESSAGE_TEMPLATES = {
  session: (name) => `Hi ${name || '[client name]'}, reminder that your training session is coming up soon. Make sure you're rested and ready! See you there.`,
  checkin: (name) => `Hi ${name || '[client name]'}, time for your weekly check-in! Don't forget to log your measurements and photos.`,
  payment: (name) => `Hi ${name || '[client name]'}, your coaching subscription is expiring soon. Please renew to continue your program.`,
  custom:  () => '',
};

const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const emptyForm = () => ({
  type: 'session',
  clientId: '',
  message: '',
  channel: 'whatsapp',
  scheduledFor: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  repeat: 'none',
});

const Reminders = () => {
  const { showToast } = useToast();

  const [reminders, setReminders] = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [triggeringId, setTriggeringId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [remData, clientData] = await Promise.all([
        api.get('/api/reminders'),
        api.get('/api/client/clients'),
      ]);
      setReminders(remData.reminders || []);
      setClients(clientData.clients || clientData);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleTypeChange = (type) => {
    const selectedClient = clients.find(c => c._id === form.clientId);
    const clientName = selectedClient ? `${selectedClient.firstName}` : '';
    setForm(p => ({ ...p, type, message: MESSAGE_TEMPLATES[type](clientName) }));
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(c => c._id === clientId);
    const clientName = selectedClient ? `${selectedClient.firstName}` : '';
    setForm(p => ({ ...p, clientId, message: MESSAGE_TEMPLATES[p.type](clientName) }));
  };

  const handleCreate = async () => {
    if (!form.message) { showToast('Message is required.', 'error'); return; }
    if (!form.scheduledFor) { showToast('Scheduled date is required.', 'error'); return; }
    setSaving(true);
    try {
      await api.post('/api/reminders', {
        type: form.type,
        channel: form.channel,
        message: form.message,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        repeat: form.repeat,
        clientId: form.clientId || undefined,
      });
      showToast('Reminder created!', 'success');
      setModal(false);
      setForm(emptyForm());
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/api/reminders/${id}`);
      showToast('Reminder deleted.', 'success');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTrigger = async (reminder) => {
    setTriggeringId(reminder._id);
    try {
      const res = await api.post(`/api/reminders/${reminder._id}/trigger`);
      if (res.whatsappLink) {
        window.open(res.whatsappLink, '_blank');
      }
      showToast('Reminder triggered!', 'success');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTriggeringId(null);
    }
  };

  const upcoming  = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-['Bebas_Neue'] text-[32px] sm:text-[40px] text-[#f0ede6] leading-none">Reminders</h1>
            <p className="text-[#555] text-[13px] font-['DM_Mono'] mt-1">{upcoming.length} upcoming</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm()); setModal(true); }}
            className="flex items-center gap-2 font-['Bebas_Neue'] text-[16px] sm:text-[18px] tracking-[0.04em] px-4 sm:px-5 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity min-h-[44px]"
          >
            <Plus size={18} /> New Reminder
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="font-['Bebas_Neue'] text-[#c8f135] text-xl tracking-widest animate-pulse">LOADING...</div>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-8">
                <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-3">Upcoming</div>
                <div className="space-y-3">
                  {upcoming.map(r => (
                    <ReminderCard
                      key={r._id}
                      reminder={r}
                      onDelete={handleDelete}
                      onTrigger={handleTrigger}
                      triggering={triggeringId === r._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {completed.length > 0 && (
              <div>
                <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-3">History</div>
                <div className="space-y-3">
                  {completed.map(r => (
                    <ReminderCard
                      key={r._id}
                      reminder={r}
                      onDelete={handleDelete}
                      onTrigger={handleTrigger}
                      triggering={triggeringId === r._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {reminders.length === 0 && (
              <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
                <Bell size={48} className="text-[#222] mx-auto mb-3" />
                <div className="font-['Bebas_Neue'] text-[32px] text-[#222] mb-2">NO REMINDERS</div>
                <p className="text-[#555] text-[13px] font-['DM_Sans']">Schedule session reminders, check-in nudges, or payment alerts.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* New Reminder Modal — bottom sheet on mobile */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={() => setModal(false)}>
          <div className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[520px] sm:max-w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#383838] rounded-full" /></div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Bebas_Neue'] text-[24px] sm:text-[28px] text-[#f0ede6]">NEW REMINDER</h2>
                <button onClick={() => setModal(false)} className="sm:hidden text-[#555] text-[24px] leading-none">×</button>
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className={labelClass}>Reminder Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['session','checkin','payment','custom'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-[4px] border text-[11px] font-['DM_Mono'] uppercase tracking-wide transition-colors min-h-[44px] ${
                        form.type === t
                          ? 'bg-[rgba(200,241,53,0.1)] text-[#c8f135] border-[#c8f135]'
                          : 'border-[#383838] text-[#555] hover:text-[#888]'
                      }`}
                    >
                      {TYPE_ICONS[t]}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client */}
              <div className="mb-4">
                <label className={labelClass}>Client <span className="text-[#383838]">(optional)</span></label>
                <select
                  value={form.clientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No specific client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className={labelClass}>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setF('message', e.target.value)}
                  rows={4}
                  placeholder="Your reminder message..."
                  className="w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] resize-none"
                />
              </div>

              {/* Channel */}
              <div className="mb-4">
                <label className={labelClass}>Channel</label>
                <div className="flex gap-2">
                  {[
                    { value: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
                    { value: 'email',    label: 'Email',    Icon: Mail },
                    { value: 'both',     label: 'Both',     Icon: Send },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setF('channel', value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[4px] border text-[12px] font-['DM_Sans'] transition-colors min-h-[44px] ${
                        form.channel === value
                          ? 'bg-[rgba(200,241,53,0.1)] text-[#c8f135] border-[#c8f135]'
                          : 'border-[#383838] text-[#555] hover:text-[#888]'
                      }`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Date / time */}
                <div>
                  <label className={labelClass}>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={e => setF('scheduledFor', e.target.value)}
                    className={inputClass}
                  />
                </div>
                {/* Repeat */}
                <div>
                  <label className={labelClass}>Repeat</label>
                  <select value={form.repeat} onChange={e => setF('repeat', e.target.value)} className={inputClass}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors min-h-[44px]">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={saving} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]">
                  {saving ? 'Saving...' : 'Create Reminder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReminderCard = ({ reminder, onDelete, onTrigger, triggering }) => {
  const client = reminder.client;
  const clientName = client ? `${client.firstName} ${client.lastName}` : null;

  return (
    <div className={`bg-[#161616] border rounded-[4px] p-4 transition-colors ${
      reminder.status === 'pending' ? 'border-[#2a2a2a] hover:border-[#383838]' : 'border-[#1f1f1f] opacity-70'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 flex-shrink-0 ${TYPE_COLORS[reminder.type]?.split(' ')[0]}`}>
            {TYPE_ICONS[reminder.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`font-['DM_Mono'] text-[10px] uppercase border px-2 py-0.5 rounded-full ${TYPE_COLORS[reminder.type]}`}>
                {reminder.type}
              </span>
              {clientName && (
                <span className="font-['DM_Sans'] text-[12px] text-[#888] flex items-center gap-1">
                  <User size={11} /> {clientName}
                </span>
              )}
              <div className="flex items-center gap-1 font-['DM_Mono'] text-[11px] text-[#555]">
                {STATUS_ICONS[reminder.status]}
                <span>{reminder.status}</span>
              </div>
            </div>
            <p className="font-['DM_Sans'] text-[13px] text-[#888] line-clamp-2 mb-2">{reminder.message}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-['DM_Mono'] text-[11px] text-[#555] flex items-center gap-1">
                <Calendar size={12} /> {fmt(reminder.scheduledFor)}
              </span>
              {/* Channel badges */}
              {(reminder.channel === 'whatsapp' || reminder.channel === 'both') && (
                <span className="font-['DM_Mono'] text-[10px] text-[#25d366] border border-[#25d366] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MessageCircle size={10} /> WhatsApp
                </span>
              )}
              {(reminder.channel === 'email' || reminder.channel === 'both') && (
                <span className="font-['DM_Mono'] text-[10px] text-[#5b8af5] border border-[#5b8af5] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Mail size={10} /> Email
                </span>
              )}
              {reminder.repeat !== 'none' && (
                <span className="font-['DM_Mono'] text-[10px] text-[#555]">↻ {reminder.repeat}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* WhatsApp button */}
          {reminder.whatsappLink && (
            <a
              href={reminder.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#25d366] hover:bg-[rgba(37,211,102,0.1)] rounded-[4px] transition-colors"
              title="Send on WhatsApp"
            >
              <ExternalLink size={16} />
            </a>
          )}
          {/* Trigger / send now */}
          {reminder.status === 'pending' && (
            <button
              onClick={() => onTrigger(reminder)}
              disabled={triggering}
              className="p-2 text-[#c8f135] hover:bg-[rgba(200,241,53,0.1)] rounded-[4px] transition-colors disabled:opacity-50"
              title="Send now"
            >
              <Send size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(reminder._id)}
            className="p-2 text-[#555] hover:text-[#e85d4a] rounded-[4px] transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
