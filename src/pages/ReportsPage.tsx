import React from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Lead Acquisition by Source</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <PieChart size={24} />
            </div>
            <div className="empty-state-title">No source breakdown data</div>
            <p className="empty-state-desc">
              Connect real leads in Phase 4 & 5 to visualize lead generation sources (Website, Walk-in, Referral, etc.).
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Conversion Funnel Progression</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <TrendingUp size={24} />
            </div>
            <div className="empty-state-title">No pipeline stage conversions</div>
            <p className="empty-state-desc">
              Track your student journey from New enquiry to Qualified to Enrolled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
