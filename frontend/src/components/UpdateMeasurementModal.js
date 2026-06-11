import React from 'react';

const Field = ({ label, name, value, onChange, placeholder = '—' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">{label}</label>
    <input
      type="number"
      value={value}
      onChange={e => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors"
    />
  </div>
);

const UpdateMeasurementModal = ({ isOpen, onClose, newMeasurement, setNewMeasurement, onAddMeasurement, isEditing }) => {
  if (!isOpen) return null;

  const set = (name, value) => setNewMeasurement(prev => ({ ...prev, [name]: value }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div
        className="bg-[#161616] border border-[#383838] rounded-[6px] p-8 w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-['Bebas_Neue'] text-[32px] text-[#f0ede6] mb-6">
          {isEditing ? 'EDIT MEASUREMENT' : 'UPDATE MEASURES'}
        </h2>

        <div className="mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Date *</label>
            <input
              type="date"
              value={newMeasurement.date}
              onChange={e => set('date', e.target.value)}
              className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Weight (kg)" name="weight" value={newMeasurement.weight} onChange={set} />
          <Field label="Height (cm)" name="height" value={newMeasurement.height} onChange={set} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Body Fat (%)" name="bodyFat" value={newMeasurement.bodyFat} onChange={set} />
          <Field label="Muscle Mass (kg)" name="muscleMass" value={newMeasurement.muscleMass} onChange={set} />
        </div>

        <div className="h-[1px] bg-[#2a2a2a] my-4" />
        <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">Circumferences (cm)</div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Neck" name="neck" value={newMeasurement.neck} onChange={set} />
          <Field label="Shoulders" name="shoulders" value={newMeasurement.shoulders} onChange={set} />
          <Field label="Chest" name="chest" value={newMeasurement.chest} onChange={set} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Waist" name="waist" value={newMeasurement.waist} onChange={set} />
          <Field label="Hips" name="hips" value={newMeasurement.hips} onChange={set} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Arm" name="leftArm" value={newMeasurement.leftArm} onChange={set} />
          <Field label="Right Arm" name="rightArm" value={newMeasurement.rightArm} onChange={set} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Forearm" name="leftForearm" value={newMeasurement.leftForearm} onChange={set} />
          <Field label="Right Forearm" name="rightForearm" value={newMeasurement.rightForearm} onChange={set} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Thigh" name="leftThigh" value={newMeasurement.leftThigh} onChange={set} />
          <Field label="Right Thigh" name="rightThigh" value={newMeasurement.rightThigh} onChange={set} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Calf" name="leftCalf" value={newMeasurement.leftCalf} onChange={set} />
          <Field label="Right Calf" name="rightCalf" value={newMeasurement.rightCalf} onChange={set} />
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Session Notes</label>
            <textarea
              value={newMeasurement.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="What happened this session..."
              rows={3}
              className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] resize-vertical"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] border border-[#383838] bg-[#1f1f1f] text-[#f0ede6] hover:bg-[#2a2a2a] transition-colors">
            Cancel
          </button>
          <button onClick={onAddMeasurement} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] border border-[#c8f135] hover:opacity-90 transition-opacity">
            {isEditing ? 'Save Changes' : 'Save Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateMeasurementModal;
