import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import DemoRibbon from './DemoRibbon';
import ConfirmDialog from './ConfirmDialog';
import { resetDemo } from '../api';
import { useAppStore } from '../store/useAppStore';
import { AUDIT_ACTOR, DISCLAIMER_ADVISORY } from '../constants';

const isDevToolsEnabled = import.meta.env.VITE_DEV_TOOLS === 'true';

export default function Layout() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const resetStore = useAppStore((state) => state.resetStore);

  // Keyboard shortcut: Alt+Shift+D (replaces conflicting shortcuts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setShowResetConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfirmReset = async () => {
    try {
      setResetting(true);
      await resetDemo();
      if (resetStore) resetStore();
      setResetMessage('Demo data restored to initial state');
      setTimeout(() => setResetMessage(null), 3500);

      // Trigger soft refresh across mounted subscribers
      window.dispatchEvent(new CustomEvent('aicte:reset-demo'));
      setShowResetConfirm(false);

      // Return to dashboard after reset
      navigate('/officer/dashboard');
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
        <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/officer/applications/APP-001',
      label: 'Application Review',
      sublabel: 'Demo Queue',
      icon: (
        <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: '/officer/audit',
      label: 'Audit Trail',
      icon: (
        <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Optional dev-only inspection navigation
  if (isDevToolsEnabled) {
    navItems.push({
      to: '/officer/_components',
      label: 'UI Components',
      sublabel: 'Visual Check (Dev)',
      icon: (
        <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-slate-800 antialiased font-sans">
      {/* Persistent Demo Ribbon (AGENTS.md Section 2) */}
      <DemoRibbon />

      {/* Top Header Bar */}
      <header className="bg-[#0F2A4A] text-white border-b border-[#1F6FEB]/30 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Portal Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#1F6FEB] flex items-center justify-center font-bold text-lg text-white shadow-sm border border-white/20">
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

          {/* Reset Demo control & Role indicator */}
          <div className="flex items-center space-x-4">
            {resetMessage && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-700/90 text-emerald-100 px-3 py-1 rounded-full border border-emerald-500 shadow-xs animate-fade-in">
                <span>✓</span>
                <span>{resetMessage}</span>
              </span>
            )}

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={resetting}
              className="text-xs sm:text-sm px-3.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-500 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
              title="Reset in-memory mock data to seed state (Alt+Shift+D)"
            >
              <svg className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">{resetting ? 'Resetting...' : 'Reset demo'}</span>
            </button>

            {/* Role indicator (AGENTS.md Section 5.6) */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-600 text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <div className="text-left">
                <span className="font-semibold text-slate-100">Officer Portal</span>
                <span className="hidden sm:inline text-slate-400 text-xs block font-mono">
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
          <nav aria-label="Portal Navigation" className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3 space-y-1.5 sticky top-24">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scrutiny Workflow
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-3 rounded-lg text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] ${
                    isActive || (item.to.startsWith('/officer/applications') && location.pathname.startsWith('/officer/applications'))
                      ? 'bg-[#0F2A4A] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <div className="leading-tight">
                  <div>{item.label}</div>
                  {item.sublabel && (
                    <div className="text-xs opacity-75 font-normal">{item.sublabel}</div>
                  )}
                </div>
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-100 px-3">
              <div className="text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Quick Reset:</div>
                <div className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block">
                  Alt + Shift + D
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 min-w-0" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Persistent Reset Demo Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Restore All Demo Data?"
        confirmLabel="Reset Demo Data"
        cancelLabel="Keep Current State"
        variant="warning"
        confirmDisabled={resetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      >
        <div className="space-y-3 text-base text-slate-600">
          <p>
            This action will restore all applications, synthetic documents, scrutiny findings, and audit trails back to their initial seed state.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 flex items-start space-x-2">
            <span className="text-amber-600 font-bold text-base leading-none">⚠</span>
            <span>
              Any officer decisions submitted during this demonstration session will be reverted.
            </span>
          </div>
        </div>
      </ConfirmDialog>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 text-center text-xs sm:text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AICTE Application Validation & Compliance Verification Platform · Problem Statement SIH26261
          </div>
          <div className="text-slate-400 font-mono text-xs">
            Concept Demo · Advisory Layer
          </div>
        </div>
      </footer>
    </div>
  );
}
