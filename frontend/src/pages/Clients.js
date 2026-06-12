import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import AddClientModal from '../components/AddClientModal';
import WhatsAppButton from '../components/WhatsAppButton';

const GOAL_LABELS = {
  lose_fat: 'Lose Fat', gain_muscle: 'Gain Muscle',
  body_recomp: 'Body Recomp', maintenance: 'Maintenance',
};
const GOAL_COLORS = {
  lose_fat: 'text-[#f5a35b] border-[#f5a35b]',
  gain_muscle: 'text-[#5b8af5] border-[#5b8af5]',
  body_recomp: 'text-[#c8f135] border-[#c8f135]',
  maintenance: 'text-[#888] border-[#555]',
};

const AVATAR_COLORS = ['#c8f135', '#5b8af5', '#f5a35b', '#e85d4a', '#a78bfa', '#34d399'];
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const daysSince = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const emptyClient = () => ({
  firstName: '', lastName: '', email: '', number: '',
  startDate: new Date().toISOString().slice(0, 10),
  goalType: 'lose_fat', notes: '',
  weight: '', height: '', bodyFat: '', muscleMass: '',
  neck: '', shoulders: '', chest: '', waist: '', hips: '',
  leftArm: '', rightArm: '', leftForearm: '', rightForearm: '',
  leftThigh: '', rightThigh: '', leftCalf: '', rightCalf: '',
});

const GOAL_FILTERS = ['All', 'lose_fat', 'gain_muscle', 'body_recomp', 'maintenance'];

