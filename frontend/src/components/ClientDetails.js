import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Camera, Dumbbell, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import ProgressCharts from './ProgressCharts';
import HealthTab from './HealthTab';
import NutritionTab from './NutritionTab';
import WhatsAppButton from './WhatsAppButton';

const AVATAR_COLORS = ['#c8f135', '#5b8af5', '#f5a35b', '#e85d4a', '#a78bfa', '#34d399'];
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

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
  if (dir === 'positive') return <TrendingUp size={14} className="text-[#c8f135] inline" />;
  if (dir === 'negative') return <TrendingDown size={14} className="text-[#e85d4a] inline" />;
  return <Minus size={14} className="text-[#555] inline" />;
};

const TABS = ['Overview', 'Charts', 'Health', 'Nutrition', 'Photos', 'Exercises'];

// Lightbox component
const Lightbox = ({ photos, initialIndex, onClose }) => {
  const [idx, setIdx] = useState(initialIndex);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, photos.length]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img
          src={photos[idx].url}
          alt={photos[idx].angle}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-[4px]"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between rounded-b-[4px]">
          <span className="font-['DM_Mono'] text-[11px] text-[#888] uppercase tracking-wide">{photos[idx].angle}</span>
          <span className="font-['DM_Mono'] text-[11px] text-[#555]">{idx + 1} / {photos.length}</span>
        </div>
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#f0ede6] bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-[20px] hover:bg-black/70">‹</button>
        )}
        {idx < photos.length - 1 && (
          <button onClick={() => setIdx(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#f0ede6] bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-[20px] hover:bg-black/70">›</button>
        )}
        <button onClick={onClose} className="absolute top-2 right-2 text-[#f0ede6] bg-black/50 w-8 h-8 rounded-full flex items-center justify-center text-[18px] hover:bg-black/70">×</button>
      </div>
    </div>
  );
};

