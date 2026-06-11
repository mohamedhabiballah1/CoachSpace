import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo2.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients',   label: 'Clients' },
  { to: '/schedule',  label: 'Schedule' },
  { to: '/workouts',  label: 'Workouts' },
  { to: '/payments',  label: 'Payments' },
];

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-[#2a2a2a] bg-[#0e0e0e] sticky top-0 z-[100]">
      <div className="flex items-center gap-6">
        <img src={logo} alt="CoachSpace" className="h-9 w-auto" />
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-['DM_Sans'] text-[13px] px-3 py-1.5 rounded-[4px] transition-colors ${
                  isActive
                    ? 'text-[#c8f135] bg-[rgba(200,241,53,0.08)]'
                    : 'text-[#888] hover:text-[#f0ede6]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `font-['DM_Sans'] text-[13px] transition-colors ${
              isActive ? 'text-[#c8f135]' : 'text-[#888] hover:text-[#f0ede6]'
            }`
          }
        >
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="font-['DM_Sans'] text-[13px] text-[#888] hover:text-[#e85d4a] transition-colors"
        >
          Logout
        </button>
        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#888] hover:text-[#f0ede6]"
          onClick={() => setMenuOpen(o => !o)}
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#161616] border-b border-[#2a2a2a] flex flex-col md:hidden z-[99]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-['DM_Sans'] text-[13px] px-6 py-3 border-b border-[#2a2a2a] ${
                  isActive ? 'text-[#c8f135]' : 'text-[#888]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
