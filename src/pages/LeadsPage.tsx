import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Users,
  RotateCcw,
  Eye,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Lead, LeadStatus, LeadSource } from '../types/crm.types';
import { leadService } from '../services/leadService';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';

interface LeadsPageProps {
  onOpenCreateModal?: () => void;
  refreshTrigger?: number;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({
  onOpenCreateModal,
  refreshTrigger = 0,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Selected lead for detail modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await leadService.getLeads({
        search,
        status: statusFilter,
        source: sourceFilter,
      });
      setLeads(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshTrigger]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
  };

  const handleQuickStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    lead: Lead
  ) => {
    const nextStatus = e.target.value as LeadStatus;
    if (nextStatus === lead.status) return;

    if (nextStatus === 'Lost') {
      // Open detail modal to capture required reason
      setSelectedLeadId(lead.id);
      setIsDetailOpen(true);
      return;
    }

    try {
      const res = await leadService.updateLeadStatus(lead.id, nextStatus);
      if (res.success) {
        fetchLeads();
      } else {
        alert(res.error || 'Failed to update status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to remove lead for ${lead.full_name}?`)) {
      const res = await leadService.deleteLead(lead.id);
      if (res.success) {
        fetchLeads();
      } else {
        alert(res.error || 'Failed to delete lead');
      }
    }
  };

  const getStatusBadge = (st: LeadStatus) => {
    switch (st) {
      case 'New': return <span className="badge badge-new">New</span>;
      case 'Contacted': return <span className="badge badge-contacted">Contacted</span>;
      case 'Qualified': return <span className="badge badge-qualified">Qualified</span>;
      case 'Converted': return <span className="badge badge-converted">Converted</span>;
      case 'Lost': return <span className="badge badge-lost">Lost</span>;
      default: return <span className="badge">{st}</span>;
    }
  };

  return (
    <div>
      {/* Top Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search box */}
          <div style={{ display: 'flex', flex: '1', minWidth: '260px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search student name, phone, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns & Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Referral">Referral</option>
              <option value="Phone">Phone</option>
              <option value="Social Media">Social Media</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>

            {(search || statusFilter || sourceFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                title="Reset all search filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Leads Table Container */}
      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course Interest</th>
              <th>Contact Details</th>
              <th>Source</th>
              <th>Status / Stage</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                  Loading student enquiries...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Users size={26} />
                    </div>
                    <div className="empty-state-title">
                      {search || statusFilter || sourceFilter
                        ? 'No matching student leads found'
                        : 'No leads in pipeline yet'}
                    </div>
                    <p className="empty-state-desc">
                      {search || statusFilter || sourceFilter
                        ? 'Try adjusting your search keywords or clearing active filters.'
                        : 'Click "Add Lead" to register your first student enquiry.'}
                    </p>
                    {search || statusFilter || sourceFilter ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="btn btn-secondary btn-sm"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenCreateModal}
                        className="btn btn-primary btn-sm"
                      >
                        <Plus size={15} />
                        <span>Create First Lead</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setIsDetailOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                      }}
                    >
                      <strong style={{ color: '#1e3a8a', display: 'block', fontSize: '0.92rem' }}>
                        {lead.full_name}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        ID: {lead.id.substring(0, 8)}
                      </span>
                    </button>
                  </td>

                  <td>
                    <span style={{ fontWeight: 500 }}>{lead.course_interest}</span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{lead.phone}</div>
                    {lead.email && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{lead.email}</div>
                    )}
                  </td>

                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#475569' }}>{lead.source}</span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusBadge(lead.status)}
                      <select
                        value={lead.status}
                        onChange={(e) => handleQuickStatusChange(e, lead)}
                        className="form-select"
                        style={{
                          width: 'auto',
                          padding: '0.15rem 0.4rem',
                          fontSize: '0.75rem',
                          height: '26px',
                        }}
                        aria-label={`Update status for ${lead.full_name}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                  </td>

                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setIsDetailOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.55rem' }}
                        title="View details & activity history"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLead(lead)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.55rem', color: '#dc2626' }}
                        title="Delete lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lead Detail & History Drawer */}
      <LeadDetailModal
        leadId={selectedLeadId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={fetchLeads}
      />
    </div>
  );
};
