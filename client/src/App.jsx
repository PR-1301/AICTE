import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import ApplicationReviewPlaceholder from './pages/ApplicationReviewPlaceholder';
import EvidenceViewerPlaceholder from './pages/EvidenceViewerPlaceholder';
import AuditTrailPlaceholder from './pages/AuditTrailPlaceholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPlaceholder />} />
          <Route path="applications/:id" element={<ApplicationReviewPlaceholder />} />
          <Route path="applications/:id/findings/:fid" element={<EvidenceViewerPlaceholder />} />
          <Route path="audit" element={<AuditTrailPlaceholder />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
