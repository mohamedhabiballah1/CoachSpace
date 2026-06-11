import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Arms','Legs','Core','Full Body','Cardio'];
const GOAL_TYPES = ['lose_fat','gain_muscle','body_recomp','maintenance'];
const GOAL_LABELS = { lose_fat:'Lose Fat', gain_muscle:'Gain Muscle', body_recomp:'Body Recomp', maintenance:'Maintenance' };

const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors";
const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";

const emptyPlan = () => ({
  name: '', description: '', goalType: 'gain_muscle',
  weeks: [{ weekNumber: 1, days: [{ dayName: 'Day 1', exercises: [] }] }],
});

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
  const [editPlan, setEditPlan]   = useState(null);
  const [planForm, setPlanForm]   = useState(emptyPlan());
  const [exForm, setExForm]       = useState({ name:'', muscleGroup:'Chest', description:'' });
  const [assignForm, setAssignForm] = useState({ clientId:'', startDate: new Date().toISOString().slice(0,10) });

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

  // Plan builder helpers
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

  const handleSaveExercise = async () => {
    if (!exForm.name) { showToast('Exercise name is required.', 'error'); return; }
    try {
      await api.post('/api/workouts/exercises', exForm);
      showToast('Exercise added to library!', 'success');
      setExModal(false); setExForm({ name:'', muscleGroup:'Chest', description:'' }); fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteExercise = async (id) => {
    try { await api.delete(`/api/workouts/exercises/${id}`); showToast('Exercise deleted.', 'success'); fetchAll(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleAssign = async () => {
    if (!assignForm.clientId) { showToast('Select a client.', 'error'); return; }
    try {
      await api.post('/api/workouts/assign', { clientId: assignForm.clientId, planId: assignModal._id, startDate: assignForm.startDate });
      showToast(`Plan assigned!`, 'success'); setAssignModal(null);
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Bebas_Neue'] text-[40px] text-[#f0ede6] leading-none">Workouts</h1>
          <div className="flex gap-2">
            {activeTab === 'Plans' && (
              <button onClick={() => { setEditPlan(null); setPlanForm(emptyPlan()); setPlanModal(true); }}
                className="font-['Bebas_Neue'] text-[18px] tracking-[0.04em] px-5 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">
                + Plan
              </button>
            )}
            {activeTab === 'Exercises' && (
              <button onClick={() => setExModal(true)}
                className="font-['Bebas_Neue'] text-[18px] tracking-[0.04em] px-5 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">
                + Exercise
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#2a2a2a] mb-6">
          {['Plans','Exercises'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-['DM_Mono'] text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border-b-2 transition-colors -mb-px ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="flex gap-2">
                    <button onClick={() => setAssignModal(plan)}
                      className="font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] bg-[rgba(200,241,53,0.1)] text-[#c8f135] border border-[#c8f135] hover:bg-[rgba(200,241,53,0.2)] transition-colors">
                      Assign
                    </button>
                    <button onClick={() => openEdit(plan)}
                      className="font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDeletePlan(plan._id)}
                      className="font-['DM_Sans'] text-[12px] px-3 py-1.5 rounded-[4px] text-[#e85d4a] border border-[#e85d4a] hover:bg-[rgba(232,93,74,0.08)] transition-colors">
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Exercises tab
          exercises.length === 0 ? (
            <div className="border border-[#2a2a2a] rounded-[4px] p-12 text-center">
              <div className="font-['Bebas_Neue'] text-[48px] text-[#222] mb-3">NO EXERCISES</div>
              <p className="text-[#555] text-[13px] font-['DM_Sans']">Add exercises to your library to use in plans.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Name','Muscle Group','Description',''].map(h => (
                      <th key={h} className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] text-left px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exercises.map(ex => (
                    <tr key={ex._id} className="border-b border-[#2a2a2a] hover:bg-[#161616] transition-colors">
                      <td className="px-4 py-3 font-['DM_Sans'] text-[13px] text-[#f0ede6]">{ex.name}</td>
                      <td className="px-4 py-3 font-['DM_Mono'] text-[11px] text-[#888]">{ex.muscleGroup}</td>
                      <td className="px-4 py-3 font-['DM_Sans'] text-[12px] text-[#555] max-w-[300px] truncate">{ex.description || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteExercise(ex._id)} className="text-[11px] font-['DM_Mono'] text-[#555] hover:text-[#e85d4a] transition-colors">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>

      {/* Plan builder modal */}
      {planModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={() => setPlanModal(false)}>
          <div className="bg-[#161616] border border-[#383838] rounded-[6px] p-8 w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="font-['Bebas_Neue'] text-[28px] text-[#f0ede6] mb-6">{editPlan ? 'EDIT PLAN' : 'NEW PLAN'}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Plan Name *</label>
                <input type="text" value={planForm.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. 12-Week Cut" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
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

            {/* Weeks */}
            {planForm.weeks.map((week, wi) => (
              <div key={wi} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4 mb-4">
                <div className="font-['Bebas_Neue'] text-[18px] text-[#c8f135] mb-3">WEEK {week.weekNumber}</div>
                {week.days.map((day, di) => (
                  <div key={di} className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-[4px] p-3 mb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <input type="text" value={day.dayName} onChange={e => setDayName(wi, di, e.target.value)}
                        className="bg-transparent border-b border-[#383838] text-[#f0ede6] font-['Bebas_Neue'] text-[16px] outline-none focus:border-[#c8f135] flex-1" />
                      <button onClick={() => removeDay(wi, di)} className="text-[#555] hover:text-[#e85d4a] text-[12px]">✕</button>
                    </div>
                    {day.exercises.map((ex, ei) => (
                      <div key={ei} className="grid grid-cols-5 gap-2 mb-2 items-center">
                        <input type="text" value={ex.name} onChange={e => setExField(wi,di,ei,'name',e.target.value)} placeholder="Exercise name" className={`${inputClass} col-span-2`} />
                        <input type="number" value={ex.sets} onChange={e => setExField(wi,di,ei,'sets',e.target.value)} placeholder="Sets" className={inputClass} />
                        <input type="text" value={ex.reps} onChange={e => setExField(wi,di,ei,'reps',e.target.value)} placeholder="Reps" className={inputClass} />
                        <button onClick={() => removeExercise(wi,di,ei)} className="text-[#555] hover:text-[#e85d4a] text-[12px]">✕</button>
                      </div>
                    ))}
                    <button onClick={() => addExerciseToDay(wi,di)} className="font-['DM_Sans'] text-[11px] text-[#555] hover:text-[#c8f135] mt-1">+ Add exercise</button>
                  </div>
                ))}
                <button onClick={() => addDay(wi)} className="font-['DM_Sans'] text-[12px] text-[#555] hover:text-[#c8f135] transition-colors">+ Add Day</button>
              </div>
            ))}
            <button onClick={addWeek} className="font-['DM_Mono'] text-[11px] uppercase tracking-wide text-[#555] hover:text-[#c8f135] transition-colors mb-6">+ Add Week</button>

            <div className="flex justify-end gap-2">
              <button onClick={() => setPlanModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Cancel</button>
              <button onClick={handleSavePlan} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">Save Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {exModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={() => setExModal(false)}>
          <div className="bg-[#161616] border border-[#383838] rounded-[6px] p-8 w-[420px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
            <h2 className="font-['Bebas_Neue'] text-[28px] text-[#f0ede6] mb-6">ADD EXERCISE</h2>
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
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setExModal(false)} className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Cancel</button>
                <button onClick={handleSaveExercise} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={() => setAssignModal(null)}>
          <div className="bg-[#161616] border border-[#383838] rounded-[6px] p-8 w-[380px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
            <h2 className="font-['Bebas_Neue'] text-[24px] text-[#f0ede6] mb-2">ASSIGN PLAN</h2>
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
                <button onClick={() => setAssignModal(null)} className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">Cancel</button>
                <button onClick={handleAssign} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
