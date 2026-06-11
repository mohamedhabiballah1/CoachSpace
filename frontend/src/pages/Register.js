import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo1.png';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      showToast('Account created! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-[#0e0e0e] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors font-['DM_Mono'] text-sm ${
      errors[field]
        ? 'border-[#e85d4a] focus:border-[#e85d4a] focus:ring-[#e85d4a]'
        : 'border-gray-700 focus:border-[#C8F135] focus:ring-[#C8F135]'
    }`;

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="CoachSpace Logo" className="h-16 w-auto object-contain" />
          </div>

          <h1 className="font-['Bebas_Neue'] text-[28px] text-[#f0ede6] text-center mb-2 tracking-wide">
            Create your account
          </h1>
          <p className="text-[#555] text-[13px] text-center mb-8 font-['DM_Sans']">
            Already have one?{' '}
            <Link to="/login" className="text-[#c8f135] hover:underline">Log in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-500 text-xs font-medium font-['DM_Mono'] uppercase tracking-wide">
                  First Name
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="Yassine"
                  className={inputClass('firstName')}
                />
                {errors.firstName && <p className="text-[#e85d4a] text-[11px] mt-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-gray-500 text-xs font-medium font-['DM_Mono'] uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Alami"
                  className={inputClass('lastName')}
                />
                {errors.lastName && <p className="text-[#e85d4a] text-[11px] mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-500 text-xs font-medium font-['DM_Mono'] uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="coach@example.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="text-[#e85d4a] text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-gray-500 text-xs font-medium font-['DM_Mono'] uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={e => set('phoneNumber', e.target.value)}
                placeholder="+212 6xx xxx xxx"
                className={inputClass('phoneNumber')}
              />
              {errors.phoneNumber && <p className="text-[#e85d4a] text-[11px] mt-1">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-gray-500 text-xs font-medium font-['DM_Mono'] uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters"
                className={inputClass('password')}
              />
              {errors.password && <p className="text-[#e85d4a] text-[11px] mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-gray-500 text-xs font-medium font-['DM_Mono'] uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                className={inputClass('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-[#e85d4a] text-[11px] mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8F135] hover:bg-[#b8e030] text-[#0e0e0e] font-['Bebas_Neue'] text-xl tracking-wide py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
