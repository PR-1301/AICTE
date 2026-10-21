import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import DemoRibbon from './DemoRibbon';
import ConfirmDialog from './ConfirmDialog';
import { resetDemo } from '../api';
import { useAppStore } from '../store/useAppStore';
import { AUDIT_ACTOR, DISCLAIMER_ADVISORY } from '../constants';

// Logout action for Switch Portal

const isDevToolsEnabled = import.meta.env.VITE_DEV_TOOLS === 'true';

export default function Layout() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const resetStore = useAppStore((state) => state.resetStore);
  const logout = useAppStore((state) => state.logout);

  const handleSwitchPortal = () => {
    logout();
    navigate('/');
  };

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
      {/* Top Header Bar */}
      <header className="bg-[#0F2A4A] text-white border-b border-[#1F6FEB]/30 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Portal Name with Favicon Shield Logo */}
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              className="w-9 h-9 shrink-0 rounded-lg shadow-sm"
              aria-label="AICTE Emblem"
            >
              <rect width="32" height="32" rx="8" fill="#14345B" stroke="#1F6FEB" strokeWidth="1" />
              <path
                d="M16 4L6 9V17C6 23.08 10.27 28.74 16 30C21.73 28.74 26 23.08 26 17V9L16 4Z"
                fill="#1F6FEB"
                fillOpacity="0.35"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M11 16L14.5 19.5L21 13"
                stroke="#FBBF24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-semibold tracking-tight text-white leading-tight">
                  AICTE Application Validation Portal
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80">
                  Concept Demo · Synthetic Data
                </span>
              </div>
              <div className="text-xs text-slate-300">
                Ministry of Education · Advisory First-Pass Scrutiny
              </div>
            </div>
          </div>

          {/* Reset Demo control & Role indicator */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {resetMessage && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-700/90 text-emerald-100 px-3 py-1 rounded-full border border-emerald-500 shadow-xs animate-fade-in">
                <span>✓</span>
                <span>{resetMessage}</span>
              </span>
            )}

            {/* Switch Portal Button */}
            <button
              type="button"
              onClick={handleSwitchPortal}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-500 transition-colors flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium hidden sm:inline">Switch Portal</span>
            </button>

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
            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-600/80">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-semibold text-slate-100">Officer Portal</div>
                <div className="text-[11px] font-mono text-slate-400">{AUDIT_ACTOR.OFFICER}</div>
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
