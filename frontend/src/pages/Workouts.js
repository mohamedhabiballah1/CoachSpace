import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { uploadFile } from '../utils/upload';
import Navbar from '../components/Navbar';

const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Arms','Legs','Core','Full Body','Cardio'];
const GOAL_TYPES = ['lose_fat','gain_muscle','body_recomp','maintenance'];
const GOAL_LABELS = { lose_fat:'Lose Fat', gain_muscle:'Gain Muscle', body_recomp:'Body Recomp', maintenance:'Maintenance' };

const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors min-h-[44px]";
const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";

const emptyPlan = () => ({
  name: '', description: '', goalType: 'gain_muscle',
  weeks: [{ weekNumber: 1, days: [{ dayName: 'Day 1', exercises: [] }] }],
});

// Exercise media upload section
const ExerciseMediaSection = ({ mediaType, setMediaType, imagePreviews, onImageSelect, onImageRemove, videoPreview, onVideoSelect, onVideoRemove }) => {
  const imgRef0 = useRef(null);
  const imgRef1 = useRef(null);
  const imgRef2 = useRef(null);
  const imgRefs = [imgRef0, imgRef1, imgRef2];
  const videoRef = useRef(null);

  return (
    <div className="mt-4">
      <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-3">Media</div>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMediaType('images')}
          className={`font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] border transition-colors min-h-[36px] ${
            mediaType === 'images' ? 'bg-[rgba(200,241,53,0.1)] text-[#c8f135] border-[#c8f135]' : 'border-[#383838] text-[#555] hover:text-[#888]'
          }`}
        >
          📷 Images
        </button>
        <button
          type="button"
          onClick={() => setMediaType('video')}
          className={`font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] border transition-colors min-h-[36px] ${
            mediaType === 'video' ? 'bg-[rgba(200,241,53,0.1)] text-[#c8f135] border-[#c8f135]' : 'border-[#383838] text-[#555] hover:text-[#888]'
          }`}
        >
          🎥 Video
        </button>
      </div>

      {mediaType === 'images' ? (
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map(i => (
            <div key={i}>
              <div
                onClick={() => !imagePreviews[i] && imgRefs[i].current?.click()}
                className={`aspect-square rounded-[4px] border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group transition-colors ${
                  imagePreviews[i] ? 'border-[#383838]' : 'border-[#2a2a2a] hover:border-[#555]'
                }`}
              >
                {imagePreviews[i] ? (
                  <>
                    <img src={imagePreviews[i]} alt={`img ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={e => { e.stopPropagation(); onImageRemove(i); }} className="text-[#e85d4a] text-[20px]">×</button>
                    </div>
                  </>
                ) : (
                  <span className="text-[#555] text-[20px]">+</span>
                )}
              </div>
              <input ref={imgRefs[i]} type="file" accept="image/*" className="hidden" onChange={e => onImageSelect(i, e.target.files[0])} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {videoPreview ? (
            <div className="relative">
              <video src={videoPreview} controls className="w-full rounded-[4px] border border-[#383838]" style={{ maxHeight: '200px' }} />
              <button type="button" onClick={onVideoRemove} className="absolute top-2 right-2 bg-black/70 text-[#e85d4a] w-7 h-7 rounded-full flex items-center justify-center text-[16px]">×</button>
            </div>
          ) : (
            <div
              onClick={() => videoRef.current?.click()}
              className="border-2 border-dashed border-[#2a2a2a] rounded-[4px] p-6 text-center cursor-pointer hover:border-[#555] transition-colors"
            >
              <div className="text-[32px] mb-2">🎥</div>
              <p className="font-['DM_Sans'] text-[12px] text-[#555]">Click to upload video</p>
              <p className="font-['DM_Mono'] text-[10px] text-[#383838] mt-1">MP4 / MOV · Max 50MB</p>
            </div>
          )}
          <input ref={videoRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={e => onVideoSelect(e.target.files[0])} />
        </div>
      )}
    </div>
  );
};

const Workouts = () => {
  const { showToast } = useToast();

  const [plans, setPlans]         = useState([]);
  const [exercises, setExercises] = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('Plans');
  const [planModal, setPlanModal] = useState(false);
  const [exModal, setExModal]     = useState(false);
  const [assignModal, setAssignModal] = useState(null); // plan to assign
  const [assignExModal, setAssignExModal] = useState(null); // exercise to assign to clients
  const [editPlan, setEditPlan]   = useState(null);
  const [planForm, setPlanForm]   = useState(emptyPlan());
  const [exForm, setExForm]       = useState({ name:'', muscleGroup:'Chest', description:'' });
  const [assignForm, setAssignForm] = useState({ clientId:'', startDate: new Date().toISOString().slice(0,10) });
  const [assignExForm, setAssignExForm] = useState({ clientIds: [], notes: '' });
  const [clientSearch, setClientSearch] = useState('');
  const [savingEx, setSavingEx] = useState(false);
  const [assigningSaving, setAssigningSaving] = useState(false);

  // Exercise media state
  const [exMediaType, setExMediaType] = useState('images');
  const [exImageFiles, setExImageFiles] = useState([null, null, null]);
  const [exImagePreviews, setExImagePreviews] = useState([null, null, null]);
  const [exVideoFile, setExVideoFile] = useState(null);
  const [exVideoPreview, setExVideoPreview] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, exData, clientsData] = await Promise.all([
        api.get('/api/workouts/plans'),
        api.get('/api/workouts/exercises'),
        api.get('/api/client/clients'),
      ]);
      setPlans(plansData.plans || []);
      setExercises(exData.exercises || []);
      setClients(clientsData.clients || clientsData);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const setF = (k, v) => setPlanForm(p => ({ ...p, [k]: v }));

  const addWeek = () => setF('weeks', [...planForm.weeks, { weekNumber: planForm.weeks.length + 1, days: [{ dayName: 'Day 1', exercises: [] }] }]);

  const addDay = (wi) => {
    const weeks = [...planForm.weeks];
    weeks[wi].days.push({ dayName: `Day ${weeks[wi].days.length + 1}`, exercises: [] });
    setF('weeks', weeks);
  };

  const removeDay = (wi, di) => {
    const weeks = [...planForm.weeks];
    weeks[wi].days = weeks[wi].days.filter((_, i) => i !== di);
    setF('weeks', weeks);
  };

  const setDayName = (wi, di, v) => {
    const weeks = [...planForm.weeks];
    weeks[wi].days[di].dayName = v;
    setF('weeks', weeks);
  };

  const addExerciseToDay = (wi, di) => {
    const weeks = [...planForm.weeks];
    weeks[wi].days[di].exercises.push({ name: '', sets: 3, reps: '10', restSeconds: 60, notes: '' });
    setF('weeks', weeks);
  };

  const setExField = (wi, di, ei, k, v) => {
    const weeks = [...planForm.weeks];
    weeks[wi].days[di].exercises[ei][k] = v;
    setF('weeks', weeks);
  };

  const removeExercise = (wi, di, ei) => {
    const weeks = [...planForm.weeks];
    weeks[wi].days[di].exercises = weeks[wi].days[di].exercises.filter((_, i) => i !== ei);
    setF('weeks', weeks);
  };

  const openEdit = (plan) => {
    setEditPlan(plan._id);
    setPlanForm({ name: plan.name, description: plan.description || '', goalType: plan.goalType || 'gain_muscle', weeks: plan.weeks || [] });
    setPlanModal(true);
  };

  const handleSavePlan = async () => {
    if (!planForm.name) { showToast('Plan name is required.', 'error'); return; }
    try {
      if (editPlan) {
        await api.put(`/api/workouts/plans/${editPlan}`, planForm);
        showToast('Plan updated!', 'success');
      } else {
        await api.post('/api/workouts/plans', planForm);
        showToast('Plan created!', 'success');
      }
      setPlanModal(false); setEditPlan(null); setPlanForm(emptyPlan()); fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try { await api.delete(`/api/workouts/plans/${id}`); showToast('Plan deleted.', 'success'); fetchAll(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const resetExForm = () => {
    setExForm({ name:'', muscleGroup:'Chest', description:'' });
    setExMediaType('images');
    setExImageFiles([null, null, null]);
    setExImagePreviews([null, null, null]);
    setExVideoFile(null);
    setExVideoPreview(null);
  };

  const handleImageSelect = (i, file) => {
    if (!file) return;
    const files = [...exImageFiles]; files[i] = file;
    setExImageFiles(files);
    const reader = new FileReader();
    reader.onload = ev => {
      const prev = [...exImagePreviews]; prev[i] = ev.target.result;
      setExImagePreviews(prev);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (i) => {
    const files = [...exImageFiles]; files[i] = null; setExImageFiles(files);
    const prev = [...exImagePreviews]; prev[i] = null; setExImagePreviews(prev);
  };

  const handleVideoSelect = (file) => {
    if (!file) return;
    setExVideoFile(file);
    setExVideoPreview(URL.createObjectURL(file));
  };

  const handleVideoRemove = () => {
    setExVideoFile(null);
    if (exVideoPreview) URL.revokeObjectURL(exVideoPreview);
    setExVideoPreview(null);
  };

  const handleSaveExercise = async () => {
    if (!exForm.name) { showToast('Exercise name is required.', 'error'); return; }
    setSavingEx(true);
    try {
      const payload = { ...exForm };

      if (exMediaType === 'images') {
        const imageUrls = [];
        for (let i = 0; i < 3; i++) {
          if (exImageFiles[i]) {
            const url = await uploadFile(exImageFiles[i], 'image');
            imageUrls.push(url);
          }
        }
        if (imageUrls.length > 0) payload.images = imageUrls;
      } else if (exMediaType === 'video' && exVideoFile) {
        const videoUrl = await uploadFile(exVideoFile, 'video');
        payload.video = videoUrl;
      }

      await api.post('/api/workouts/exercises', payload);
      showToast('Exercise added to library!', 'success');
      setExModal(false); resetExForm(); fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSavingEx(false); }
  };

  const handleDeleteExercise = async (id) => {
    try { await api.delete(`/api/workouts/exercises/${id}`); showToast('Exercise deleted.', 'success'); fetchAll(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleAssign = async () => {
    if (!assignForm.clientId) { showToast('Select a client.', 'error'); return; }
    try {
      await api.post('/api/workouts/assign', { clientId: assignForm.clientId, planId: assignModal._id, startDate: assignForm.startDate });
      showToast('Plan assigned!', 'success'); setAssignModal(null);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAssignExercise = async () => {
    if (!assignExForm.clientIds.length) { showToast('Select at least one client.', 'error'); return; }
    setAssigningSaving(true);
    try {
      await api.post(`/api/workouts/exercises/${assignExModal._id}/assign`, assignExForm);
      showToast('Exercise assigned!', 'success');
      setAssignExModal(null);
      setAssignExForm({ clientIds: [], notes: '' });
      setClientSearch('');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setAssigningSaving(false); }
  };

  const toggleClientSelection = (clientId) => {
    setAssignExForm(prev => ({
      ...prev,
      clientIds: prev.clientIds.includes(clientId)
        ? prev.clientIds.filter(id => id !== clientId)
        : [...prev.clientIds, clientId],
    }));
  };

  const filteredClients = clients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Bebas_Neue'] text-[32px] sm:text-[40px] text-[#f0ede6] leading-none">Workouts</h1>
          <div className="flex gap-2">
            {activeTab === 'Plans' && (
              <button onClick={() => { setEditPlan(null); setPlanForm(emptyPlan()); setPlanModal(true); }}
                className="font-['Bebas_Neue'] text-[16px] sm:text-[18px] tracking-[0.04em] px-4 sm:px-5 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity min-h-[44px]">
                + Plan
              </button>
            )}
            {activeTab === 'Exercises' && (
              <button onClick={() => setExModal(true)}
                className="font-['Bebas_Neue'] text-[16px] sm:text-[18px] tracking-[0.04em] px-4 sm:px-5 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity min-h-[44px]">
                + Exercise
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-0 border-b border-[#2a2a2a] mb-6">
          {['Plans','Exercises'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-['DM_Mono'] text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border-b-2 transition-colors -mb-px min-h-[44px] ${
                activeTab === tab ? 'border-[#c8f135] text-[#c8f135]' : 'border-transparent text-[#555] hover:text-[#888]'
              }`}>{tab}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="font-['Bebas_Neue'] text-[#c8f135] text-xl tracking-widest animate-pulse">LOADING...</div>
          </div>
        ) : activeTab === 'Plans' ? (
          plans.length === 0 ? (
            <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
              <div className="font-['Bebas_Neue'] text-[48px] text-[#222] mb-3">NO PLANS</div>
              <p className="text-[#555] text-[13px] font-['DM_Sans']">Build your first workout plan and assign it to clients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan._id} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5 hover:border-[#383838] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-['Bebas_Neue'] text-[22px] text-[#f0ede6]">{plan.name}</h3>
                      <span className="font-['DM_Mono'] text-[10px] uppercase text-[#c8f135]">{GOAL_LABELS[plan.goalType]}</span>
                    </div>
                  </div>
                  {plan.description && <p className="text-[#555] text-[12px] font-['DM_Sans'] mb-3">{plan.description}</p>}
                  <div className="font-['DM_Mono'] text-[11px] text-[#555] mb-4">
                    {plan.weeks?.length || 0} week{plan.weeks?.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setAssignModal(plan)}
                      className="font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] bg-[rgba(200,241,53,0.1)] text-[#c8f135] border border-[#c8f135] hover:bg-[rgba(200,241,53,0.2)] transition-colors min-h-[36px]">
                      Assign
                    </button>
                    <button onClick={() => openEdit(plan)}
                      className="font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors min-h-[36px]">
                      Edit
                    </button>
                    <button onClick={() => handleDeletePlan(plan._id)}
                      className="font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] text-[#e85d4a] border border-[#e85d4a] hover:bg-[rgba(232,93,74,0.08)] transition-colors min-h-[36px]">
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          exercises.length === 0 ? (
            <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
              <div className="font-['Bebas_Neue'] text-[48px] text-[#222] mb-3">NO EXERCISES</div>
              <p className="text-[#555] text-[13px] font-['DM_Sans']">Add exercises to your library to use in plans.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map(ex => (
                <div key={ex._id} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-4 hover:border-[#383838] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-['DM_Sans'] text-[14px] font-medium text-[#f0ede6]">{ex.name}</span>
                        {ex.muscleGroup && <span className="font-['DM_Mono'] text-[10px] uppercase text-[#c8f135] tracking-wide">{ex.muscleGroup}</span>}
                        {ex.images?.length > 0 && <span className="font-['DM_Mono'] text-[10px] text-[#555]">📷 {ex.images.length}</span>}
                        {ex.video && <span className="font-['DM_Mono'] text-[10px] text-[#555]">🎥</span>}
                      </div>
                      {ex.description && <p className="text-[12px] text-[#555] mt-1 font-['DM_Sans']">{ex.description}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setAssignExModal(ex); setAssignExForm({ clientIds: [], notes: '' }); setClientSearch(''); }}
                        className="font-['DM_Sans'] text-[11px] sm:text-[12px] px-2 sm:px-3 py-1.5 rounded-[4px] bg-[rgba(200,241,53,0.1)] text-[#c8f135] border border-[#c8f135] hover:bg-[rgba(200,241,53,0.2)] transition-colors min-h-[36px]"
                      >
                        Assign
                      </button>
                      <button onClick={() => handleDeleteExercise(ex._id)} className="font-['DM_Sans'] text-[11px] sm:text-[12px] px-2 sm:px-3 py-1.5 rounded-[4px] text-[#e85d4a] border border-[#e85d4a] hover:bg-[rgba(232,93,74,0.08)] transition-colors min-h-[36px]">Del</button>
                    </div>
                  </div>
                  {/* Exercise images */}
                  {ex.images?.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {ex.images.map((url, i) => (
                        <img key={i} src={url} alt={`${ex.name} ${i+1}`} loading="lazy"
                          className="w-16 h-16 object-cover rounded-[4px] border border-[#2a2a2a] flex-shrink-0" />
                      ))}
                    </div>
                  )}
                  {ex.video && (
                    <div className="mt-3">
                      <video src={ex.video} controls className="w-full max-w-xs rounded-[4px] border border-[#2a2a2a]" style={{ maxHeight: '150px' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Plan builder modal */}
      {planModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={() => setPlanModal(false)}>
          <div className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[700px] sm:max-w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#383838] rounded-full" /></div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Bebas_Neue'] text-[24px] sm:text-[28px] text-[#f0ede6]">{editPlan ? 'EDIT PLAN' : 'NEW PLAN'}</h2>
                <button onClick={() => setPlanModal(false)} className="sm:hidden text-[#555] text-[24px] leading-none">×</button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className={labelClass}>Plan Name *</label>
                  <input type="text" value={planForm.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. 12-Week Cut" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Goal Type</label>
                    <select value={planForm.goalType} onChange={e => setF('goalType', e.target.value)} className={inputClass}>
                      {GOAL_TYPES.map(g => <option key={g} value={g}>{GOAL_LABELS[g]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input type="text" value={planForm.description} onChange={e => setF('description', e.target.value)} placeholder="Optional" className={inputClass} />
                  </div>
                </div>
              </div>

              {planForm.weeks.map((week, wi) => (
                <div key={wi} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4 mb-4">
                  <div className="font-['Bebas_Neue'] text-[18px] text-[#c8f135] mb-3">WEEK {week.weekNumber}</div>
                  {week.days.map((day, di) => (
                    <div key={di} className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-[4px] p-3 mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <input type="text" value={day.dayName} onChange={e => setDayName(wi, di, e.target.value)}
                          className="bg-transparent border-b border-[#383838] text-[#f0ede6] font-['Bebas_Neue'] text-[16px] outline-none focus:border-[#c8f135] flex-1 min-h-[36px]" />
                        <button onClick={() => removeDay(wi, di)} className="text-[#555] hover:text-[#e85d4a] text-[16px] w-8 h-8 flex items-center justify-center">✕</button>
                      </div>
                      {day.exercises.map((ex, ei) => (
                        <div key={ei} className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2 items-center">
                          <input type="text" value={ex.name} onChange={e => setExField(wi,di,ei,'name',e.target.value)} placeholder="Exercise name" className={`${inputClass} col-span-2 sm:col-span-2`} />
                          <input type="number" value={ex.sets} onChange={e => setExField(wi,di,ei,'sets',e.target.value)} placeholder="Sets" className={inputClass} />
                          <input type="text" value={ex.reps} onChange={e => setExField(wi,di,ei,'reps',e.target.value)} placeholder="Reps" className={inputClass} />
                          <button onClick={() => removeExercise(wi,di,ei)} className="text-[#555] hover:text-[#e85d4a] text-[16px] w-8 h-8 flex items-center justify-center">✕</button>
                        </div>
                      ))}
                      <button onClick={() => addExerciseToDay(wi,di)} className="font-['DM_Sans'] text-[11px] text-[#555] hover:text-[#c8f135] mt-1 min-h-[36px]">+ Add exercise</button>
                    </div>
                  ))}
                  <button onClick={() => addDay(wi)} className="font-['DM_Sans'] text-[12px] text-[#555] hover:text-[#c8f135] transition-colors min-h-[36px]">+ Add Day</button>
                </div>
              ))}
              <button onClick={addWeek} className="font-['DM_Mono'] text-[11px] uppercase tracking-wide text-[#555] hover:text-[#c8f135] transition-colors mb-6 min-h-[36px]">+ Add Week</button>

              <div className="flex justify-end gap-2">
                <button onClick={() => setPlanModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors min-h-[44px]">Cancel</button>
                <button onClick={handleSavePlan} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity min-h-[44px]">Save Plan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {exModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={() => { setExModal(false); resetExForm(); }}>
          <div className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[480px] sm:max-w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#383838] rounded-full" /></div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Bebas_Neue'] text-[24px] sm:text-[28px] text-[#f0ede6]">ADD EXERCISE</h2>
                <button onClick={() => { setExModal(false); resetExForm(); }} className="sm:hidden text-[#555] text-[24px] leading-none">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input type="text" value={exForm.name} onChange={e => setExForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Barbell Squat" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Muscle Group</label>
                  <select value={exForm.muscleGroup} onChange={e => setExForm(p => ({...p, muscleGroup: e.target.value}))} className={inputClass}>
                    {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={exForm.description} onChange={e => setExForm(p => ({...p, description: e.target.value}))} rows={2} className={`${inputClass} resize-none`} />
                </div>

                <ExerciseMediaSection
                  mediaType={exMediaType}
                  setMediaType={(t) => { setExMediaType(t); if (t === 'images') handleVideoRemove(); else { setExImageFiles([null,null,null]); setExImagePreviews([null,null,null]); } }}
                  imagePreviews={exImagePreviews}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  videoPreview={exVideoPreview}
                  onVideoSelect={handleVideoSelect}
                  onVideoRemove={handleVideoRemove}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => { setExModal(false); resetExForm(); }} className="font-['DM_Sans'] text-[13px] px-4 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors min-h-[44px]">Cancel</button>
                  <button onClick={handleSaveExercise} disabled={savingEx} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]">
                    {savingEx ? 'Uploading...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={() => setAssignModal(null)}>
          <div className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[380px] sm:max-w-[95vw]" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#383838] rounded-full" /></div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-['Bebas_Neue'] text-[22px] sm:text-[24px] text-[#f0ede6]">ASSIGN PLAN</h2>
                <button onClick={() => setAssignModal(null)} className="sm:hidden text-[#555] text-[24px] leading-none">×</button>
              </div>
              <p className="font-['DM_Sans'] text-[13px] text-[#555] mb-6">{assignModal.name}</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Client *</label>
                  <select value={assignForm.clientId} onChange={e => setAssignForm(p => ({...p, clientId: e.target.value}))} className={inputClass}>
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" value={assignForm.startDate} onChange={e => setAssignForm(p => ({...p, startDate: e.target.value}))} className={inputClass} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setAssignModal(null)} className="font-['DM_Sans'] text-[13px] px-4 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors min-h-[44px]">Cancel</button>
                  <button onClick={handleAssign} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity min-h-[44px]">Assign</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Exercise to Clients Modal */}
      {assignExModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={() => { setAssignExModal(null); setAssignExForm({ clientIds: [], notes: '' }); setClientSearch(''); }}>
          <div className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[460px] sm:max-w-[95vw] max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 bg-[#383838] rounded-full" /></div>
            <div className="p-6 sm:p-8 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-['Bebas_Neue'] text-[22px] sm:text-[24px] text-[#f0ede6]">ASSIGN EXERCISE</h2>
                <button onClick={() => { setAssignExModal(null); setAssignExForm({ clientIds: [], notes: '' }); setClientSearch(''); }} className="sm:hidden text-[#555] text-[24px] leading-none">×</button>
              </div>
              <p className="font-['DM_Sans'] text-[13px] text-[#555] mb-4">{assignExModal.name}</p>
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2 rounded-[4px] outline-none focus:border-[#c8f135] mb-1"
              />
              <div className="text-[11px] text-[#555] font-['DM_Mono'] mb-2">
                {assignExForm.clientIds.length} selected
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8">
              {filteredClients.length === 0 ? (
                <p className="text-[#555] text-[13px] font-['DM_Sans'] py-4">No clients found.</p>
              ) : filteredClients.map(c => (
                <label key={c._id} className="flex items-center gap-3 py-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={assignExForm.clientIds.includes(c._id)}
                    onChange={() => toggleClientSelection(c._id)}
                    className="w-4 h-4 accent-[#c8f135] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[13px] font-['DM_Sans'] text-[#f0ede6] group-hover:text-[#c8f135] transition-colors">
                    {c.firstName} {c.lastName}
                  </span>
                  {c.goalType && (
                    <span className="text-[10px] font-['DM_Mono'] text-[#555] uppercase">{c.goalType.replace('_', ' ')}</span>
                  )}
                </label>
              ))}
            </div>

            <div className="p-6 sm:p-8 flex-shrink-0 border-t border-[#2a2a2a]">
              <div className="mb-4">
                <label className={labelClass}>Notes (optional)</label>
                <input
                  type="text"
                  value={assignExForm.notes}
                  onChange={e => setAssignExForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="E.g. 3×12 with 60s rest"
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setAssignExModal(null); setAssignExForm({ clientIds: [], notes: '' }); setClientSearch(''); }} className="font-['DM_Sans'] text-[13px] px-4 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors min-h-[44px]">Cancel</button>
                <button onClick={handleAssignExercise} disabled={assigningSaving} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]">
                  {assigningSaving ? 'Saving...' : `Assign to ${assignExForm.clientIds.length || ''} Client${assignExForm.clientIds.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
