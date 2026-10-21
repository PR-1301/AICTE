import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import ApplicationReviewPlaceholder from './pages/ApplicationReviewPlaceholder';
import EvidenceViewer from './pages/EvidenceViewer';
import AuditTrailPlaceholder from './pages/AuditTrailPlaceholder';
import ComponentsShowcase from './pages/ComponentsShowcase';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Top-level redirects to officer portal */}
        <Route path="/" element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />

        {/* Officer portal routes (Section 13) */}
        <Route path="/officer" element={<Layout />}>
          <Route path="dashboard" element={<DashboardPlaceholder />} />
          <Route path="applications/:id" element={<ApplicationReviewPlaceholder />} />
          <Route path="applications/:id/findings/:fid" element={<EvidenceViewer />} />
          <Route path="audit" element={<AuditTrailPlaceholder />} />
          {/* Temporary inspection route for Step 3 visual check */}
          <Route path="_components" element={<ComponentsShowcase />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/officer/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
