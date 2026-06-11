import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import ProgressCharts from './ProgressCharts';
import HealthTab from './HealthTab';
import NutritionTab from './NutritionTab';
import WhatsAppButton from './WhatsAppButton';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const daysSince = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);

const GOAL_LABELS = {
  lose_fat: 'Lose Fat',
  gain_muscle: 'Gain Muscle',
  body_recomp: 'Body Recomp',
  maintenance: 'Maintenance',
};

const measureFields = [
  { key: 'weight',    label: 'Weight',    unit: 'kg' },
  { key: 'bodyFat',   label: 'Body Fat',  unit: '%'  },
  { key: 'muscleMass',label: 'Muscle',    unit: 'kg' },
  { key: 'chest',     label: 'Chest',     unit: 'cm' },
  { key: 'waist',     label: 'Waist',     unit: 'cm' },
  { key: 'hips',      label: 'Hips',      unit: 'cm' },
  { key: 'leftArm',   label: 'L. Arm',    unit: 'cm' },
  { key: 'rightArm',  label: 'R. Arm',    unit: 'cm' },
  { key: 'leftThigh', label: 'L. Thigh',  unit: 'cm' },
  { key: 'rightThigh',label: 'R. Thigh',  unit: 'cm' },
];

const historyColumns = [
  { key: 'date',      label: 'Date' },
  { key: 'weight',    label: 'Weight', unit: 'kg' },
  { key: 'bodyFat',   label: 'Body Fat', unit: '%' },
  { key: 'muscleMass',label: 'Muscle', unit: 'kg' },
  { key: 'waist',     label: 'Waist', unit: 'cm' },
  { key: 'chest',     label: 'Chest', unit: 'cm' },
  { key: 'notes',     label: 'Notes' },
];

const directionIcon = (dir) => {
  if (dir === 'positive') return <span className="text-[#c8f135]">↑</span>;
  if (dir === 'negative') return <span className="text-[#e85d4a]">↓</span>;
  return <span className="text-[#555]">→</span>;
};

const TABS = ['Overview', 'Charts', 'Health', 'Nutrition', 'Photos'];

