import React, { useState, useRef, useEffect } from 'react';
import { uploadFile } from '../utils/upload';
import { useToast } from '../context/ToastContext';

const COUNTRIES = [
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
];

const Field = ({ label, name, value, onChange, type = 'number', placeholder = '' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors min-h-[44px]"
    />
  </div>
);

const CountryCodeSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-full w-full flex items-center gap-1.5 bg-[#1f1f1f] border border-[#383838] px-3 py-2.5 rounded-[4px] text-[#f0ede6] font-['DM_Sans'] text-[13px] hover:border-[#555] transition-colors min-h-[44px] whitespace-nowrap"
      >
        <span>{selected.flag}</span>
        <span className="text-[#888]">{selected.code}</span>
        <span className="text-[#555] text-[10px] ml-0.5">▾</span>
      </button>

      {open && (
        <>
          {/* Desktop dropdown */}
          <div className="hidden sm:block absolute z-[200] top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-[#383838] rounded-[4px] shadow-xl overflow-hidden">
            <div className="p-2 border-b border-[#2a2a2a]">
              <input
                autoFocus
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] text-[12px] px-2 py-1.5 rounded-[4px] outline-none focus:border-[#c8f135] font-['DM_Sans']"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((c, i) => (
                <button
                  key={`${c.code}-${i}`}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] text-left transition-colors"
                >
                  <span>{c.flag}</span>
                  <span className="text-[#888] font-['DM_Mono'] text-[11px] w-10">{c.code}</span>
                  <span className="text-[#f0ede6] font-['DM_Sans'] text-[12px]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="sm:hidden fixed inset-0 z-[200]" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bottom-0 left-0 right-0 bg-[#161616] border-t border-[#383838] rounded-t-[12px] max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-[#2a2a2a] flex items-center gap-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] text-[13px] px-3 py-2 rounded-[4px] outline-none focus:border-[#c8f135] font-['DM_Sans']"
                />
                <button onClick={() => setOpen(false)} className="text-[#555] text-[20px] leading-none">×</button>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {filtered.map((c, i) => (
                  <button
                    key={`${c.code}-${i}`}
                    type="button"
                    onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] text-left transition-colors rounded-[4px]"
                  >
                    <span className="text-[20px]">{c.flag}</span>
                    <span className="text-[#888] font-['DM_Mono'] text-[12px] w-12">{c.code}</span>
                    <span className="text-[#f0ede6] font-['DM_Sans'] text-[14px]">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getAvatarColor = (name) => {
  const colors = ['#c8f135', '#5b8af5', '#f5a35b', '#e85d4a', '#a78bfa', '#34d399'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const AddClientModal = ({ isOpen, onClose, newClient, setNewClient, onAddClient }) => {
  const { showToast } = useToast();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [countryCode, setCountryCode] = useState('+212');
  const fileRef = useRef(null);

  const set = (name, value) => setNewClient(prev => ({ ...prev, [name]: value }));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      let profileImageUrl = undefined;
      if (imageFile) {
        profileImageUrl = await uploadFile(imageFile, 'image');
      }
      if (profileImageUrl) {
        setNewClient(prev => ({ ...prev, profileImage: profileImageUrl }));
        await onAddClient({ profileImage: profileImageUrl });
      } else {
        await onAddClient({});
      }
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImagePreview(null);
    setImageFile(null);
    setCountryCode('+212');
    onClose();
  };

  if (!isOpen) return null;

  const initials = `${newClient.firstName?.[0] || ''}${newClient.lastName?.[0] || ''}`.toUpperCase();
  const avatarColor = getAvatarColor(`${newClient.firstName}${newClient.lastName}` || 'A');

  return (
    <>
      {/* Desktop: centered modal | Mobile: full screen */}
      <div
        className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1000]"
        onClick={handleClose}
      >
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
              <h2 className="font-['Bebas_Neue'] text-[28px] sm:text-[32px] text-[#f0ede6]">NEW CLIENT</h2>
              <button onClick={handleClose} className="sm:hidden text-[#555] hover:text-[#f0ede6] text-[24px] leading-none transition-colors">×</button>
            </div>

            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative w-20 h-20 rounded-full cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-[#383838]" />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full border-2 border-dashed border-[#383838] flex items-center justify-center font-['Bebas_Neue'] text-[24px]"
                    style={{ backgroundColor: initials ? `${avatarColor}22` : '#1f1f1f', color: initials ? avatarColor : '#555' }}
                  >
                    {initials || '?'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[20px]">📷</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <p className="font-['DM_Mono'] text-[10px] text-[#555] mt-2 uppercase tracking-wide">
                {imagePreview ? 'Tap to change' : 'Add Photo'}
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="First Name *" name="firstName" value={newClient.firstName} onChange={set} type="text" placeholder="Yassine" />
              <Field label="Last Name *" name="lastName" value={newClient.lastName} onChange={set} type="text" placeholder="Alami" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Email" name="email" value={newClient.email} onChange={set} type="email" placeholder="email@example.com" />
              {/* Phone with country code */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Phone</label>
                <div className="flex gap-2">
                  <div className="w-28 flex-shrink-0">
                    <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                  </div>
                  <input
                    type="tel"
                    value={newClient.number}
                    onChange={e => set('number', e.target.value)}
                    placeholder="6xx xxx xxx"
                    className="flex-1 bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors min-h-[44px]"
                    onBlur={() => {
                      if (newClient.number && !newClient.number.startsWith('+')) {
                        set('number', `${countryCode}${newClient.number.replace(/^0/, '')}`);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Start Date *" name="startDate" value={newClient.startDate} onChange={set} type="date" />
              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555]">Goal Type</label>
                <select
                  value={newClient.goalType}
                  onChange={e => set('goalType', e.target.value)}
                  className="bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] min-h-[44px]"
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <Field label="Neck" name="neck" value={newClient.neck} onChange={set} placeholder="38" />
              <Field label="Shoulders" name="shoulders" value={newClient.shoulders} onChange={set} placeholder="120" />
              <Field label="Chest" name="chest" value={newClient.chest} onChange={set} placeholder="100" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
              <button onClick={handleClose} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] border border-[#383838] bg-[#1f1f1f] text-[#f0ede6] hover:bg-[#2a2a2a] transition-colors min-h-[44px]">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={uploading} className="font-['DM_Sans'] text-[13px] font-medium px-4 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] border border-[#c8f135] hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]">
                {uploading ? 'Uploading...' : 'Register Client'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddClientModal;
