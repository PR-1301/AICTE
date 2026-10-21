import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { ROLE } from './constants';

// Shared / Login
import Login from './pages/Login';

// Officer portal
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApplicationReview from './pages/ApplicationReview';
import EvidenceViewer from './pages/EvidenceViewer';
import AuditTrail from './pages/AuditTrail';
import OfficerNotFound from './pages/OfficerNotFound';

// College portal
import CollegeLayout from './portals/college/CollegeLayout';
import StartApplication from './portals/college/pages/StartApplication';
import UploadDocuments from './portals/college/pages/UploadDocuments';
import AIProcessing from './portals/college/pages/AIProcessing';
import Deficiencies from './portals/college/pages/Deficiencies';

// Admin console
import AdminLayout from './portals/admin/AdminLayout';
import ChecklistEditor from './portals/admin/pages/ChecklistEditor';
import ValidationRules from './portals/admin/pages/ValidationRules';

const isDevToolsEnabled = import.meta.env.VITE_DEV_TOOLS === 'true';

/**
 * Route guard component. Redirects to login if the user's current role
 * doesn't match the required role. No real auth — just Zustand state.
 */
function PortalGuard({ requiredRole, children }) {
  const currentRole = useAppStore((s) => s.currentRole);
  if (!currentRole) {
    return <Navigate to="/" replace />;
  }
  if (currentRole !== requiredRole) {
    // If logged in but wrong portal, redirect to their portal
    const portalRoutes = {
      [ROLE.OFFICER]: '/officer/dashboard',
      [ROLE.COLLEGE]: '/college/application',
      [ROLE.ADMIN]: '/admin/checklists',
    };
    return <Navigate to={portalRoutes[currentRole] || '/'} replace />;
  }
  return children;
}

export default function App() {
  const currentRole = useAppStore((s) => s.currentRole);

  // Dynamically import ComponentsShowcase only when dev tools are enabled
  const ComponentsShowcase = isDevToolsEnabled
    ? React.lazy(() => import('./pages/ComponentsShowcase'))
    : null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login / Role Switcher */}
        <Route
          path="/"
          element={
            currentRole ? (
              <Navigate
                to={
                  currentRole === ROLE.OFFICER
                    ? '/officer/dashboard'
                    : currentRole === ROLE.COLLEGE
                    ? '/college/application'
                    : '/admin/checklists'
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* ─── Officer Portal ─── */}
        <Route
          path="/officer"
          element={
            <PortalGuard requiredRole={ROLE.OFFICER}>
              <Layout />
            </PortalGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applications/:id" element={<ApplicationReview />} />
          <Route path="applications/:id/findings/:fid" element={<EvidenceViewer />} />
          <Route path="audit" element={<AuditTrail />} />
          {isDevToolsEnabled && ComponentsShowcase && (
            <Route
              path="_components"
              element={
                <React.Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
                  <ComponentsShowcase />
                </React.Suspense>
              }
            />
          )}
          <Route path="*" element={<OfficerNotFound />} />
        </Route>

        {/* ─── College Portal ─── */}
        <Route
          path="/college"
          element={
            <PortalGuard requiredRole={ROLE.COLLEGE}>
              <CollegeLayout />
            </PortalGuard>
          }
        >
          <Route index element={<Navigate to="application" replace />} />
          <Route path="application" element={<StartApplication />} />
          <Route path="upload" element={<UploadDocuments />} />
          <Route path="processing" element={<AIProcessing />} />
          <Route path="deficiencies" element={<Deficiencies />} />
          <Route path="*" element={<Navigate to="application" replace />} />
        </Route>

        {/* ─── Admin Console ─── */}
        <Route
          path="/admin"
          element={
            <PortalGuard requiredRole={ROLE.ADMIN}>
              <AdminLayout />
            </PortalGuard>
          }
        >
          <Route index element={<Navigate to="checklists" replace />} />
          <Route path="checklists" element={<ChecklistEditor />} />
          <Route path="rules" element={<ValidationRules />} />
          <Route path="*" element={<Navigate to="checklists" replace />} />
        </Route>

        {/* Global fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
