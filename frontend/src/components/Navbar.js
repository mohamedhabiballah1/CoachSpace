import React from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, Dumbbell, CreditCard, Bell, User,
} from 'lucide-react';
import logo from '../assets/logo2.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/clients',   label: 'Clients',   Icon: Users },
  { to: '/schedule',  label: 'Schedule',  Icon: Calendar },
  { to: '/workouts',  label: 'Workouts',  Icon: Dumbbell },
  { to: '/payments',  label: 'Payments',  Icon: CreditCard },
  { to: '/reminders', label: 'Reminders', Icon: Bell },
];

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <>
      {/* Top navbar */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#2a2a2a] bg-[#0e0e0e] sticky top-0 z-[100]">
        <div className="flex items-center gap-4 sm:gap-6">
          <img src={logo} alt="CoachSpace" className="h-8 sm:h-9 w-auto" />
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `font-['DM_Sans'] text-[13px] px-3 py-1.5 rounded-[4px] transition-colors ${
                    isActive
                      ? 'text-[#c8f135] bg-[rgba(200,241,53,0.08)]'
                      : 'text-[#888] hover:text-[#f0ede6]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 font-['DM_Sans'] text-[13px] transition-colors ${
                isActive ? 'text-[#c8f135]' : 'text-[#888] hover:text-[#f0ede6]'
              }`
            }
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={initials} className="w-7 h-7 rounded-full object-cover border border-[#383838]" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#1f1f1f] border border-[#383838] flex items-center justify-center">
                {initials ? (
                  <span className="font-['DM_Mono'] text-[10px] text-[#888]">{initials}</span>
                ) : (
                  <User size={14} className="text-[#555]" />
                )}
              </div>
            )}
            <span className="hidden sm:inline">Profile</span>
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
        {navItems.map(({ to, label, Icon }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors"
              style={{ color: isActive ? '#c8f135' : '#555' }}
            >
              <Icon size={20} />
              <span className={`font-['DM_Mono'] text-[9px] uppercase tracking-[0.06em] ${isActive ? 'text-[#c8f135]' : 'text-[#555]'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
