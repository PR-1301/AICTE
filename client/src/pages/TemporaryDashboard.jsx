import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplications } from '../api';
import StatusBadge from '../components/StatusBadge';

/**
 * TEMPORARY: Step 5 minimal dashboard list, to be replaced in step 8.
 * Lists all applications loaded via src/api with direct review links.
 */
export default function TemporaryDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const data = await getApplications();
        if (isMounted) setApplications(data || []);
      } catch (err) {
        console.error('Failed to load applications for dashboard:', err);
        if (isMounted) setError('Failed to load applications.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2A4A] tracking-tight">
            Officer Applications Worklist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AICTE Scrutiny Advisory Layer &middot; Institutional submissions queue
          </p>
        </div>
        <div className="text-xs font-mono bg-blue-50 text-[#1F6FEB] border border-blue-200 px-3 py-1.5 rounded self-start sm:self-auto">
          Step 5 Temporary Queue (Step 8 will add full stats & charts)
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-10 bg-slate-100 rounded mb-2"></div>
          <div className="h-10 bg-slate-100 rounded mb-2"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-white rounded-lg border border-rose-200 p-6 text-center text-rose-700">
          {error}
        </div>
      )}

      {/* Applications Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Application ID</th>
                  <th scope="col" className="px-6 py-3.5">Institution Name</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Submitted Date</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#0F2A4A] whitespace-nowrap">
                      {app.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                      {app.institute}
                      {app.id === 'APP-001' && (
                        <span className="ml-2 text-[11px] font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Demo Flawed
                        </span>
                      )}
                      {app.id === 'APP-002' && (
                        <span className="ml-2 text-[11px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Demo Clean
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {app.category}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                      {app.submittedOn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/officer/applications/${app.id}`}
                        className="inline-flex items-center text-xs font-semibold text-[#1F6FEB] hover:text-[#0F2A4A] hover:underline"
                      >
                        Review Application &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