const ClientAvatar = ({ client }) => {
  const initials = `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase();
  const color = getAvatarColor(`${client.firstName}${client.lastName}`);
  if (client.profileImage) {
    return (
      <div className="relative">
        <img
          src={client.profileImage}
          alt={initials}
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          className="w-14 h-14 rounded-full object-cover border-2 border-[#383838] flex-shrink-0"
        />
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-['Bebas_Neue'] text-[20px] flex-shrink-0 border-2 border-[#383838] hidden"
          style={{ backgroundColor: `${color}22`, color }}>
          {initials}
        </div>
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-full flex items-center justify-center font-['Bebas_Neue'] text-[22px] flex-shrink-0 border-2 border-[#383838]"
      style={{ backgroundColor: `${color}22`, color }}>
      {initials}
    </div>
  );
};

const ClientDetails = ({ client, onAddMeasurement, onEditMeasurement, onDeleteMeasurement, onDeleteClient, onRefresh }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  const [progress, setProgress] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { photos, index }
  const [clientExercises, setClientExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!client) return;
    try {
      const data = await api.get(`/api/client/clients/${client._id}/measurements/progress`);
      setProgress(data);
    } catch {
      setProgress(null);
    }
  }, [client]);

  const fetchClientExercises = useCallback(async () => {
    if (!client) return;
    setExercisesLoading(true);
    try {
      const data = await api.get(`/api/workouts/clients/${client._id}/exercises`);
      setClientExercises(data.exercises || []);
    } catch {
      setClientExercises([]);
    } finally {
      setExercisesLoading(false);
    }
  }, [client]);

  useEffect(() => {
    setActiveTab('Overview');
    setProgress(null);
    setClientExercises([]);
    if (client) fetchProgress();
  }, [client?._id, fetchProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'Exercises' && client) fetchClientExercises();
  }, [activeTab, client, fetchClientExercises]);

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

  const latestMeasurement = client.measurements?.[0];

  // Build photo timeline from measurements
  const photoTimeline = (client.measurements || [])
    .filter(m => m.photos && m.photos.length > 0)
    .map(m => ({ date: m.date || m.createdAt, photos: m.photos }));

  return (
    <section className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-0 border-b border-[#2a2a2a]">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <ClientAvatar client={client} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Bebas_Neue'] text-[28px] sm:text-[44px] tracking-[0.02em] leading-none text-[#f0ede6] truncate">
                  {client.firstName} {client.lastName}
                </h1>
                {client.medicalNotes && (
                  <AlertTriangle size={16} className="text-[#f5a35b]" title="Has medical notes" />
                )}
                <WhatsAppButton client={client} size="sm" />
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-5 mt-2">
                {[
                  { label: 'Start Date', value: formatDate(client.startDate) },
                  { label: 'Days Active', value: `${daysSince(client.startDate)}d` },
                  { label: 'Goal', value: GOAL_LABELS[client.goalType] || client.goalType },
                  { label: 'Check-ins', value: client.measurements?.length || 0 },
                ].map(item => (
                  <div key={item.label} className="flex flex-col">
                    <span className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.08em]">{item.label}</span>
                    <span className="text-[12px] sm:text-[13px] text-[#888] mt-0.5 font-['DM_Mono']">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            <button onClick={onAddMeasurement} className="font-['DM_Sans'] text-[12px] sm:text-[13px] font-medium px-3 sm:px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] border border-[#c8f135] hover:opacity-90 transition-opacity min-h-[44px]">
              + Check-in
            </button>
            <button onClick={handleExportPDF} className="hidden sm:block font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] hover:border-[#555] transition-colors min-h-[44px]">
              Export PDF
            </button>
            <button onClick={() => onDeleteClient(client._id)} className="font-['DM_Sans'] text-[12px] sm:text-[13px] font-medium px-3 sm:px-4 py-2 rounded-[4px] text-[#e85d4a] border border-[#e85d4a] bg-transparent hover:bg-[rgba(232,93,74,0.08)] transition-colors min-h-[44px]">
              Delete
            </button>
          </div>
        </div>

        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-0 overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-['DM_Mono'] text-[11px] uppercase tracking-[0.08em] px-3 sm:px-4 py-2.5 border-b-2 transition-colors flex-shrink-0 ${
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <>
            {latestMeasurement ? (
              <>
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">Latest Measures</div>
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-[1px] bg-[#2a2a2a] border border-[#2a2a2a] rounded-[4px] mb-8 overflow-hidden">
                  {measureFields
                    .filter(m => latestMeasurement[m.key] != null)
                    .map(m => {
                      const prog = progress?.fields?.[m.key];
                      return (
                        <div key={m.key} className="bg-[#161616] p-3 sm:p-4">
                          <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.06em]">{m.label}</div>
                          <div className="font-['Bebas_Neue'] text-[28px] sm:text-[34px] text-[#f0ede6] leading-none mt-1">
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
                    <div className="bg-[#161616] p-3 sm:p-4">
                      <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.06em]">BMI</div>
                      <div className="font-['Bebas_Neue'] text-[28px] sm:text-[34px] text-[#f0ede6] leading-none mt-1">{progress.bmi.value}</div>
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

            {progress && Object.keys(progress.fields).length > 0 && (
              <div className="mb-8">
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">
                  Progress — {formatDate(progress.baselineDate)} → {formatDate(progress.latestDate)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
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
                      <div className="text-[11px] text-[#555] mt-1 font-['DM_Mono']">{data.baseline} → {data.current}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History — table on desktop, cards on mobile */}
            {client.measurements?.length > 0 && (
              <div>
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">History</div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {client.measurements.map((m) => (
                    <div key={m._id} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-['DM_Mono'] text-[12px] text-[#888]">{formatDate(m.date || m.createdAt)}</span>
                        <div className="flex gap-3">
                          <button onClick={() => onEditMeasurement(m)} className="text-[11px] text-[#888] hover:text-[#c8f135] font-['DM_Mono'] transition-colors">Edit</button>
                          <button onClick={() => onDeleteMeasurement(m._id)} className="text-[11px] text-[#888] hover:text-[#e85d4a] font-['DM_Mono'] transition-colors">Del</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['Weight', m.weight, 'kg'], ['Body Fat', m.bodyFat, '%'], ['Muscle', m.muscleMass, 'kg'], ['Waist', m.waist, 'cm'], ['Chest', m.chest, 'cm']].map(([label, val, unit]) => (
                          val != null ? (
                            <div key={label}>
                              <div className="font-['DM_Mono'] text-[9px] text-[#555] uppercase">{label}</div>
                              <div className="font-['DM_Mono'] text-[13px] text-[#f0ede6]">{val} <span className="text-[#555] text-[10px]">{unit}</span></div>
                            </div>
                          ) : null
                        ))}
                      </div>
                      {m.notes && <div className="text-[11px] text-[#555] mt-2 font-['DM_Sans']">{m.notes}</div>}
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
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
                              <button onClick={() => onEditMeasurement(m)} className="text-[11px] text-[#888] hover:text-[#c8f135] font-['DM_Mono'] transition-colors">Edit</button>
                              <button onClick={() => onDeleteMeasurement(m._id)} className="text-[11px] text-[#888] hover:text-[#e85d4a] font-['DM_Mono'] transition-colors">Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
          <>
            {photoTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Camera size={40} className="text-[#383838]" />
                <p className="text-[#555] text-[13px] font-['DM_Sans']">No progress photos yet. Add photos during a check-in.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {photoTimeline.map((entry, ei) => (
                  <div key={ei}>
                    <div className="font-['DM_Mono'] text-[11px] text-[#555] uppercase tracking-[0.1em] mb-3">
                      {formatDate(entry.date)}
                    </div>
                    {/* Mobile: horizontal scroll */}
                    <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible pb-1">
                      {entry.photos.map((photo, pi) => (
                        <div
                          key={pi}
                          className="flex-shrink-0 w-32 sm:w-auto cursor-pointer group relative"
                          onClick={() => setLightbox({ photos: entry.photos, index: pi })}
                        >
                          <img
                            src={photo.url}
                            alt={photo.angle}
                            loading="lazy"
                            className="w-32 sm:w-full aspect-square object-cover rounded-[4px] border border-[#2a2a2a] group-hover:border-[#555] transition-colors"
                            onError={e => { e.target.src = ''; e.target.style.background = '#1f1f1f'; }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-[4px] opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100 sm:bg-none sm:from-transparent sm:to-transparent sm:static sm:p-0 sm:mt-1">
                            <span className="font-['DM_Mono'] text-[10px] text-[#888] uppercase tracking-wide sm:text-center sm:block">{photo.angle}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── EXERCISES TAB ── */}
        {activeTab === 'Exercises' && (
          <>
            {exercisesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="font-['Bebas_Neue'] text-[#c8f135] text-lg tracking-widest animate-pulse">LOADING...</div>
              </div>
            ) : clientExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Dumbbell size={40} className="text-[#383838]" />
                <p className="text-[#555] text-[13px] font-['DM_Sans']">No exercises assigned yet. Use the Workouts page to assign exercises to this client.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.1em] mb-4">Assigned Exercises</div>
                {clientExercises.map((ex) => (
                  <div key={ex._id} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-['DM_Sans'] text-[14px] font-medium text-[#f0ede6]">{ex.name}</div>
                        {ex.muscleGroup && (
                          <span className="font-['DM_Mono'] text-[10px] uppercase text-[#c8f135] tracking-wide">{ex.muscleGroup}</span>
                        )}
                        {ex.description && <p className="text-[12px] text-[#555] mt-1 font-['DM_Sans']">{ex.description}</p>}
                        {ex.assignmentNotes && <p className="text-[11px] text-[#888] mt-2 font-['DM_Sans'] italic">{ex.assignmentNotes}</p>}
                      </div>
                    </div>

                    {/* Exercise images carousel */}
                    {ex.images?.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {ex.images.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`${ex.name} ${i + 1}`}
                            loading="lazy"
                            className="w-24 h-24 object-cover rounded-[4px] border border-[#2a2a2a] flex-shrink-0 cursor-pointer hover:border-[#555] transition-colors"
                            onClick={() => setLightbox({ photos: ex.images.map(u => ({ url: u, angle: `Image ${ex.images.indexOf(u) + 1}` })), index: i })}
                          />
                        ))}
                      </div>
                    )}

                    {/* Exercise video */}
                    {ex.video && (
                      <div className="mt-3">
                        <video
                          src={ex.video}
                          controls
                          className="w-full max-w-sm rounded-[4px] border border-[#2a2a2a]"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
};

export default ClientDetails;
