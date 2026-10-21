import React, { useEffect, useState, useMemo } from 'react';
import { getAudit, getApplications } from '../api';
import AuditTimeline from '../portals/officer/components/AuditTimeline';
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
  const [actorFilter, setActorFilter] = useState('ALL');
  const [appFilter, setAppFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

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

  // Filtered events calculation
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Actor filter
      if (actorFilter === 'OFFICER' && evt.actor === AUDIT_ACTOR.SYSTEM) {
        return false;
      }
      if (actorFilter === 'SYSTEM' && evt.actor !== AUDIT_ACTOR.SYSTEM) {
        return false;
      }

      // Application filter
      if (appFilter !== 'ALL' && evt.applicationId !== appFilter) {
        return false;
      }

      // Action type filter
      if (actionFilter !== 'ALL' && evt.action !== actionFilter) {
        return false;
      }

      return true;
    });
  }, [events, actorFilter, appFilter, actionFilter]);

  const hasActiveFilters =
    actorFilter !== 'ALL' || appFilter !== 'ALL' || actionFilter !== 'ALL';

  const clearFilters = () => {
    setActorFilter('ALL');
    setAppFilter('ALL');
    setActionFilter('ALL');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h1 className="text-2xl font-bold text-[#0F2A4A] tracking-tight">
                Statutory Audit Trail
              </h1>
            </div>
            {/* Required Mandated Text */}
            <p className="text-sm text-slate-600 mt-1">
              Read-only record of rules applied, records checked, source responses and officer actions.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded">
              Read-Only Ledger
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="text-xs text-slate-600 hover:text-[#0F2A4A] bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded px-2.5 py-1 transition-colors cursor-pointer flex items-center space-x-1"
              title="Refresh timeline records"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Actor Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Actor
            </label>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1F6FEB]"
            >
              <option value="ALL">All Actors</option>
              <option value="SYSTEM">System Pipeline Only</option>
              <option value="OFFICER">Officer Only ({AUDIT_ACTOR.OFFICER})</option>
            </select>
          </div>

          {/* 2. Application Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Application Scope
            </label>
            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1F6FEB]"
            >
              <option value="ALL">All Applications (Global)</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.id} - {app.institute}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Action Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Action Category
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1F6FEB]"
            >
              <option value="ALL">All Action Types</option>
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
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-semibold text-slate-700">Active Filters:</span>
              {actorFilter !== 'ALL' && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-mono text-[11px]">
                  Actor: {actorFilter}
                </span>
              )}
              {appFilter !== 'ALL' && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-mono text-[11px]">
                  App: {appFilter}
                </span>
              )}
              {actionFilter !== 'ALL' && (
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-mono text-[11px]">
                  Action: {AUDIT_ACTION_LABELS[actionFilter] || actionFilter}
                </span>
              )}
              <span className="text-slate-400">
                ({filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} matched)
              </span>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg border border-rose-200 p-8 text-center text-rose-700">
          <p className="font-semibold">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-1.5 bg-[#0F2A4A] text-white rounded text-xs font-semibold hover:bg-[#1F6FEB]"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State: Two cases: filtered empty vs totally empty */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {hasActiveFilters ? 'No events match these filters' : 'No audit events yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try widening or clearing your actor, application, or action category criteria.'
              : 'Audit records will be automatically appended as pipeline rules evaluate and officers submit determinations.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Vertical Timeline Display */}
      {!loading && !error && filteredEvents.length > 0 && (
        <AuditTimeline events={filteredEvents} />
      )}
    </div>
  );
}
