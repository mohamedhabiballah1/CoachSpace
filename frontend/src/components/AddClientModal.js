import React from 'react';

const Field = ({ label, name, value, onChange, type = 'number', placeholder = '' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors"
    />
  </div>
);

const AddClientModal = ({ isOpen, onClose, newClient, setNewClient, onAddClient }) => {
  if (!isOpen) return null;

  const set = (name, value) => setNewClient(prev => ({ ...prev, [name]: value }));

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-[#161616] border border-[#383838] rounded-[6px] p-8 w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-['Bebas_Neue'] text-[32px] text-[#f0ede6] mb-6">NEW CLIENT</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="First Name *" name="firstName" value={newClient.firstName} onChange={set} type="text" placeholder="Yassine" />
          <Field label="Last Name *" name="lastName" value={newClient.lastName} onChange={set} type="text" placeholder="Alami" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Email" name="email" value={newClient.email} onChange={set} type="email" placeholder="email@example.com" />
          <Field label="Phone" name="number" value={newClient.number} onChange={set} type="text" placeholder="+212 6xx xxx xxx" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Start Date *" name="startDate" value={newClient.startDate} onChange={set} type="date" />
          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Goal Type</label>
            <select
              value={newClient.goalType}
              onChange={e => set('goalType', e.target.value)}
              className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135]"
            >
              <option value="lose_fat">Lose Fat</option>
              <option value="gain_muscle">Gain Muscle</option>
              <option value="body_recomp">Body Recomp</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="h-[1px] bg-[#2a2a2a] my-5" />
        <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#c8f135] mb-4">Starting Measures</div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Weight (kg)" name="weight" value={newClient.weight} onChange={set} placeholder="80" />
          <Field label="Height (cm)" name="height" value={newClient.height} onChange={set} placeholder="175" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Body Fat (%)" name="bodyFat" value={newClient.bodyFat} onChange={set} placeholder="20" />
          <Field label="Muscle Mass (kg)" name="muscleMass" value={newClient.muscleMass} onChange={set} placeholder="45" />
        </div>

        <div className="h-[1px] bg-[#2a2a2a] my-5" />
        <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">Circumferences (cm)</div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Neck" name="neck" value={newClient.neck} onChange={set} placeholder="38" />
          <Field label="Shoulders" name="shoulders" value={newClient.shoulders} onChange={set} placeholder="120" />
          <Field label="Chest" name="chest" value={newClient.chest} onChange={set} placeholder="100" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Waist" name="waist" value={newClient.waist} onChange={set} placeholder="85" />
          <Field label="Hips" name="hips" value={newClient.hips} onChange={set} placeholder="95" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Arm" name="leftArm" value={newClient.leftArm} onChange={set} placeholder="35" />
          <Field label="Right Arm" name="rightArm" value={newClient.rightArm} onChange={set} placeholder="35" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Forearm" name="leftForearm" value={newClient.leftForearm} onChange={set} placeholder="28" />
          <Field label="Right Forearm" name="rightForearm" value={newClient.rightForearm} onChange={set} placeholder="28" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Thigh" name="leftThigh" value={newClient.leftThigh} onChange={set} placeholder="55" />
          <Field label="Right Thigh" name="rightThigh" value={newClient.rightThigh} onChange={set} placeholder="55" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Left Calf" name="leftCalf" value={newClient.leftCalf} onChange={set} placeholder="38" />
          <Field label="Right Calf" name="rightCalf" value={newClient.rightCalf} onChange={set} placeholder="38" />
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Notes</label>
            <textarea
              value={newClient.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any relevant health notes, injuries, diet info..."
              rows={3}
              className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] resize-vertical"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] border border-[#383838] bg-[#1f1f1f] text-[#f0ede6] hover:bg-[#2a2a2a] transition-colors">
            Cancel
          </button>
          <button onClick={onAddClient} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] border border-[#c8f135] hover:opacity-90 transition-opacity">
            Register Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