const ClientAvatar = ({ client, size = 8 }) => {
  const initials = `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase();
  const color = getAvatarColor(`${client.firstName}${client.lastName}`);
  const dim = `w-${size} h-${size}`;

  if (client.profileImage) {
    return (
      <img
        src={client.profileImage}
        alt={initials}
        loading="lazy"
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        className={`${dim} rounded-full object-cover border border-[#383838] flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-['DM_Mono'] text-[11px] flex-shrink-0 border border-[#383838]`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {initials}
    </div>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [clients, setClients]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [goalFilter, setGoalFilter] = useState('All');
  const [isAddOpen, setIsAddOpen]   = useState(false);
  const [newClient, setNewClient]   = useState(emptyClient());
  const [sortBy, setSortBy]         = useState('name');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/client/clients');
      setClients(data.clients || data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleAddClient = async (extra = {}) => {
    if (!newClient.firstName || !newClient.lastName || !newClient.startDate) {
      showToast('First name, last name, and start date are required.', 'error');
      return;
    }
    try {
      const numericFields = ['weight','height','bodyFat','muscleMass','neck','shoulders','chest','waist','hips','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf'];
      const payload = {
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        email: newClient.email || undefined,
        number: newClient.number || undefined,
        startDate: newClient.startDate,
        goalType: newClient.goalType,
        notes: newClient.notes || undefined,
        ...extra,
      };
      numericFields.forEach(f => { if (newClient[f] !== '' && newClient[f] != null) payload[f] = parseFloat(newClient[f]); });
      await api.post('/api/client/clients', payload);
      showToast('Client added!', 'success');
      setIsAddOpen(false);
      setNewClient(emptyClient());
      fetchClients();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (e, clientId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this client and all their data?')) return;
    try {
      await api.delete(`/api/client/clients/${clientId}`);
      showToast('Client deleted.', 'success');
      fetchClients();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  let filtered = clients.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchGoal = goalFilter === 'All' || c.goalType === goalFilter;
    return matchSearch && matchGoal;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'name')  return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    if (sortBy === 'date')  return new Date(b.startDate) - new Date(a.startDate);
    if (sortBy === 'days')  return daysSince(b.startDate) - daysSince(a.startDate);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-['Bebas_Neue'] text-[32px] sm:text-[40px] text-[#f0ede6] leading-none">Clients</h1>
            <p className="text-[#555] text-[13px] font-['DM_Mono'] mt-1">{clients.length} total</p>
          </div>
          <button onClick={() => setIsAddOpen(true)}
            className="font-['Bebas_Neue'] text-[16px] sm:text-[18px] tracking-[0.04em] px-4 sm:px-5 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity min-h-[44px]">
            + New Client
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#161616] border border-[#2a2a2a] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2 rounded-[4px] outline-none focus:border-[#383838] placeholder-[#555] w-full sm:w-64 min-h-[44px]"
          />
          <div className="flex gap-1 flex-wrap">
            {GOAL_FILTERS.map(g => (
              <button key={g} onClick={() => setGoalFilter(g)}
                className={`font-['DM_Mono'] text-[10px] sm:text-[11px] uppercase tracking-[0.06em] px-2 sm:px-3 py-2 rounded-[4px] transition-colors border min-h-[44px] ${
                  goalFilter === g
                    ? 'bg-[rgba(200,241,53,0.1)] text-[#c8f135] border-[#c8f135]'
                    : 'border-[#383838] text-[#555] hover:text-[#888]'
                }`}>
                {g === 'All' ? 'All' : GOAL_LABELS[g]}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-[#161616] border border-[#2a2a2a] text-[#555] font-['DM_Mono'] text-[11px] px-3 py-2 rounded-[4px] outline-none min-h-[44px]">
            <option value="name">Sort: Name</option>
            <option value="date">Sort: Start Date</option>
            <option value="days">Sort: Days Active</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="font-['Bebas_Neue'] text-[#c8f135] text-xl tracking-widest animate-pulse">LOADING...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
            <div className="font-['Bebas_Neue'] text-[48px] text-[#222] mb-3">NO CLIENTS</div>
            <p className="text-[#555] text-[13px] font-['DM_Sans']">
              {search || goalFilter !== 'All' ? 'No clients match your filters.' : 'Add your first client to get started.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: card grid */}
            <div className="grid grid-cols-1 sm:hidden gap-3">
              {filtered.map(c => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/clients/${c._id}`)}
                  className="bg-[#161616] border border-[#2a2a2a] rounded-[6px] p-4 flex items-center gap-3 cursor-pointer active:bg-[#1a1a1a]"
                >
                  <ClientAvatar client={c} size={12} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#f0ede6] font-['DM_Sans'] truncate">
                      {c.firstName} {c.lastName}
                      {c.medicalNotes && <span className="ml-2 text-[12px]">⚠️</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`font-['DM_Mono'] text-[10px] uppercase border px-1.5 py-0.5 rounded-full ${GOAL_COLORS[c.goalType] || 'text-[#555] border-[#383838]'}`}>
                        {GOAL_LABELS[c.goalType] || c.goalType}
                      </span>
                      <span className="text-[#555] text-[11px] font-['DM_Mono']">{daysSince(c.startDate)}d active</span>
                    </div>
                    {c.email && <div className="text-[11px] text-[#555] font-['DM_Mono'] mt-0.5 truncate">{c.email}</div>}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <WhatsAppButton client={c} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Client', 'Goal', 'Start Date', 'Days Active', 'Contact', ''].map(h => (
                      <th key={h} className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] text-left px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/clients/${c._id}`)}
                      className="border-b border-[#2a2a2a] hover:bg-[#161616] cursor-pointer group transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ClientAvatar client={c} size={8} />
                          <div>
                            <div className="text-[13px] font-medium text-[#f0ede6] font-['DM_Sans']">
                              {c.firstName} {c.lastName}
                              {c.medicalNotes && <span className="ml-2 text-[12px]" title="Medical notes">⚠️</span>}
                            </div>
                            {c.email && <div className="text-[11px] text-[#555] font-['DM_Mono']">{c.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-['DM_Mono'] text-[10px] uppercase tracking-[0.06em] border px-2 py-0.5 rounded-full ${GOAL_COLORS[c.goalType] || 'text-[#555] border-[#383838]'}`}>
                          {GOAL_LABELS[c.goalType] || c.goalType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-['DM_Mono'] text-[12px] text-[#888]">{fmt(c.startDate)}</td>
                      <td className="px-4 py-3 font-['Bebas_Neue'] text-[20px] text-[#f0ede6]">{daysSince(c.startDate)}<span className="text-[#555] text-[12px] ml-1">d</span></td>
                      <td className="px-4 py-3">
                        <div onClick={e => e.stopPropagation()}>
                          <WhatsAppButton client={c} size="sm" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); navigate(`/clients/${c._id}`); }}
                            className="text-[11px] font-['DM_Mono'] text-[#888] hover:text-[#c8f135] transition-colors">View</button>
                          <button onClick={e => handleDelete(e, c._id)}
                            className="text-[11px] font-['DM_Mono'] text-[#888] hover:text-[#e85d4a] transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <AddClientModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setNewClient(emptyClient()); }}
        newClient={newClient}
        setNewClient={setNewClient}
        onAddClient={handleAddClient}
      />
    </div>
  );
};

export default Clients;
