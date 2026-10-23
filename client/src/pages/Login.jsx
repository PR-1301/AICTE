import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ROLE, DISCLAIMER_ADVISORY } from '../constants';
import Emblem from '../components/Emblem';

const portalCards = [
  {
    role: ROLE.OFFICER,
    title: 'Scrutiny Officer',
    subtitle: 'Review & Decision Portal',
    description:
      'Review AI-assisted validation reports, inspect document evidence, and submit statutory determinations on institutional applications.',
    route: '/officer/dashboard',
    headerClass: 'bg-[#0F2A4A]',
    accentBorder: 'border-[#1F6FEB]',
    accentBg: 'bg-[#1F6FEB]',
    badge: 'Primary demo path',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    variant: 'officer',
  },
  {
    role: ROLE.COLLEGE,
    title: 'College Applicant',
    subtitle: 'Application & Upload Portal',
    description:
      'Start new applications, upload statutory documents, monitor validation progress, and respond to deficiency notices.',
    route: '/college/application',
    headerClass: 'bg-[#0c4a2f]',
    accentBorder: 'border-emerald-600',
    accentBg: 'bg-emerald-700',
    badge: 'Applicant',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    variant: 'college',
  },
  {
    role: ROLE.ADMIN,
    title: 'Administrator',
    subtitle: 'Configuration Console',
    description:
      'Configure document checklists per application category, manage validation rules, thresholds, and severity levels.',
    route: '/admin/checklists',
    headerClass: 'bg-[#3b1764]',
    accentBorder: 'border-purple-500',
    accentBg: 'bg-purple-700',
    badge: 'Config',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    variant: 'admin',
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
    <div className="min-h-screen gov-surface flex flex-col">
      <div className="sticky top-0 z-40">
        <header className="bg-[#0F2A4A] text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.25rem] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Emblem variant="officer" />
              <div>
                <div className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                  AICTE Application Validation Platform
                </div>
                <div className="text-xs text-slate-300">
                  Smart India Hackathon 2026 · SIH26261
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="text-center mb-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F2A4A] bg-white border border-slate-200 rounded-full px-3 py-1 mb-4">
            Advisory first-pass scrutiny
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2A4A] tracking-tight mb-3">
            Select Your Portal
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            AI-powered document authentication, cross-validation, and regulatory compliance scrutiny for AICTE institutional approvals.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            No authentication required for this concept demo. Choose a role to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {portalCards.map((card) => (
            <button
              key={card.role}
              onClick={() => handleSelectRole(card)}
              className={`group relative flex flex-col text-left rounded-2xl border-2 ${card.accentBorder} bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#1F6FEB]/30 cursor-pointer`}
            >
              <div className={`${card.headerClass} px-6 py-6 text-white`}>
                <div className="flex items-start justify-between">
                  <Emblem variant={card.variant} className="w-10 h-10" />
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-4 leading-tight">{card.title}</h2>
                <p className="text-sm text-white/80 mt-0.5">{card.subtitle}</p>
              </div>

              <div className="px-6 py-5 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {card.description}
                </p>
                <div className="mt-5">
                  <span className={`inline-flex text-sm font-semibold ${card.accentBg} text-white px-4 py-1.5 rounded-lg`}>
                    Enter Portal
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center max-w-xl">
          <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{DISCLAIMER_ADVISORY}</span>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AICTE Application Validation &amp; Compliance Verification Platform · Problem Statement SIH26261</div>
          <div className="text-slate-400 font-mono text-xs">Concept Demo · Advisory Layer</div>
        </div>
      </footer>
    </div>
  );
}
