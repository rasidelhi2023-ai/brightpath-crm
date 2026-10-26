import React from 'react';
import { Search, Plus, Filter, Users } from 'lucide-react';

interface LeadsPageProps {
  onOpenCreateModal?: () => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ onOpenCreateModal }) => {
  return (
    <div>
      {/* Top Controls / Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flex: '1', minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search student name, phone, course..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>

            <select className="form-select" style={{ width: 'auto' }}>
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Referral">Referral</option>
              <option value="Phone">Phone</option>
              <option value="Social Media">Social Media</option>
            </select>

            <button onClick={onOpenCreateModal} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course Interest</th>
              <th>Phone / Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Assigned Counsellor</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Users size={24} />
                  </div>
                  <div className="empty-state-title">No leads in the pipeline yet</div>
                  <p className="empty-state-desc">
                    Click "Add Lead" to register a new student enquiry or connect Supabase to load records.
                  </p>
                  <button onClick={onOpenCreateModal} className="btn btn-secondary btn-sm">
                    <Plus size={14} />
                    <span>Create Sample Lead</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
