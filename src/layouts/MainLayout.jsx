import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <ErrorBoundary>
        <TopNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </ErrorBoundary>
      <div className="flex flex-1 overflow-hidden relative">
        <ErrorBoundary>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </ErrorBoundary>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-61px)]">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};


export default MainLayout;
