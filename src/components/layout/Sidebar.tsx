import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  GraduationCap,
  X,
  LogOut,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name: string;
    role: string;
  } | null;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentUser = { name: 'Demo Counsellor', role: 'counsellor' },
  onSignOut
}) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Leads Pipeline', path: '/leads', icon: Users },
    { label: 'Follow-ups', path: '/followups', icon: CalendarCheck },
    { label: 'Analytics & Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <GraduationCap size={20} />
            </div>
            <span>BrightPath CRM</span>
          </div>
          <button
            className="mobile-menu-btn"
            style={{ color: '#fff' }}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              <UserCheck size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'User'}</span>
              <span className="user-role-tag">{currentUser?.role || 'Guest'}</span>
            </div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
