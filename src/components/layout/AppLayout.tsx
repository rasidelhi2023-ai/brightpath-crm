import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  onQuickAddLead?: () => void;
  currentUser?: {
    name: string;
    role: string;
  } | null;
  onSignOut?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onQuickAddLead,
  currentUser,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        currentUser={currentUser}
        onSignOut={onSignOut}
      />
      <div className="main-wrapper">
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
