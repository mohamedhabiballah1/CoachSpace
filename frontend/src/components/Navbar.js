import React from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo2.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { to: '/clients',   label: 'Clients',   icon: '👥' },
  { to: '/schedule',  label: 'Schedule',  icon: '📅' },
  { to: '/workouts',  label: 'Workouts',  icon: '🏋️' },
  { to: '/payments',  label: 'Payments',  icon: '💳' },
];

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Top navbar */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#2a2a2a] bg-[#0e0e0e] sticky top-0 z-[100]">
        <div className="flex items-center gap-4 sm:gap-6">
          <img src={logo} alt="CoachSpace" className="h-8 sm:h-9 w-auto" />
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

        <div className="flex items-center gap-2 sm:gap-3">
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
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0e0e0e] border-t border-[#2a2a2a] z-[100] flex items-stretch">
        {navItems.map(item => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors"
              style={{ color: isActive ? '#c8f135' : '#555' }}
            >
              <span className="text-[18px] leading-none">{item.icon}</span>
              <span className={`font-['DM_Mono'] text-[9px] uppercase tracking-[0.06em] ${isActive ? 'text-[#c8f135]' : 'text-[#555]'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
