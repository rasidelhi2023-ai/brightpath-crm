import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { LeadModal } from './components/leads/LeadModal';

export function App() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Fullscreen Auth Route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected App Routes with Layout */}
        <Route
          element={
            <AppLayout
              onQuickAddLead={() => setIsLeadModalOpen(true)}
              currentUser={{ name: 'Admissions Counsellor', role: 'counsellor' }}
            />
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/leads"
            element={<LeadsPage onOpenCreateModal={() => setIsLeadModalOpen(true)} />}
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
      />
    </BrowserRouter>
  );
}

export default App;
