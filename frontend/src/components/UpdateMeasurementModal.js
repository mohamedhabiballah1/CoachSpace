import React, { useRef, useState } from 'react';
import { uploadFile } from '../utils/upload';
import { useToast } from '../context/ToastContext';

const Field = ({ label, name, value, onChange, placeholder = '—' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">{label}</label>
    <input
      type="number"
      value={value}
      onChange={e => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors min-h-[44px]"
    />
  </div>
);

const ANGLES = ['front', 'side', 'back'];

const PhotoSlot = ({ angle, preview, onSelect, onRemove }) => {
  const ref = useRef(null);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        onClick={() => !preview && ref.current?.click()}
        className={`w-full aspect-square rounded-[4px] border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group transition-colors ${
          preview ? 'border-[#383838]' : 'border-[#2a2a2a] hover:border-[#555]'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={angle} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onRemove(); }}
                className="text-[#e85d4a] text-[20px] leading-none"
              >
                ×
              </button>
            </div>
          </>
        ) : (
          <span className="text-[#555] text-[24px]">+</span>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => onSelect(e.target.files[0])} />
      <span className="font-['DM_Mono'] text-[10px] uppercase text-[#555] tracking-wide">{angle}</span>
    </div>
  );
};

const UpdateMeasurementModal = ({ isOpen, onClose, newMeasurement, setNewMeasurement, onAddMeasurement, isEditing }) => {
  const { showToast } = useToast();
  const [photoFiles, setPhotoFiles] = useState({ front: null, side: null, back: null });
  const [photoPreviews, setPhotoPreviews] = useState({ front: null, side: null, back: null });
  const [uploading, setUploading] = useState(false);

  const set = (name, value) => setNewMeasurement(prev => ({ ...prev, [name]: value }));

  const handlePhotoSelect = (angle, file) => {
    if (!file) return;
    setPhotoFiles(prev => ({ ...prev, [angle]: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreviews(prev => ({ ...prev, [angle]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = (angle) => {
    setPhotoFiles(prev => ({ ...prev, [angle]: null }));
    setPhotoPreviews(prev => ({ ...prev, [angle]: null }));
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const photos = [];
      for (const angle of ANGLES) {
        if (photoFiles[angle]) {
          const url = await uploadFile(photoFiles[angle], 'image');
          photos.push({ url, angle });
        }
      }
      await onAddMeasurement(photos.length > 0 ? photos : undefined);
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPhotoFiles({ front: null, side: null, back: null });
    setPhotoPreviews({ front: null, side: null, back: null });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]" onClick={handleClose}>
      <div
        className="bg-[#161616] border border-[#383838] rounded-t-[12px] sm:rounded-[6px] w-full sm:w-[560px] sm:max-w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#383838] rounded-full" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Bebas_Neue'] text-[28px] sm:text-[32px] text-[#f0ede6]">
              {isEditing ? 'EDIT MEASUREMENT' : 'UPDATE MEASURES'}
            </h2>
            <button onClick={handleClose} className="sm:hidden text-[#555] hover:text-[#f0ede6] text-[24px] leading-none transition-colors">×</button>
          </div>

          <div className="mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Date *</label>
              <input
                type="date"
                value={newMeasurement.date}
                onChange={e => set('date', e.target.value)}
                className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] min-h-[44px]"
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
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

          <div className="mb-4">
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

          {/* Progress Photos */}
          <div className="h-[1px] bg-[#2a2a2a] my-4" />
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#c8f135] mb-4">Progress Photos <span className="text-[#555]">(optional)</span></div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {ANGLES.map(angle => (
              <PhotoSlot
                key={angle}
                angle={angle}
                preview={photoPreviews[angle]}
                onSelect={file => handlePhotoSelect(angle, file)}
                onRemove={() => handlePhotoRemove(angle)}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] border border-[#383838] bg-[#1f1f1f] text-[#f0ede6] hover:bg-[#2a2a2a] transition-colors min-h-[44px]">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={uploading} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] border border-[#c8f135] hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]">
              {uploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Save Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateMeasurementModal;
