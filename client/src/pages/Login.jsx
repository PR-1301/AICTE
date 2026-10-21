import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ROLE, DEMO_RIBBON_TEXT } from '../constants';

const portalCards = [
  {
    role: ROLE.OFFICER,
    title: 'Scrutiny Officer',
    subtitle: 'Review & Decision Portal',
    description:
      'Review AI-assisted validation reports, inspect document evidence, and submit statutory determinations on institutional applications.',
    route: '/officer/dashboard',
    color: 'from-[#0F2A4A] to-[#1a3d6b]',
    accentBorder: 'border-[#1F6FEB]',
    accentBg: 'bg-[#1F6FEB]',
    badge: '⭐ Primary',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    role: ROLE.COLLEGE,
    title: 'College Applicant',
    subtitle: 'Application & Upload Portal',
    description:
      'Start new applications, upload statutory documents, monitor AI validation progress, and respond to deficiency notices.',
    route: '/college/application',
    color: 'from-[#0c4a2f] to-[#166534]',
    accentBorder: 'border-emerald-500',
    accentBg: 'bg-emerald-600',
    badge: 'Applicant',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    role: ROLE.ADMIN,
    title: 'Administrator',
    subtitle: 'Configuration Console',
    description:
      'Configure document checklists per application category, manage validation rules, thresholds, and severity levels.',
    route: '/admin/checklists',
    color: 'from-[#3b1764] to-[#581c87]',
    accentBorder: 'border-purple-500',
    accentBg: 'bg-purple-600',
    badge: 'Config',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Login() {
  const navigate = useNavigate();
  const setRole = useAppStore((state) => state.setRole);

  const handleSelectRole = (card) => {
    setRole(card.role);
    navigate(card.route);
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#0F2A4A] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
              <div className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                AICTE Application Validation Platform
              </div>
              <div className="text-xs text-slate-300">
                Ministry of Education · Smart India Hackathon 2026 · SIH26261
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80">
            {DEMO_RIBBON_TEXT}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2A4A] tracking-tight mb-3">
            Select Your Portal
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            AI-Powered Document Authentication, Cross-Validation &amp; Regulatory Compliance Scrutiny
            for AICTE institutional approvals.
          </p>
          <p className="text-sm text-slate-400 mt-2 italic">
            No authentication required for concept demo. Choose a role to begin.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {portalCards.map((card) => (
            <button
              key={card.role}
              onClick={() => handleSelectRole(card)}
              className={`group relative flex flex-col text-left rounded-2xl border-2 ${card.accentBorder} bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#1F6FEB]/30 cursor-pointer hover:-translate-y-1`}
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-br ${card.color} px-6 py-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                    {card.icon}
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-4 leading-tight">{card.title}</h2>
                <p className="text-sm opacity-80 mt-0.5">{card.subtitle}</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {card.description}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className={`text-sm font-semibold ${card.accentBg} text-white px-4 py-1.5 rounded-lg group-hover:opacity-90 transition-opacity`}>
                    Enter Portal →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Advisory Footer */}
        <div className="mt-12 text-center max-w-xl">
          <div className="inline-flex items-center space-x-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI findings are strictly advisory. All regulatory decisions rest with authorized officers.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AICTE Application Validation & Compliance Verification Platform · Problem Statement SIH26261</div>
          <div className="text-slate-400 font-mono text-xs">Concept Demo · Advisory Layer</div>
        </div>
      </footer>
    </div>
  );
}
