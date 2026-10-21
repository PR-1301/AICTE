import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApplicationReview from './pages/ApplicationReview';
import EvidenceViewer from './pages/EvidenceViewer';
import AuditTrail from './pages/AuditTrail';
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applications/:id" element={<ApplicationReview />} />
          <Route path="applications/:id/findings/:fid" element={<EvidenceViewer />} />
          <Route path="audit" element={<AuditTrail />} />
          {/* Inspection route for visual check */}
          <Route path="_components" element={<ComponentsShowcase />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/officer/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
