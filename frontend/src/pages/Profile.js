import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import { uploadFile } from '../utils/upload';
import Navbar from '../components/Navbar';

const inputClass = "w-full bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2.5 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors";
const labelClass = "font-['DM_Mono'] text-[10px] uppercase tracking-[0.08em] text-[#555] mb-1 block";

const AVATAR_COLORS = ['#c8f135', '#5b8af5', '#f5a35b', '#e85d4a', '#a78bfa', '#34d399'];
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Profile = () => {
  const { logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', profileImage: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [pwErrors, setPwErrors]           = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw]           = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    api.get('/api/auth/profile')
      .then(d => {
        setProfile({
          firstName: d.user.firstName || '',
          lastName:  d.user.lastName  || '',
          email:     d.user.email     || '',
          phoneNumber: d.user.phoneNumber || '',
          profileImage: d.user.profileImage || '',
        });
      })
      .catch(err => showToast(err.message, 'error'));
  }, [showToast]);

  const setP = (k, v) => { setProfile(p => ({ ...p, [k]: v })); setProfileErrors(e => ({ ...e, [k]: '' })); };
  const setPw = (k, v) => { setPwForm(p => ({ ...p, [k]: v })); setPwErrors(e => ({ ...e, [k]: '' })); };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validateProfile = () => {
    const e = {};
    if (!profile.firstName.trim()) e.firstName = 'Required';
    if (!profile.lastName.trim())  e.lastName  = 'Required';
    if (!profile.phoneNumber.trim()) e.phoneNumber = 'Required';
    setProfileErrors(e);
    return !Object.keys(e).length;
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.currentPassword) e.currentPassword = 'Required';
    if (pwForm.newPassword.length < 6) e.newPassword = 'Min. 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setPwErrors(e);
    return !Object.keys(e).length;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    setUploadingAvatar(!!avatarFile);
    try {
      let imageUrl = profile.profileImage;
      if (avatarFile) {
        imageUrl = await uploadFile(avatarFile, 'image');
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      await api.put('/api/auth/profile', {
        firstName: profile.firstName,
        lastName:  profile.lastName,
        phoneNumber: profile.phoneNumber,
        profileImage: imageUrl,
      });
      setProfile(p => ({ ...p, profileImage: imageUrl }));
      updateUser({ firstName: profile.firstName, lastName: profile.lastName, profileImage: imageUrl });
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePw()) return;
    setSavingPw(true);
    try {
      await api.patch('/api/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast('Password changed!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  const avatarColor = getAvatarColor(`${profile.firstName}${profile.lastName}` || 'A');
  const displayImage = avatarPreview || profile.profileImage;

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">

        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-10">
          <div
            className="relative flex-shrink-0 cursor-pointer group"
            onClick={() => avatarInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-full border-2 border-[#383838] overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: displayImage ? undefined : `${avatarColor}22` }}>
              {displayImage ? (
                <img src={displayImage} alt={initials} className="w-full h-full object-cover" />
              ) : (
                <span className="font-['Bebas_Neue'] text-[28px]" style={{ color: avatarColor }}>
                  {initials || '?'}
                </span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            {avatarFile && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#c8f135] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#0e0e0e]" />
              </div>
            )}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
          <div>
            <h1 className="font-['Bebas_Neue'] text-[32px] sm:text-[36px] text-[#f0ede6] leading-none">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-[#555] text-[13px] font-['DM_Mono'] mt-0.5">{profile.email}</p>
            {avatarFile && (
              <p className="text-[#c8f135] text-[11px] font-['DM_Mono'] mt-1 uppercase tracking-wide">
                New photo selected — save to apply
              </p>
            )}
          </div>
        </div>

        {/* Profile section */}
        <section className="bg-[#161616] border border-[#2a2a2a] rounded-[6px] p-6 mb-6">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-5">Profile Info</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" value={profile.firstName} onChange={e => setP('firstName', e.target.value)} className={inputClass} />
              {profileErrors.firstName && <p className="text-[#e85d4a] text-[11px] mt-1">{profileErrors.firstName}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={profile.lastName} onChange={e => setP('lastName', e.target.value)} className={inputClass} />
              {profileErrors.lastName && <p className="text-[#e85d4a] text-[11px] mt-1">{profileErrors.lastName}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Email <span className="text-[#383838]">(cannot be changed)</span></label>
            <input type="email" value={profile.email} disabled className={`${inputClass} opacity-40 cursor-not-allowed`} />
          </div>
          <div className="mb-6">
            <label className={labelClass}>Phone Number</label>
            <input type="tel" value={profile.phoneNumber} onChange={e => setP('phoneNumber', e.target.value)} className={inputClass} />
            {profileErrors.phoneNumber && <p className="text-[#e85d4a] text-[11px] mt-1">{profileErrors.phoneNumber}</p>}
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile || uploadingAvatar}
            className="font-['DM_Sans'] text-[13px] font-medium px-5 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]">
            {uploadingAvatar ? 'Uploading photo...' : savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </section>

        {/* Change password */}
        <section className="bg-[#161616] border border-[#2a2a2a] rounded-[6px] p-6 mb-6">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-5">Change Password</div>
          <div className="mb-4">
            <label className={labelClass}>Current Password</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPw('currentPassword', e.target.value)} className={inputClass} />
            {pwErrors.currentPassword && <p className="text-[#e85d4a] text-[11px] mt-1">{pwErrors.currentPassword}</p>}
          </div>
          <div className="mb-4">
            <label className={labelClass}>New Password</label>
            <input type="password" value={pwForm.newPassword} onChange={e => setPw('newPassword', e.target.value)} className={inputClass} />
            {pwErrors.newPassword && <p className="text-[#e85d4a] text-[11px] mt-1">{pwErrors.newPassword}</p>}
          </div>
          <div className="mb-6">
            <label className={labelClass}>Confirm New Password</label>
            <input type="password" value={pwForm.confirmPassword} onChange={e => setPw('confirmPassword', e.target.value)} className={inputClass} />
            {pwErrors.confirmPassword && <p className="text-[#e85d4a] text-[11px] mt-1">{pwErrors.confirmPassword}</p>}
          </div>
          <button onClick={handleChangePassword} disabled={savingPw}
            className="font-['DM_Sans'] text-[13px] font-medium px-5 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] hover:border-[#555] transition-colors disabled:opacity-50 min-h-[44px]">
            {savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </section>

        {/* Danger zone */}
        <section className="bg-[#161616] border border-[#2a2a2a] rounded-[6px] p-6">
          <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#e85d4a] mb-4">Danger Zone</div>
          <button onClick={logout}
            className="font-['DM_Sans'] text-[13px] font-medium px-5 py-2.5 rounded-[4px] text-[#e85d4a] border border-[#e85d4a] hover:bg-[rgba(232,93,74,0.08)] transition-colors min-h-[44px]">
            Log Out
          </button>
        </section>
      </main>
    </div>
  );
};

export default Profile;
