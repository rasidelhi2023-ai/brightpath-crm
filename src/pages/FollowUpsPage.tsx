import React from 'react';
import { CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm">All Follow-ups</button>
          <button className="btn btn-secondary btn-sm">Due Today</button>
          <button className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}>
            Overdue Only
          </button>
          <button className="btn btn-secondary btn-sm">Completed History</button>
        </div>
      </div>

      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Due Date & Time</th>
              <th>Student Lead</th>
              <th>Follow-up Task / Note</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <CalendarCheck size={24} />
                  </div>
                  <div className="empty-state-title">No scheduled follow-up tasks</div>
                  <p className="empty-state-desc">
                    Follow-ups scheduled on student leads will show up here sorted by urgency.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
