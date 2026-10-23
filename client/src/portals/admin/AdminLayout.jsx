import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Emblem from '../../components/Emblem.jsx';
import { useAppStore } from '../../store/useAppStore';

const navItems = [
  {
    to: '/admin/checklists',
    label: 'Checklists',
    icon: (
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/admin/rules',
    label: 'Validation Rules',
    icon: (
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAppStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col gov-surface text-slate-800 antialiased font-sans">
      <div className="sticky top-0 z-40">
        <header className="bg-[#3b1764] text-white border-b border-purple-900/40 shadow-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[4.25rem] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Emblem variant="admin" />
            <div>
              <div className="text-base sm:text-lg font-semibold tracking-tight text-white leading-tight">
                Admin Configuration Console
              </div>
              <div className="text-xs text-purple-200">
                AICTE · Checklists &amp; Rule Management
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm px-3.5 py-1.5 rounded-lg bg-purple-800/80 hover:bg-purple-800 text-purple-100 hover:text-white border border-purple-600 transition-colors flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Switch Portal</span>
            </button>
            <div className="flex items-center space-x-2.5 pl-3 border-l border-purple-600/80">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></span>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-semibold text-purple-50">Admin Console</div>
                <div className="text-[11px] font-mono text-purple-300">admin-user</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      </div>

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <nav aria-label="Admin Navigation" className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-1.5 sticky top-[8.5rem]">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Configuration
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-3 rounded-lg text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isActive
                      ? 'bg-[#3b1764] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0" id="admin-main-content">
          <Outlet />
        </main>
      </div>

      <footer className="mt-auto bg-white border-t border-slate-200 py-4 text-center text-xs sm:text-sm text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AICTE Application Validation & Compliance Verification Platform · SIH26261</div>
          <div className="text-slate-400 font-mono text-xs">Concept Demo · Advisory Layer</div>
        </div>
      </footer>
    </div>
  );
}
