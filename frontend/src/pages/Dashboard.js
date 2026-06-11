import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ClientDetails from '../components/ClientDetails';
import AddClientModal from '../components/AddClientModal';
import UpdateMeasurementModal from '../components/UpdateMeasurementModal';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const daysSince = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);
const daysUntil = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000);
const isoToday = () => new Date().toISOString().slice(0, 10);

const emptyClient = () => ({
  firstName: '', lastName: '', email: '', number: '',
  startDate: new Date().toISOString().slice(0, 10),
  goalType: 'lose_fat', notes: '',
  weight: '', height: '', bodyFat: '', muscleMass: '',
  neck: '', shoulders: '', chest: '', waist: '', hips: '',
  leftArm: '', rightArm: '', leftForearm: '', rightForearm: '',
  leftThigh: '', rightThigh: '', leftCalf: '', rightCalf: '',
});

const emptyMeasurement = () => ({
  date: new Date().toISOString().slice(0, 10),
  weight: '', height: '', bodyFat: '', muscleMass: '',
  neck: '', shoulders: '', chest: '', waist: '', hips: '',
  leftArm: '', rightArm: '', leftForearm: '', rightForearm: '',
  leftThigh: '', rightThigh: '', leftCalf: '', rightCalf: '',
  notes: '',
});

