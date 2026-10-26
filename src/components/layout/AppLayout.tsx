import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConfigBanner } from '../common/ConfigBanner';
import { useAuth } from '../../hooks/useAuth';

interface AppLayoutProps {
  onQuickAddLead?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onQuickAddLead }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Executive Dashboard';
      case '/leads':
        return 'Student Admissions Pipeline';
      case '/followups':
        return 'Follow-up Tasks & Reminders';
      case '/reports':
        return 'Performance & Source Analytics';
      case '/settings':
        return 'Institute Settings';
      default:
        return 'BrightPath CRM';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentUser={
          profile
            ? { name: profile.full_name, role: profile.role }
            : { name: 'Admissions Counsellor', role: 'counsellor' }
        }
        onSignOut={signOut}
      />
      <div className="main-wrapper">
        <ConfigBanner />
        <Header
          title={getPageTitle(location.pathname)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickAddLead={onQuickAddLead}
        />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
