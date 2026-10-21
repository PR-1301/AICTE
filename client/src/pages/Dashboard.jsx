import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import { getApplications, getAlerts } from '../api';
import StatusBadge from '../components/StatusBadge';
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
  SEVERITY,
  SEVERITY_LABELS,
  DEMO_TODAY,
  DISCLAIMER_ADVISORY,
} from '../constants';

/**
 * Format ISO or YYYY-MM-DD date to Indian institutional style (e.g., 12 Oct 2026)
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format timestamp with time (e.g., 12 Oct 2026, 14:35)
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Officer Scrutiny Dashboard (AGENTS.md Section 5.4 & Step 8).
 * 1. Four clickable stat cards that filter the applications table.
 * 2. Status distribution Recharts bar chart (video readable, no second chart).
 * 3. Dynamic alerts panel derived from data with severity sorting.
 * 4. Urgency-sorted, searchable, filterable applications table with keyboard accessibility.
 * 5. Responsive, video-ready typography (base text >= 16px).
 */
export default function Dashboard() {
  const navigate = useNavigate();

  // Primary data state
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [errorApps, setErrorApps] = useState(null);
  const [errorAlerts, setErrorAlerts] = useState(null);

  // Filter & Search states
  const [cardFilter, setCardFilter] = useState(null); // 'pending' | 'flagged' | 'expired' | 'verified' | null
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlertsExpanded, setShowAlertsExpanded] = useState(false);

  // Fetch applications
  const fetchApplicationsData = useCallback(async () => {
    try {
      setLoadingApps(true);
      setErrorApps(null);
      const data = await getApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setErrorApps('Failed to load applications queue. Please retry.');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlertsData = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      setErrorAlerts(null);
      const data = await getAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setErrorAlerts('Failed to load active scrutiny alerts.');
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    document.title = 'Officer Scrutiny Worklist · AICTE Validation Portal';
    fetchApplicationsData();
    fetchAlertsData();

    // Re-fetch on demo reset
    const handleDemoReset = () => {
      fetchApplicationsData();
      fetchAlertsData();
    };

    window.addEventListener('aicte:reset-demo', handleDemoReset);
    return () => {
      window.removeEventListener('aicte:reset-demo', handleDemoReset);
    };
  }, [fetchApplicationsData, fetchAlertsData]);

  // Derived counts for the 4 stat cards
  const stats = useMemo(() => {
    const pending = applications.filter(
      (a) =>
        a.status === APPLICATION_STATUS.VALIDATION_COMPLETE ||
        a.status === APPLICATION_STATUS.UNDER_OFFICER_REVIEW
    ).length;

    const flagged = applications.filter(
      (a) => (a.highSeverityOpen || 0) > 0
    ).length;

    const expired = applications.filter((a) => Boolean(a.hasExpired)).length;

    const fullyVerified = applications.filter(
      (a) => (a.openFindings || 0) === 0
    ).length;

    return { pending, flagged, expired, fullyVerified };
  }, [applications]);

  // Chart data: Distribution of application statuses
  const chartData = useMemo(() => {
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        statusKey: APPLICATION_STATUS.VALIDATION_COMPLETE,
        name: 'Validation Complete',
        shortName: 'Complete',
        count: counts[APPLICATION_STATUS.VALIDATION_COMPLETE] || 0,
        fill: '#1F6FEB', // Accent Blue
      },
      {
        statusKey: APPLICATION_STATUS.UNDER_OFFICER_REVIEW,
        name: 'Under Review',
        shortName: 'Under Review',
        count: counts[APPLICATION_STATUS.UNDER_OFFICER_REVIEW] || 0,
        fill: '#D97706', // Amber
      },
      {
        statusKey: APPLICATION_STATUS.APPROVED,
        name: 'Approved',
        shortName: 'Approved',
        count: counts[APPLICATION_STATUS.APPROVED] || 0,
        fill: '#059669', // Emerald
      },
      {
        statusKey: APPLICATION_STATUS.INFO_REQUESTED,
        name: 'Info Requested',
        shortName: 'Info Req.',
        count: counts[APPLICATION_STATUS.INFO_REQUESTED] || 0,
        fill: '#7C3AED', // Purple
      },
      {
        statusKey: APPLICATION_STATUS.AI_VALIDATING,
        name: 'AI Validating',
        shortName: 'Validating',
        count: counts[APPLICATION_STATUS.AI_VALIDATING] || 0,
        fill: '#64748B', // Slate
      },
    ];
  }, [applications]);

  // Toggle card filter
  const handleCardFilterClick = (type) => {
    setCardFilter((prev) => (prev === type ? null : type));
  };

  // Reset all filters
  const handleClearFilters = () => {
    setCardFilter(null);
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  const isFiltering = Boolean(cardFilter || statusFilter !== 'ALL' || searchQuery.trim());

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Stat Card filter
      if (cardFilter === 'pending') {
        const isPending =
          app.status === APPLICATION_STATUS.VALIDATION_COMPLETE ||
          app.status === APPLICATION_STATUS.UNDER_OFFICER_REVIEW;
        if (!isPending) return false;
      } else if (cardFilter === 'flagged') {
        if ((app.highSeverityOpen || 0) <= 0) return false;
      } else if (cardFilter === 'expired') {
        if (!app.hasExpired) return false;
      } else if (cardFilter === 'verified') {
        if ((app.openFindings || 0) !== 0) return false;
      }

      // 2. Status dropdown
      if (statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false;
      }

      // 3. Search input (institute name or application id)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchInst = (app.institute || '').toLowerCase().includes(q);
        const matchId = (app.id || '').toLowerCase().includes(q);
        if (!matchInst && !matchId) return false;
      }

      return true;
    });
  }, [applications, cardFilter, statusFilter, searchQuery]);

  // Default urgency sort: highSeverityOpen first, then expired, then newest submittedOn
  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      // 1. High-severity count descending
      const highDiff = (b.highSeverityOpen || 0) - (a.highSeverityOpen || 0);
      if (highDiff !== 0) return highDiff;

      // 2. Expired documents first
      if (Boolean(b.hasExpired) !== Boolean(a.hasExpired)) {
        return b.hasExpired ? -1 : 1;
      }

      // 3. Most recent submitted date
      return new Date(b.submittedOn || 0).getTime() - new Date(a.submittedOn || 0).getTime();
    });
  }, [filteredApplications]);

  // Visible alerts slice (up to 6, or all)
  const visibleAlerts = showAlertsExpanded ? alerts : alerts.slice(0, 6);

  return (
    <div className="space-y-8 pb-16 text-slate-800">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F6FEB]"></span>
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#1F6FEB]">
              AICTE Scrutiny & Approval System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A] tracking-tight">
            Officer Scrutiny Worklist
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
            AI-assisted first-pass validation queue. Preliminary indicators are provided for officer review; final determination rests exclusively with the officer.
          </p>
        </div>

        {/* Anchor date pill */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 text-right">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-blue-50/90 border border-blue-200/80 text-blue-950 shadow-xs">
            <svg className="w-4 h-4 text-[#1F6FEB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold">Demo Review Anchor:</span>
            <span className="text-sm font-mono font-bold text-[#1F6FEB]">{formatDate(DEMO_TODAY)}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Statutory validity computed against anchor date
          </span>
        </div>
      </div>

      {/* 2. Four Clickable Stat Cards */}
      <section aria-labelledby="stat-cards-heading">
        <h2 id="stat-cards-heading" className="sr-only">
          Scrutiny Status Summary
        </h2>

        {loadingApps ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-9 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : errorApps ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-rose-800 text-base flex items-center justify-between">
            <span>{errorApps}</span>
            <button
              onClick={fetchApplicationsData}
              className="text-sm font-semibold underline hover:text-rose-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Pending Officer Review */}
            <button
              type="button"
              onClick={() => handleCardFilterClick('pending')}
              className={`text-left rounded-xl border p-5 sm:p-6 transition-all cursor-pointer relative shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] ${
                cardFilter === 'pending'
                  ? 'bg-blue-50/80 border-[#1F6FEB] ring-2 ring-[#1F6FEB] shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-slate-700">
                  Pending Officer Review
                </span>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1F6FEB] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#0F2A4A] tracking-tight mb-1">
                {stats.pending}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Applications awaiting human decision
              </p>
              {cardFilter === 'pending' && (
                <span className="mt-3 inline-block text-xs font-semibold text-[#1F6FEB] bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                  ✓ Filter Active (Click to clear)
                </span>
              )}
            </button>

            {/* Card 2: Flagged Discrepancies */}
            <button
              type="button"
              onClick={() => handleCardFilterClick('flagged')}
              className={`text-left rounded-xl border p-5 sm:p-6 transition-all cursor-pointer relative shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                cardFilter === 'flagged'
                  ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-slate-700">
                  Flagged Applications
                </span>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-800 tracking-tight mb-1">
                {stats.flagged}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                With open high-severity findings
              </p>
              {cardFilter === 'flagged' && (
                <span className="mt-3 inline-block text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  ✓ Filter Active (Click to clear)
                </span>
              )}
            </button>

            {/* Card 3: Expired Documents */}
            <button
              type="button"
              onClick={() => handleCardFilterClick('expired')}
              className={`text-left rounded-xl border p-5 sm:p-6 transition-all cursor-pointer relative shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                cardFilter === 'expired'
                  ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-rose-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-slate-700">
                  Expired Documents
                </span>
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-rose-800 tracking-tight mb-1">
                {stats.expired}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Lapsed certificate or NOC validity
              </p>
              {cardFilter === 'expired' && (
                <span className="mt-3 inline-block text-xs font-semibold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  ✓ Filter Active (Click to clear)
                </span>
              )}
            </button>

            {/* Card 4: Fully Verified */}
            <button
              type="button"
              onClick={() => handleCardFilterClick('verified')}
              className={`text-left rounded-xl border p-5 sm:p-6 transition-all cursor-pointer relative shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                cardFilter === 'verified'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-slate-700">
                  Fully Verified
                </span>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-800 tracking-tight mb-1">
                {stats.fullyVerified}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Zero open statutory discrepancies
              </p>
              {cardFilter === 'verified' && (
                <span className="mt-3 inline-block text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  ✓ Filter Active (Click to clear)
                </span>
              )}
            </button>
          </div>
        )}
      </section>

      {/* 3. Middle Section: Chart + Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Recharts Chart: Status Distribution (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-[#0F2A4A] tracking-tight">
                Application Pipeline Distribution
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Current count of institutions across validation & decision stages
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              {applications.length} Total Applications
            </span>
          </div>

          {loadingApps ? (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse text-slate-400 text-base">
              Loading distribution chart...
            </div>
          ) : (
            <div className="w-full h-72 min-w-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 25, right: 20, left: -10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 13, fill: '#1E293B', fontWeight: 600 }}
                    interval={0}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 13, fill: '#475569' }}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0F2A4A] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-sm">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-300 mt-1">
                              Institutions: <span className="font-semibold text-white">{data.count}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      style={{ fontSize: '15px', fontWeight: 700, fill: '#0F2A4A' }}
                    />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Color & Label Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-slate-600">
            {chartData.map((item) => (
              <div key={item.statusKey} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: item.fill }}></span>
                <span>{item.name}: <strong className="text-slate-900">{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-[#0F2A4A] tracking-tight">
                  Scrutiny & Discrepancy Alerts
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  alerts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {alerts.length}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Lapsed validity, discrepancies & source timeouts
              </p>
            </div>

            {alerts.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAlertsExpanded((prev) => !prev)}
                className="text-xs font-semibold text-[#1F6FEB] hover:underline cursor-pointer"
              >
                {showAlertsExpanded ? 'Show top 6' : `Show all (${alerts.length})`}
              </button>
            )}
          </div>

          {loadingAlerts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : errorAlerts ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-800 text-sm">
              {errorAlerts}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-slate-800">No active alerts</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                All statutory discrepancies resolved or applications processed.
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {visibleAlerts.map((alert) => {
                const isHigh = (alert.severity || '').toLowerCase() === SEVERITY.HIGH;
                const isMedium = (alert.severity || '').toLowerCase() === SEVERITY.MEDIUM;

                return (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3.5 transition-colors text-sm ${
                      isHigh
                        ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                        : isMedium
                        ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {/* Severity icon + label */}
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                            isHigh
                              ? 'bg-rose-200/90 text-rose-900'
                              : isMedium
                              ? 'bg-amber-200/90 text-amber-900'
                              : 'bg-blue-200/90 text-blue-900'
                          }`}
                        >
                          <span>
                            {isHigh ? '!' : isMedium ? '⚠' : 'ℹ'}
                          </span>
                          <span>{SEVERITY_LABELS[alert.severity] || alert.severity}</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {alert.applicationId}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                        {alert.ts ? formatDate(alert.ts) : ''}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-[#0F2A4A] mt-1.5">
                      {alert.institute}
                    </h4>
                    <p className="text-sm text-slate-700 mt-1 leading-snug">
                      {alert.message}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {alert.title}
                      </span>
                      {alert.link && (
                        <Link
                          to={alert.link}
                          className="text-xs font-semibold text-[#1F6FEB] hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>Review record</span>
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Applications Table Section */}
      <section aria-labelledby="applications-table-heading" className="space-y-4">
        {/* Table Header & Search/Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="applications-table-heading" className="text-xl font-bold text-[#0F2A4A] tracking-tight">
                Institutional Submissions Registry
              </h2>
              <p className="text-base text-slate-500 mt-0.5">
                Sorted by urgency: open high-severity findings first, then expired documents, then submission date
              </p>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <span className="font-semibold text-slate-700">
                Showing {sortedApplications.length} of {applications.length}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by institute name or application ID (e.g., Demo Institute, APP-001)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] focus:border-[#1F6FEB] transition-colors"
              />
            </div>

            {/* Status Dropdown */}
            <div className="sm:col-span-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] focus:border-[#1F6FEB] transition-colors bg-white font-medium"
              >
                <option value="ALL">All Application Statuses</option>
                {Object.values(APPLICATION_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {APPLICATION_STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Summary Bar */}
          {isFiltering && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-sm">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="font-semibold text-blue-900">Active filters:</span>
                {cardFilter && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                    <span>Card:</span>
                    <strong className="capitalize">{cardFilter}</strong>
                    <button
                      onClick={() => setCardFilter(null)}
                      className="ml-1 hover:text-blue-950 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                    <span>Status:</span>
                    <strong>{APPLICATION_STATUS_LABELS[statusFilter] || statusFilter}</strong>
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="ml-1 hover:text-blue-950 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                    <span>Search:</span>
                    <strong>"{searchQuery}"</strong>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-blue-950 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-[#1F6FEB] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          {loadingApps ? (
            <div className="p-8 text-center text-slate-500 text-base animate-pulse space-y-3">
              <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ) : errorApps ? (
            <div className="p-8 text-center text-rose-700 bg-rose-50 text-base">
              {errorApps}
            </div>
          ) : sortedApplications.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/50 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {applications.length === 0 ? 'No applications in system' : 'No matching applications found'}
              </h3>
              <p className="text-base text-slate-500 max-w-md mx-auto">
                {applications.length === 0
                  ? 'There are currently no institutional applications queued for review.'
                  : 'No records match your current search and filter settings. Try clearing the filters.'}
              </p>
              {isFiltering && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-[#0F2A4A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Institute Name
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Application ID
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Approval Category
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Submitted
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Review Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      Open Findings
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      High Severity
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Last Updated
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white text-base">
                  {sortedApplications.map((app) => {
                    const rowLink = `/officer/applications/${app.id}`;
                    const hasHighSeverity = (app.highSeverityOpen || 0) > 0;
                    const hasExpiredDoc = Boolean(app.hasExpired);

                    return (
                      <tr
                        key={app.id}
                        tabIndex={0}
                        onClick={() => navigate(rowLink)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') navigate(rowLink);
                        }}
                        className="hover:bg-blue-50/60 focus:bg-blue-50/80 focus:outline-none transition-colors cursor-pointer group"
                      >
                        {/* Institute Name */}
                        <td className="px-5 py-4 font-semibold text-[#0F2A4A] group-hover:text-[#1F6FEB] transition-colors">
                          <div className="flex items-center space-x-2">
                            <span>{app.institute}</span>
                            {hasExpiredDoc && (
                              <span
                                title="Contains document with lapsed statutory validity"
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800"
                              >
                                Expired Doc
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-4 py-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                          {app.id}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 text-slate-600 text-sm sm:text-base">
                          {app.category}
                        </td>

                        {/* Submitted Date */}
                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap text-sm sm:text-base">
                          {formatDate(app.submittedOn)}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={app.status} size="md" />
                        </td>

                        {/* Open Findings */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {app.openFindings === 0 ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span>✓</span>
                              <span>0 Clean</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span>{app.openFindings}</span>
                              <span className="font-normal text-amber-700">open</span>
                            </span>
                          )}
                        </td>

                        {/* High Severity Count */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {hasHighSeverity ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                              <span>!</span>
                              <span>{app.highSeverityOpen}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>

                        {/* Last Updated */}
                        <td className="px-4 py-4 text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                          {formatDateTime(app.lastUpdated)}
                        </td>

                        {/* Action Link */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <Link
                            to={rowLink}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0F2A4A] text-white text-sm font-semibold hover:bg-[#1F6FEB] transition-colors shadow-xs"
                          >
                            <span>Open</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Advisory Guidance Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{DISCLAIMER_ADVISORY}</span>
        </div>
        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          Ref: AICTE Regulatory Guidelines SIH26261
        </span>
      </div>
    </div>
  );
}