// ─── Smart Dashboard Overview ──────────────────────────────────────────────
const SmartDashboard = ({ clients, sessions, subscriptions, revenue }) => {
  const navigate = useNavigate();
  const today = isoToday();

  const todaySessions  = sessions.filter(s => new Date(s.date).toISOString().slice(0,10) === today);
  const expiringSubs   = subscriptions.filter(s => s.status === 'active' && daysUntil(s.endDate) <= 7 && daysUntil(s.endDate) >= 0);
  const inactiveClients = clients.filter(c => daysSince(c.updatedAt || c.createdAt) > 14);
  const activeClients  = clients.length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="font-['Bebas_Neue'] text-[48px] text-[#f0ede6] leading-none mb-2">Dashboard</h1>
      <p className="font-['DM_Mono'] text-[11px] text-[#555] mb-8">
        {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Clients', value: activeClients, color: 'text-[#f0ede6]', onClick: () => navigate('/clients') },
          { label: "Today's Sessions", value: todaySessions.length, color: todaySessions.length > 0 ? 'text-[#c8f135]' : 'text-[#f0ede6]', onClick: () => navigate('/schedule') },
          { label: 'Expiring Subs', value: expiringSubs.length, color: expiringSubs.length > 0 ? 'text-[#f5a35b]' : 'text-[#f0ede6]', onClick: () => navigate('/payments') },
          { label: 'This Month', value: revenue ? `${(revenue.thisMonth||0).toLocaleString()} MAD` : '—', color: 'text-[#c8f135]', onClick: () => navigate('/payments') },
        ].map(card => (
          <div key={card.label} onClick={card.onClick}
            className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5 cursor-pointer hover:border-[#383838] transition-colors">
            <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-2">{card.label}</div>
            <div className={`font-['Bebas_Neue'] text-[40px] leading-none ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's sessions */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">Today's Sessions</div>
          {todaySessions.length === 0 ? (
            <p className="text-[#555] text-[13px] font-['DM_Sans']">No sessions scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(s => (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <div>
                    <div className="font-['DM_Sans'] text-[13px] text-[#f0ede6]">{s.client?.firstName} {s.client?.lastName}</div>
                    <div className="font-['DM_Mono'] text-[11px] text-[#555]">{s.time} · {s.type} · {s.duration}min</div>
                  </div>
                  <span className={`font-['DM_Mono'] text-[10px] uppercase border px-2 py-0.5 rounded-full ${
                    s.status === 'scheduled' ? 'text-[#5b8af5] border-[#5b8af5]' :
                    s.status === 'completed' ? 'text-[#c8f135] border-[#c8f135]' : 'text-[#555] border-[#555]'
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring subscriptions */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">Expiring Soon</div>
          {expiringSubs.length === 0 ? (
            <p className="text-[#555] text-[13px] font-['DM_Sans']">No subscriptions expiring in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {expiringSubs.map(s => (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <div>
                    <div className="font-['DM_Sans'] text-[13px] text-[#f0ede6]">{s.client?.firstName} {s.client?.lastName}</div>
                    <div className="font-['DM_Mono'] text-[11px] text-[#555]">{s.packageName} · expires {fmt(s.endDate)}</div>
                  </div>
                  <span className={`font-['Bebas_Neue'] text-[20px] ${daysUntil(s.endDate) <= 2 ? 'text-[#e85d4a]' : 'text-[#f5a35b]'}`}>
                    {daysUntil(s.endDate)}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive clients */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">
            Inactive Clients <span className="text-[#383838]">(14+ days)</span>
          </div>
          {inactiveClients.length === 0 ? (
            <p className="text-[#555] text-[13px] font-['DM_Sans']">All clients are active!</p>
          ) : (
            <div className="space-y-2">
              {inactiveClients.slice(0,5).map(c => (
                <div key={c._id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0 cursor-pointer hover:text-[#f0ede6]" onClick={() => navigate(`/clients/${c._id}`)}>
                  <div className="font-['DM_Sans'] text-[13px] text-[#888]">{c.firstName} {c.lastName}</div>
                  <span className="font-['DM_Mono'] text-[11px] text-[#555]">{daysSince(c.updatedAt || c.createdAt)}d ago</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent clients */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">Recent Clients</div>
          {clients.length === 0 ? (
            <p className="text-[#555] text-[13px] font-['DM_Sans']">No clients yet.</p>
          ) : (
            <div className="space-y-2">
              {clients.slice(0,5).map(c => (
                <div key={c._id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0 cursor-pointer" onClick={() => navigate(`/clients/${c._id}`)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1f1f1f] border border-[#383838] flex items-center justify-center font-['DM_Mono'] text-[10px] text-[#888] flex-shrink-0">
                      {c.firstName?.[0]}{c.lastName?.[0]}
                    </div>
                    <span className="font-['DM_Sans'] text-[13px] text-[#888] hover:text-[#f0ede6] transition-colors">{c.firstName} {c.lastName}</span>
                  </div>
                  <span className="font-['DM_Mono'] text-[11px] text-[#555]">{daysSince(c.startDate)}d</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard component ──────────────────────────────────────────────
const Dashboard = () => {
  useAuth();
  const { showToast } = useToast();

  const [clients, setClients]           = useState([]);
  const [sessions, setSessions]         = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [revenue, setRevenue]           = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [view, setView]                 = useState('smart'); // 'smart' | 'client'

  const [newClient, setNewClient]           = useState(emptyClient());
  const [newMeasurement, setNewMeasurement] = useState(emptyMeasurement());

  const fetchClients = useCallback(async () => {
    try {
      const data = await api.get('/api/client/clients');
      setClients(data.clients || data);
    } catch (err) { showToast(err.message, 'error'); }
  }, [showToast]);

  const fetchSmartData = useCallback(async () => {
    try {
      const [sessData, subsData, revData] = await Promise.all([
        api.get('/api/sessions').catch(() => ({ sessions: [] })),
        api.get('/api/payments/subscriptions').catch(() => ({ subscriptions: [] })),
        api.get('/api/payments/revenue').catch(() => ({ revenue: null })),
      ]);
      setSessions(sessData.sessions || []);
      setSubscriptions(subsData.subscriptions || []);
      setRevenue(revData.revenue);
    } catch { /* non-critical */ }
  }, []);

  const fetchClientDetails = useCallback(async (clientId) => {
    try {
      const data = await api.get(`/api/client/clients/${clientId}`);
      setSelectedClient({ ...data.client, measurements: data.measurements || [] });
      setView('client');
    } catch (err) { showToast(err.message, 'error'); }
  }, [showToast]);

  useEffect(() => {
    Promise.all([fetchClients(), fetchSmartData()]).finally(() => setLoading(false));
  }, [fetchClients, fetchSmartData]);

  const handleSelectClient = (client) => fetchClientDetails(client._id);

  const handleAddClient = async () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.startDate) {
      showToast('First name, last name, and start date are required.', 'error'); return;
    }
    try {
      const numericFields = ['weight','height','bodyFat','muscleMass','neck','shoulders','chest','waist','hips','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf'];
      const payload = { firstName: newClient.firstName, lastName: newClient.lastName, email: newClient.email || undefined, number: newClient.number || undefined, startDate: newClient.startDate, goalType: newClient.goalType, notes: newClient.notes || undefined };
      numericFields.forEach(f => { if (newClient[f] !== '' && newClient[f] != null) payload[f] = parseFloat(newClient[f]); });
      const data = await api.post('/api/client/clients', payload);
      showToast('Client added!', 'success');
      setIsAddModalOpen(false); setNewClient(emptyClient());
      await fetchClients();
      if (data.client?._id) await fetchClientDetails(data.client._id);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAddMeasurement = async () => {
    if (!selectedClient) return;
    try {
      const numericFields = ['weight','height','bodyFat','muscleMass','neck','shoulders','chest','waist','hips','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf'];
      const payload = { date: newMeasurement.date, notes: newMeasurement.notes };
      numericFields.forEach(f => { if (newMeasurement[f] !== '' && newMeasurement[f] != null) payload[f] = parseFloat(newMeasurement[f]); });
      if (editingMeasurement) {
        await api.put(`/api/client/clients/${selectedClient._id}/measurements/${editingMeasurement._id}`, payload);
        showToast('Measurement updated!', 'success');
      } else {
        await api.post(`/api/client/clients/${selectedClient._id}/measurements`, payload);
        showToast('Measurement added!', 'success');
      }
      setIsUpdateModalOpen(false); setEditingMeasurement(null); setNewMeasurement(emptyMeasurement());
      await fetchClientDetails(selectedClient._id);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleEditMeasurement = (m) => {
    setEditingMeasurement(m);
    const fields = ['weight','height','bodyFat','muscleMass','neck','shoulders','chest','waist','hips','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf','notes'];
    const pre = { date: m.date?.slice(0,10) || isoToday() };
    fields.forEach(f => { pre[f] = m[f] != null ? String(m[f]) : ''; });
    setNewMeasurement(pre);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (!window.confirm('Delete this measurement?')) return;
    try {
      await api.delete(`/api/client/clients/${selectedClient._id}/measurements/${measurementId}`);
      showToast('Measurement deleted.', 'success');
      await fetchClientDetails(selectedClient._id);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Delete this client and all their data?')) return;
    try {
      await api.delete(`/api/client/clients/${clientId}`);
      showToast('Client deleted.', 'success');
      setSelectedClient(null); setView('smart');
      await fetchClients();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filteredClients = clients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-[#c8f135] font-['Bebas_Neue'] text-2xl tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
      <Navbar />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          clients={filteredClients}
          selectedClient={view === 'client' ? selectedClient : null}
          onSelectClient={handleSelectClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClient={() => setIsAddModalOpen(true)}
          onShowDashboard={() => { setView('smart'); setSelectedClient(null); }}
        />

        {view === 'smart' ? (
          <SmartDashboard
            clients={clients}
            sessions={sessions}
            subscriptions={subscriptions}
            revenue={revenue}
          />
        ) : (
          <ClientDetails
            client={selectedClient}
            onAddMeasurement={() => { setEditingMeasurement(null); setNewMeasurement(emptyMeasurement()); setIsUpdateModalOpen(true); }}
            onEditMeasurement={handleEditMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
            onDeleteClient={handleDeleteClient}
            onRefresh={() => selectedClient && fetchClientDetails(selectedClient._id)}
          />
        )}
      </main>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setNewClient(emptyClient()); }}
        newClient={newClient}
        setNewClient={setNewClient}
        onAddClient={handleAddClient}
      />

      <UpdateMeasurementModal
        isOpen={isUpdateModalOpen}
        onClose={() => { setIsUpdateModalOpen(false); setEditingMeasurement(null); setNewMeasurement(emptyMeasurement()); }}
        newMeasurement={newMeasurement}
        setNewMeasurement={setNewMeasurement}
        onAddMeasurement={handleAddMeasurement}
        isEditing={!!editingMeasurement}
      />
    </div>
  );
};

export default Dashboard;
