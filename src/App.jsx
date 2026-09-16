import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ThreatProvider } from './context/ThreatContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThreatProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </ThreatProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

