import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo1.png';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const { showToast }           = useToast();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { showToast('Email and password are required.', 'error'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="CoachSpace Logo" className="h-20 w-auto object-contain" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-500 text-sm font-medium font-['DM_Mono'] uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-[#0e0e0e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8F135] focus:ring-1 focus:ring-[#C8F135] transition-colors font-['DM_Mono']"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-500 text-sm font-medium font-['DM_Mono'] uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full bg-[#0e0e0e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8F135] focus:ring-1 focus:ring-[#C8F135] transition-colors font-['DM_Mono']"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8F135] hover:bg-[#b8e030] text-[#0e0e0e] font-['Bebas_Neue'] text-xl tracking-wide py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-[#555] text-[13px] font-['DM_Sans'] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#c8f135] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
