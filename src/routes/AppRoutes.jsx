import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Login,
  Dashboard,
  AnalyzeEmail,
  HeaderForensics,
  GeoTrace,
  DomainIntelligence,
  AiForensicReport,
  CaseManagement,
  Settings,
  RecentInvestigations,
} from '../pages';


export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Core Canonical Forensic Routes wrapped in ErrorBoundary */}
        <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="analyze" element={<ErrorBoundary><AnalyzeEmail /></ErrorBoundary>} />
        <Route path="header-protocol" element={<ErrorBoundary><HeaderForensics /></ErrorBoundary>} />
        <Route path="geotrace" element={<ErrorBoundary><GeoTrace /></ErrorBoundary>} />
        <Route path="domain-intel" element={<ErrorBoundary><DomainIntelligence /></ErrorBoundary>} />
        <Route path="ai-report" element={<ErrorBoundary><AiForensicReport /></ErrorBoundary>} />
        <Route path="cases" element={<ErrorBoundary><CaseManagement /></ErrorBoundary>} />
        <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />

        {/* Seamless Aliases for Convenience */}
        <Route path="forensics" element={<ErrorBoundary><HeaderForensics /></ErrorBoundary>} />
        <Route path="headers" element={<ErrorBoundary><HeaderForensics /></ErrorBoundary>} />
        <Route path="map" element={<ErrorBoundary><GeoTrace /></ErrorBoundary>} />
        <Route path="domain" element={<ErrorBoundary><DomainIntelligence /></ErrorBoundary>} />
        <Route path="report" element={<ErrorBoundary><AiForensicReport /></ErrorBoundary>} />
        <Route path="result" element={<ErrorBoundary><AiForensicReport /></ErrorBoundary>} />
        <Route path="history" element={<ErrorBoundary><CaseManagement /></ErrorBoundary>} />
        <Route path="recent-investigations" element={<ErrorBoundary><RecentInvestigations /></ErrorBoundary>} />
        <Route path="recent" element={<ErrorBoundary><RecentInvestigations /></ErrorBoundary>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

