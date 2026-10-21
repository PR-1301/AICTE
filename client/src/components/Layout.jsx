import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import DemoRibbon from './DemoRibbon';
import { resetDemo } from '../api';
import { AUDIT_ACTOR, DISCLAIMER_ADVISORY } from '../constants';

export default function Layout() {
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const location = useLocation();

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await resetDemo();
      setResetMessage('Demo data restored to initial state');
      setTimeout(() => setResetMessage(null), 3000);
      // Trigger a soft refresh event for any mounted components if needed
      window.dispatchEvent(new CustomEvent('aicte:reset-demo'));
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setResetting(false);
    }
  };

  const navItems = [
    {
      to: '/officer/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/officer/applications/APP-001',
      label: 'Application Review',
      sublabel: 'APP-001 (Demo)',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: '/officer/audit',
      label: 'Audit Trail',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/officer/_components',
      label: 'UI Components',
      sublabel: 'Visual Check (Step 3)',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-slate-800 antialiased font-sans">
      {/* Persistent Demo Ribbon (AGENTS.md section 2) */}
      <DemoRibbon />

      {/* Top Header Bar */}
      <header className="bg-[#0F2A4A] text-white border-b border-[#1F6FEB]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Portal Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#1F6FEB] flex items-center justify-center font-bold text-lg text-white shadow-sm border border-white/20">
              AI
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold tracking-tight text-white leading-tight">
                AICTE Application Validation Portal
              </div>
              <div className="text-xs text-slate-300">
                Ministry of Education · Advisory First-Pass Scrutiny
              </div>
            </div>
          </div>

          {/* Officer role badge & Reset Demo control */}
          <div className="flex items-center space-x-4">
            {resetMessage && (
              <span className="hidden md:inline-block text-xs bg-emerald-700/80 text-emerald-100 px-2.5 py-1 rounded">
                ✓ {resetMessage}
              </span>
            )}

            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="text-xs sm:text-sm px-3 py-1.5 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-500 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Reset in-memory mock data to seed state"
            >
              <svg className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>

            {/* Role indicator (AGENTS.md section 5.6) */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-600 text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <div className="text-left">
                <span className="font-medium text-slate-200">Officer Portal</span>
                <span className="hidden sm:inline text-slate-400 text-xs block">
                  {AUDIT_ACTOR.OFFICER}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scrutiny Workflow
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive || (item.to.startsWith('/officer/applications') && location.pathname.startsWith('/officer/applications'))
                      ? 'bg-[#0F2A4A] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.sublabel && (
                    <span className="text-[11px] opacity-80">{item.sublabel}</span>
                  )}
                </div>
              </NavLink>
            ))}

            {/* Domain advisory footer card in sidebar */}
            <div className="mt-6 pt-4 border-t border-slate-100 px-3 pb-2">
              <div className="p-3 bg-amber-50 rounded border border-amber-200/60 text-[12px] text-amber-900 leading-relaxed">
                <strong className="block font-semibold mb-0.5">Advisory Notice:</strong>
                {DISCLAIMER_ADVISORY}
              </div>
            </div>
          </nav>
        </aside>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
