import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { LeadModal } from './components/leads/LeadModal';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          fontFamily: 'Inter, system-ui, sans-serif',
          gap: '1rem',
        }}
      >
        <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.95rem' }}>Loading BrightPath CRM...</p>
      </div>
    );
  }

  if (isConfigured && !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicAuthRoute() {
  const { user, loading, isConfigured } = useAuth();

  if (!loading && isConfigured && user) {
    return <Navigate to="/" replace />;
  }

  return <AuthPage />;
}

export function App() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeadCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Guest Auth Route */}
          <Route path="/auth" element={<PublicAuthRoute />} />

          {/* Protected App Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout
                  onQuickAddLead={() => setIsLeadModalOpen(true)}
                />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/leads"
              element={
                <LeadsPage
                  onOpenCreateModal={() => setIsLeadModalOpen(true)}
                  refreshTrigger={refreshTrigger}
                />
              }
            />
            <Route path="/followups" element={<FollowUpsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        {/* Global Quick Add Lead Modal */}
        <LeadModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          onLeadCreated={handleLeadCreated}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
