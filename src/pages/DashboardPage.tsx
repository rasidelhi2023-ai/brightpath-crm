import React from 'react';
import { Users, UserPlus, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      {/* Top Welcome & KPI Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#2563eb', '--stat-bg': '#eff6ff' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Total Inquiries</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#0284c7', '--stat-bg': '#f0f9ff' } as React.CSSProperties}>
          <div>
            <div className="stat-label">New Leads</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-icon">
            <UserPlus size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#16a34a', '--stat-bg': '#f0fdf4' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Enrolled / Converted</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#dc2626', '--stat-bg': '#fef2f2' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Overdue Follow-ups</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-icon">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#7c3aed', '--stat-bg': '#f5f3ff' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Conversion Rate</div>
            <div className="stat-value">0.0%</div>
          </div>
          <div className="stat-icon">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Admission Pipeline by Stage</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={24} />
            </div>
            <div className="empty-state-title">No leads in pipeline yet</div>
            <div className="empty-state-desc">
              Connect Supabase in Phase 2 & 3 or create your first lead to see stage progression.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Immediate Follow-ups</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock size={24} />
            </div>
            <div className="empty-state-title">No pending follow-ups</div>
            <div className="empty-state-desc">
              Scheduled student calls and meetings will appear here with overdue highlights.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
