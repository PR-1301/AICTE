import React, { useEffect, useState, useMemo } from 'react';
import { getAudit, getApplications } from '../api';
import AuditTimeline from '../portals/officer/components/AuditTimeline';
import ErrorState from '../components/ErrorState';
import { AUDIT_ACTION, AUDIT_ACTION_LABELS, AUDIT_ACTOR } from '../constants';

/**
 * Global Audit Trail Page (Route: /officer/audit).
 * Complete read-only timeline of automated pipeline actions and officer determinations.
 * Includes interactive filtering by actor, application, and action type.
 */
export default function AuditTrail() {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [actorFilter, setActorFilter] = useState('ALL'); // 'ALL' | 'SYSTEM' | 'OFFICER' | 'ALERTS'
  const [appFilter, setAppFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allAudit, allApps] = await Promise.all([
        getAudit(),
        getApplications(),
      ]);
      setEvents(allAudit || []);
      setApplications(allApps || []);
      document.title = 'Audit Trail & Compliance Log · AICTE Officer Portal';
    } catch (err) {
      console.error('Failed to load audit trail:', err);
      setError('Unable to retrieve immutable audit trail records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to reset demo events
    const handleReset = () => loadData();
    window.addEventListener('aicte:reset-demo', handleReset);
    return () => {
      window.removeEventListener('aicte:reset-demo', handleReset);
    };
  }, []);

  // Summary counts for top overview tiles
  const metrics = useMemo(() => {
    const total = events.length;
    const officerDecisions = events.filter(
      (e) => e.actor !== AUDIT_ACTOR.SYSTEM || e.action === AUDIT_ACTION.DECISION_SUBMITTED
    ).length;
    const automatedRules = events.filter(
      (e) => e.action === AUDIT_ACTION.RULE_APPLIED || e.action === AUDIT_ACTION.RECORD_CHECKED
    ).length;
    const alertsRaised = events.filter((e) => e.action === AUDIT_ACTION.ALERT_RAISED).length;

    return { total, officerDecisions, automatedRules, alertsRaised };
  }, [events]);

  // Filtered events calculation
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1. Actor / Quick Tab filter
      if (actorFilter === 'OFFICER') {
        const isOfficer = evt.actor !== AUDIT_ACTOR.SYSTEM || evt.action === AUDIT_ACTION.DECISION_SUBMITTED;
        if (!isOfficer) return false;
      } else if (actorFilter === 'SYSTEM') {
        if (evt.actor !== AUDIT_ACTOR.SYSTEM) return false;
      } else if (actorFilter === 'ALERTS') {
        if (evt.action !== AUDIT_ACTION.ALERT_RAISED) return false;
      }

      // 2. Application filter
      if (appFilter !== 'ALL' && evt.applicationId !== appFilter) {
        return false;
      }

      // 3. Action type filter
      if (actionFilter !== 'ALL' && evt.action !== actionFilter) {
        return false;
      }

      // 4. Text search (detail, ref, id, action)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDetail = (evt.detail || '').toLowerCase().includes(q);
        const matchRef = (evt.ref || '').toLowerCase().includes(q);
        const matchApp = (evt.applicationId || '').toLowerCase().includes(q);
        const matchAction = (evt.action || '').toLowerCase().includes(q);
        if (!matchDetail && !matchRef && !matchApp && !matchAction) return false;
      }

      return true;
    });
  }, [events, actorFilter, appFilter, actionFilter, searchQuery]);

  const hasActiveFilters =
    actorFilter !== 'ALL' || appFilter !== 'ALL' || actionFilter !== 'ALL' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setActorFilter('ALL');
    setAppFilter('ALL');
    setActionFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 pl-7 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0F2A4A]" aria-hidden="true" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-800">
                Immutable Statutory Ledger &middot; Section 10(1) AICTE Act
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A] tracking-tight">
              Statutory Audit Trail
            </h1>
            {/* Mandated Descriptive Line */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Read-only record of rules applied, records checked, source responses, and officer actions.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto shrink-0">
            <span className="text-xs font-mono font-bold px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
              {events.length} Events Logged
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="text-xs font-bold text-slate-700 hover:text-[#0F2A4A] bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
              title="Refresh timeline records"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1F6FEB]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric Overview Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Logged</span>
              <span className="text-2xl font-extrabold text-[#0F2A4A] tabular-nums">{metrics.total}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              #
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Officer Decisions</span>
              <span className="text-2xl font-extrabold text-amber-950 tabular-nums">{metrics.officerDecisions}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Automated Checks</span>
              <span className="text-2xl font-extrabold text-blue-950 tabular-nums">{metrics.automatedRules}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs">
              ⚙
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Alerts Raised</span>
              <span className="text-2xl font-extrabold text-rose-950 tabular-nums">{metrics.alertsRaised}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-900 flex items-center justify-center font-bold text-xs">
              !
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filter & Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setActorFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              actorFilter === 'ALL'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Events ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => setActorFilter('OFFICER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              actorFilter === 'OFFICER'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Officer Actions ({metrics.officerDecisions})</span>
          </button>
          <button
            type="button"
            onClick={() => setActorFilter('SYSTEM')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              actorFilter === 'SYSTEM'
                ? 'bg-[#1F6FEB] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Automated Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActorFilter('ALERTS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              actorFilter === 'ALERTS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Alerts & Flags ({metrics.alertsRaised})</span>
          </button>
        </div>

        {/* Dropdowns + Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit detail, rule code, finding (e.g. F-003, TER)..."
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] focus:border-[#1F6FEB]"
            />
          </div>

          {/* Application Filter */}
          <div className="sm:col-span-3">
            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] focus:border-[#1F6FEB] cursor-pointer"
            >
              <option value="ALL">All Applications (Global)</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.id} &middot; {app.institute}
                </option>
              ))}
            </select>
          </div>

          {/* Action Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] focus:border-[#1F6FEB] cursor-pointer"
            >
              <option value="ALL">All Action Categories</option>
              {Object.keys(AUDIT_ACTION).map((actKey) => (
                <option key={actKey} value={actKey}>
                  {AUDIT_ACTION_LABELS[actKey] || actKey}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Clear Control */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <div className="flex items-center space-x-2 flex-wrap gap-1.5">
              <span className="font-bold text-slate-800">Active Criteria:</span>
              {actorFilter !== 'ALL' && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Scope: {actorFilter}
                </span>
              )}
              {appFilter !== 'ALL' && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold">
                  App: {appFilter}
                </span>
              )}
              {actionFilter !== 'ALL' && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Action: {AUDIT_ACTION_LABELS[actionFilter] || actionFilter}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  "{searchQuery}"
                </span>
              )}
              <span className="text-slate-500 font-semibold">
                &middot; {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} matched
              </span>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#1F6FEB] hover:underline font-bold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          title="Audit Trail Service Unavailable"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {hasActiveFilters ? 'No events match these criteria' : 'No audit events recorded yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'Try widening or resetting your actor, application, or action category criteria.'
              : 'Audit records will be automatically logged as pipeline rules evaluate and officers submit determinations.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs sm:text-sm px-4 py-2 bg-[#0F2A4A] hover:bg-[#1F6FEB] text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* 4. Vertical Timeline Feed */}
      {!loading && !error && filteredEvents.length > 0 && (
        <AuditTimeline events={filteredEvents} />
      )}
    </div>
  );
}