const ClientDetails = ({ client, onAddMeasurement, onEditMeasurement, onDeleteMeasurement, onDeleteClient, onRefresh }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  const [progress, setProgress] = useState(null);
  const fetchProgress = useCallback(async () => {
    if (!client) return;
    try {
      const data = await api.get(`/api/client/clients/${client._id}/measurements/progress`);
      setProgress(data);
    } catch {
      setProgress(null);
    }
  }, [client]);

  useEffect(() => {
    setActiveTab('Overview');
    setProgress(null);
    if (client) fetchProgress();
  }, [client?._id, fetchProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/client/clients/${client._id}/report/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.firstName}_${client.lastName}_report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!client) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center gap-4 text-[#555]">
        <div className="font-['Bebas_Neue'] text-[72px] text-[#222] tracking-widest select-none">CS</div>
        <p className="text-[14px] font-['DM_Sans']">Select a client or add a new one</p>
      </section>
    );
  }

  const latestMeasurement = client.measurements?.[0]; // sorted desc by backend

  return (
    <section className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 border-b border-[#2a2a2a]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-['Bebas_Neue'] text-[44px] tracking-[0.02em] leading-none text-[#f0ede6]">
                {client.firstName} {client.lastName}
              </h1>
              {client.medicalNotes && (
                <span title="Has medical notes" className="text-[18px]">⚠️</span>
              )}
              <WhatsAppButton client={client} size="sm" />
            </div>
            <div className="flex flex-wrap gap-5 mt-2">
              {[
                { label: 'Start Date', value: formatDate(client.startDate) },
                { label: 'Days Active', value: `${daysSince(client.startDate)}d` },
                { label: 'Goal', value: GOAL_LABELS[client.goalType] || client.goalType },
                { label: 'Check-ins', value: client.measurements?.length || 0 },
              ].map(item => (
                <div key={item.label} className="flex flex-col">
                  <span className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.08em]">{item.label}</span>
                  <span className="text-[13px] text-[#888] mt-0.5 font-['DM_Mono']">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            <button onClick={onAddMeasurement} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] border border-[#c8f135] hover:opacity-90 transition-opacity">
              + Check-in
            </button>
            <button onClick={handleExportPDF} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] hover:border-[#555] transition-colors">
              Export PDF
            </button>
            <button onClick={() => onDeleteClient(client._id)} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] text-[#e85d4a] border border-[#e85d4a] bg-transparent hover:bg-[rgba(232,93,74,0.08)] transition-colors">
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-['DM_Mono'] text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#c8f135] text-[#c8f135]'
                  : 'border-transparent text-[#555] hover:text-[#888]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <>
            {/* Latest measures grid */}
            {latestMeasurement ? (
              <>
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">Latest Measures</div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-[1px] bg-[#2a2a2a] border border-[#2a2a2a] rounded-[4px] mb-8 overflow-hidden">
                  {measureFields
                    .filter(m => latestMeasurement[m.key] != null)
                    .map(m => {
                      const prog = progress?.fields?.[m.key];
                      return (
                        <div key={m.key} className="bg-[#161616] p-4">
                          <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.06em]">{m.label}</div>
                          <div className="font-['Bebas_Neue'] text-[34px] text-[#f0ede6] leading-none mt-1">
                            {latestMeasurement[m.key]}
                          </div>
                          <div className="font-['DM_Mono'] text-[11px] text-[#888] mt-0.5">{m.unit}</div>
                          {prog && (
                            <div className={`text-[11px] mt-1 font-['DM_Mono'] ${prog.direction === 'positive' ? 'text-[#c8f135]' : prog.direction === 'negative' ? 'text-[#e85d4a]' : 'text-[#555]'}`}>
                              {directionIcon(prog.direction)} {prog.change > 0 ? '+' : ''}{prog.change}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {progress?.bmi && (
                    <div className="bg-[#161616] p-4">
                      <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.06em]">BMI</div>
                      <div className="font-['Bebas_Neue'] text-[34px] text-[#f0ede6] leading-none mt-1">{progress.bmi.value}</div>
                      <div className="font-['DM_Mono'] text-[11px] text-[#888] mt-0.5">{progress.bmi.category}</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="border border-[#2a2a2a] rounded-[4px] p-8 text-center mb-8">
                <p className="text-[#555] text-[13px] font-['DM_Sans']">No measurements yet. Click <span className="text-[#c8f135]">+ Check-in</span> to add the first one.</p>
              </div>
            )}

            {/* Progress summary */}
            {progress && Object.keys(progress.fields).length > 0 && (
              <div className="mb-8">
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">
                  Progress — {formatDate(progress.baselineDate)} → {formatDate(progress.latestDate)}
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                  {Object.entries(progress.fields).map(([field, data]) => (
                    <div key={field} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-3">
                      <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.06em] mb-1">{field}</div>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-['DM_Mono'] text-[16px] font-medium ${data.direction === 'positive' ? 'text-[#c8f135]' : data.direction === 'negative' ? 'text-[#e85d4a]' : 'text-[#888]'}`}>
                          {data.change > 0 ? '+' : ''}{data.change}
                        </span>
                        <span className="text-[#555] text-[11px]">({data.percentChange > 0 ? '+' : ''}{data.percentChange}%)</span>
                        {directionIcon(data.direction)}
                      </div>
                      <div className="text-[11px] text-[#555] mt-1 font-['DM_Mono']">
                        {data.baseline} → {data.current}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History table */}
            {client.measurements?.length > 0 && (
              <div>
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">History</div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr>
                        {historyColumns.map(col => (
                          <th key={col.key} className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] text-left px-3 py-2 border-b border-[#2a2a2a]">
                            {col.label}
                          </th>
                        ))}
                        <th className="px-3 py-2 border-b border-[#2a2a2a] w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {client.measurements.map((m) => (
                        <tr key={m._id} className="group hover:bg-[rgba(255,255,255,0.02)]">
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[13px] text-[#888] font-['DM_Mono']">{formatDate(m.date || m.createdAt)}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[13px] text-[#888] font-['DM_Mono']">{m.weight ? `${m.weight} kg` : '—'}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[13px] text-[#888] font-['DM_Mono']">{m.bodyFat ? `${m.bodyFat}%` : '—'}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[13px] text-[#888] font-['DM_Mono']">{m.muscleMass ? `${m.muscleMass} kg` : '—'}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[13px] text-[#888] font-['DM_Mono']">{m.waist ? `${m.waist} cm` : '—'}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[13px] text-[#888] font-['DM_Mono']">{m.chest ? `${m.chest} cm` : '—'}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a] text-[12px] text-[#555] max-w-[160px] truncate">{m.notes || '—'}</td>
                          <td className="px-3 py-2.5 border-b border-[#2a2a2a]">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditMeasurement(m)}
                                className="text-[11px] text-[#888] hover:text-[#c8f135] font-['DM_Mono'] transition-colors"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onDeleteMeasurement(m._id)}
                                className="text-[11px] text-[#888] hover:text-[#e85d4a] font-['DM_Mono'] transition-colors"
                                title="Delete"
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Coach notes */}
            {client.notes && (
              <div className="mt-8">
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">Coach Notes</div>
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-4 text-[13px] text-[#888] leading-relaxed font-['DM_Sans']">
                  {client.notes}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CHARTS TAB ── */}
        {activeTab === 'Charts' && (
          <ProgressCharts measurements={client.measurements || []} />
        )}

        {/* ── HEALTH TAB ── */}
        {activeTab === 'Health' && (
          <HealthTab client={client} onRefresh={onRefresh} />
        )}

        {/* ── NUTRITION TAB ── */}
        {activeTab === 'Nutrition' && (
          <NutritionTab clientId={client._id} />
        )}

        {/* ── PHOTOS TAB ── */}
        {activeTab === 'Photos' && (
          <div className="flex items-center justify-center h-40">
            <p className="text-[#555] text-[13px] font-['DM_Sans']">Photo timeline coming soon.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientDetails;
