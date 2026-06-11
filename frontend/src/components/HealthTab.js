import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

const BOOL_FIELDS = [
  { key: 'hasHeartCondition', label: 'Heart Condition' },
  { key: 'hasDiabetes',       label: 'Diabetes' },
  { key: 'hasJointIssues',    label: 'Joint Issues' },
];

const HealthTab = ({ client, onRefresh }) => {
  const { showToast } = useToast();
  const hq = client.healthQuestionnaire || {};

  const [form, setForm] = useState({
    medicalNotes: client.medicalNotes || '',
    injuries: (client.injuries || []).join(', '),
    hasHeartCondition: hq.hasHeartCondition || false,
    hasDiabetes:       hq.hasDiabetes       || false,
    hasJointIssues:    hq.hasJointIssues     || false,
    medications:       hq.medications        || '',
    otherNotes:        hq.otherNotes         || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/client/clients/${client._id}/health`, {
        medicalNotes: form.medicalNotes,
        injuries: form.injuries.split(',').map(s => s.trim()).filter(Boolean),
        healthQuestionnaire: {
          hasHeartCondition: form.hasHeartCondition,
          hasDiabetes:       form.hasDiabetes,
          hasJointIssues:    form.hasJointIssues,
          medications:       form.medications,
          otherNotes:        form.otherNotes,
        },
      });
      showToast('Health profile saved!', 'success');
      onRefresh?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";
  const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors";

  return (
    <div className="max-w-2xl">
      <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-6">Health Profile</div>

      {/* Questionnaire checkboxes */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5 mb-5">
        <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.08em] mb-4">Conditions</div>
        <div className="grid grid-cols-3 gap-4">
          {BOOL_FIELDS.map(f => (
            <label key={f.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[f.key]}
                onChange={e => set(f.key, e.target.checked)}
                className="accent-[#c8f135] w-4 h-4"
              />
              <span className="text-[13px] font-['DM_Sans'] text-[#888]">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div className="mb-4">
        <label className={labelClass}>Medications</label>
        <input type="text" value={form.medications} onChange={e => set('medications', e.target.value)}
          placeholder="List any medications..." className={inputClass} />
      </div>

      {/* Injuries */}
      <div className="mb-4">
        <label className={labelClass}>Injuries (comma-separated)</label>
        <input type="text" value={form.injuries} onChange={e => set('injuries', e.target.value)}
          placeholder="e.g. lower back, left knee" className={inputClass} />
        {/* Tag preview */}
        {form.injuries && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.injuries.split(',').map(s => s.trim()).filter(Boolean).map((inj, i) => (
              <span key={i} className="bg-[rgba(232,93,74,0.12)] border border-[#e85d4a] text-[#e85d4a] text-[11px] font-['DM_Mono'] px-2 py-0.5 rounded-full">
                {inj}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Medical notes */}
      <div className="mb-4">
        <label className={labelClass}>Medical Notes</label>
        <textarea value={form.medicalNotes} onChange={e => set('medicalNotes', e.target.value)}
          rows={3} placeholder="Any relevant medical information..."
          className={`${inputClass} resize-vertical`} />
      </div>

      {/* Other notes */}
      <div className="mb-6">
        <label className={labelClass}>Other Notes</label>
        <textarea value={form.otherNotes} onChange={e => set('otherNotes', e.target.value)}
          rows={2} placeholder="Additional notes..."
          className={`${inputClass} resize-vertical`} />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="font-['DM_Sans'] text-[13px] font-medium px-5 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Health Profile'}
      </button>
    </div>
  );
};

export default HealthTab;
