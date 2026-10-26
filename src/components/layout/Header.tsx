import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
  onQuickAddLead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenMobileMenu,
  onQuickAddLead
}) => {
  return (
    <header className="top-header">
      <div className="header-title-section">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        {onQuickAddLead && (
          <button onClick={onQuickAddLead} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>New Lead</span>
          </button>
        )}
      </div>
    </header>
  );
};
