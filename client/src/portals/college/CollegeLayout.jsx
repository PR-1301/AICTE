import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import DemoRibbon from '../../components/DemoRibbon.jsx';
import { useAppStore } from '../../store/useAppStore';
import { DEMO_RIBBON_TEXT } from '../../constants';

const navItems = [
  {
    to: '/college/application',
    label: 'My Application',
    icon: (
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/college/upload',
    label: 'Upload Documents',
    icon: (
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    to: '/college/processing',
    label: 'AI Processing',
    icon: (
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    to: '/college/deficiencies',
    label: 'Deficiencies',
    icon: (
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

export default function CollegeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAppStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-slate-800 antialiased font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#0c4a2f] text-white border-b border-emerald-500/30 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              className="w-9 h-9 shrink-0 rounded-lg shadow-sm"
            >
              <rect width="32" height="32" rx="8" fill="#0a3622" stroke="#22c55e" strokeWidth="1" />
              <path d="M19 21V5a2 2 0 00-2-2H15a2 2 0 00-2 2v16m8 0H9m5-14h1m-1 4h1" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-semibold tracking-tight text-white leading-tight">
                  College Application Portal
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-900/90 text-emerald-200 border border-emerald-700/80">
                  {DEMO_RIBBON_TEXT}
                </span>
              </div>
              <div className="text-xs text-emerald-200">
                AICTE · Document Submission & Tracking
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm px-3.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 hover:text-white border border-emerald-600 transition-colors flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Switch Portal</span>
            </button>
            <div className="flex items-center space-x-2.5 pl-3 border-l border-emerald-600/80">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-semibold text-emerald-50">College Portal</div>
                <div className="text-[11px] font-mono text-emerald-300">college-user</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav aria-label="College Navigation" className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3 space-y-1.5 sticky top-24">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Application Workflow
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-3 rounded-lg text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isActive
                      ? 'bg-[#0c4a2f] text-white shadow-xs'
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

        {/* Content */}
        <main className="flex-1 min-w-0" id="college-main-content">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 text-center text-xs sm:text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AICTE Application Validation & Compliance Verification Platform · SIH26261</div>
          <div className="text-slate-400 font-mono text-xs">Concept Demo · Advisory Layer</div>
        </div>
      </footer>
    </div>
  );
}
