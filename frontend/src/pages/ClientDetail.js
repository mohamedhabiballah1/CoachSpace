import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import ClientDetails from '../components/ClientDetails';
import UpdateMeasurementModal from '../components/UpdateMeasurementModal';

const emptyMeasurement = () => ({
  date: new Date().toISOString().slice(0, 10),
  weight: '', height: '', bodyFat: '', muscleMass: '',
  neck: '', shoulders: '', chest: '', waist: '', hips: '',
  leftArm: '', rightArm: '', leftForearm: '', rightForearm: '',
  leftThigh: '', rightThigh: '', leftCalf: '', rightCalf: '',
  notes: '',
});

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [client, setClient]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingM, setEditingM]         = useState(null);
  const [newMeasurement, setNewMeasurement] = useState(emptyMeasurement());

  const fetchClient = useCallback(async () => {
    try {
      const data = await api.get(`/api/client/clients/${id}`);
      setClient({ ...data.client, measurements: data.measurements || [] });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const handleAddMeasurement = async () => {
    try {
      const numericFields = ['weight','height','bodyFat','muscleMass','neck','shoulders','chest','waist','hips','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf'];
      const payload = { date: newMeasurement.date, notes: newMeasurement.notes };
      numericFields.forEach(f => { if (newMeasurement[f] !== '' && newMeasurement[f] != null) payload[f] = parseFloat(newMeasurement[f]); });

      if (editingM) {
        await api.put(`/api/client/clients/${id}/measurements/${editingM._id}`, payload);
        showToast('Measurement updated!', 'success');
      } else {
        await api.post(`/api/client/clients/${id}/measurements`, payload);
        showToast('Measurement added!', 'success');
      }
      setIsModalOpen(false);
      setEditingM(null);
      setNewMeasurement(emptyMeasurement());
      fetchClient();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditMeasurement = (m) => {
    setEditingM(m);
    const fields = ['weight','height','bodyFat','muscleMass','neck','shoulders','chest','waist','hips','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf','notes'];
    const pre = { date: m.date?.slice(0, 10) || new Date().toISOString().slice(0, 10) };
    fields.forEach(f => { pre[f] = m[f] != null ? String(m[f]) : ''; });
    setNewMeasurement(pre);
    setIsModalOpen(true);
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (!window.confirm('Delete this measurement?')) return;
    try {
      await api.delete(`/api/client/clients/${id}/measurements/${measurementId}`);
      showToast('Measurement deleted.', 'success');
      fetchClient();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Delete this client and all their data?')) return;
    try {
      await api.delete(`/api/client/clients/${clientId}`);
      showToast('Client deleted.', 'success');
      navigate('/clients');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="font-['Bebas_Neue'] text-[#c8f135] text-xl tracking-widest animate-pulse">LOADING...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="font-['Bebas_Neue'] text-[64px] text-[#222]">404</div>
          <p className="text-[#555] text-[13px]">Client not found.</p>
          <button onClick={() => navigate('/clients')} className="text-[#c8f135] font-['DM_Sans'] text-[13px] hover:underline">← Back to Clients</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
      <Navbar />
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-[#2a2a2a] flex items-center gap-2">
        <button onClick={() => navigate('/clients')} className="font-['DM_Mono'] text-[11px] text-[#555] hover:text-[#888] transition-colors">
          Clients
        </button>
        <span className="text-[#383838]">/</span>
        <span className="font-['DM_Mono'] text-[11px] text-[#888]">{client.firstName} {client.lastName}</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <ClientDetails
          client={client}
          onAddMeasurement={() => { setEditingM(null); setNewMeasurement(emptyMeasurement()); setIsModalOpen(true); }}
          onEditMeasurement={handleEditMeasurement}
          onDeleteMeasurement={handleDeleteMeasurement}
          onDeleteClient={handleDeleteClient}
          onRefresh={fetchClient}
        />
      </div>

      <UpdateMeasurementModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingM(null); setNewMeasurement(emptyMeasurement()); }}
        newMeasurement={newMeasurement}
        setNewMeasurement={setNewMeasurement}
        onAddMeasurement={handleAddMeasurement}
        isEditing={!!editingM}
      />
    </div>
  );
};

export default ClientDetail;
