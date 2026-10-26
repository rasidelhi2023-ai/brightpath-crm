import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  CalendarCheck,
  Clock,
  User,
  History,
  Trash2,
  Save,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Lead, LeadStatus, Activity } from '../../types/crm.types';
import { leadService } from '../../services/leadService';
import { activityService } from '../../services/activityService';
import { CreateFollowUpModal } from '../followups/CreateFollowUpModal';

interface LeadDetailModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'activities'>('details');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Edit states
  const [status, setStatus] = useState<LeadStatus>('New');
  const [lostReason, setLostReason] = useState('');
  const [showLostInput, setShowLostInput] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && leadId) {
      loadLead(leadId);
    } else {
      setLead(null);
      setActivities([]);
    }
  }, [isOpen, leadId]);

  const loadLead = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await leadService.getLeadById(id);
      if (data) {
        setLead(data);
        setStatus(data.status);
        setNotes(data.notes || '');
        setLostReason(data.lost_reason || '');
        setShowLostInput(data.status === 'Lost');
      }
      const acts = await activityService.getActivitiesForLead(id);
      setActivities(acts);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !leadId) return null;

  const handleStatusChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Lost') {
      setShowLostInput(true);
    } else {
      setShowLostInput(false);
    }
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    setErrorMsg(null);

    if (status === 'Lost' && !lostReason.trim()) {
      setErrorMsg('Please specify a reason when marking a lead as Lost');
      setSaving(false);
      return;
    }

    try {
      // Status update
      if (status !== lead.status || (status === 'Lost' && lostReason !== lead.lost_reason)) {
        const res = await leadService.updateLeadStatus(
          lead.id,
          status,
          status === 'Lost' ? lostReason.trim() : null
        );
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to update status');
          setSaving(false);
          return;
        }
      }

      // Notes update
      if (notes !== (lead.notes || '')) {
        await leadService.updateLead(lead.id, { notes: notes.trim() });
      }

      onLeadUpdated();
      await loadLead(lead.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm(`Are you sure you want to delete lead for ${lead.full_name}?`)) {
      const res = await leadService.deleteLead(lead.id);
      if (res.success) {
        onLeadUpdated();
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to delete lead');
      }
    }
  };

  const getStatusBadgeClass = (st: LeadStatus) => {
    switch (st) {
      case 'New': return 'badge-new';
      case 'Contacted': return 'badge-contacted';
      case 'Qualified': return 'badge-qualified';
      case 'Converted': return 'badge-converted';
      case 'Lost': return 'badge-lost';
      default: return 'badge-new';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {lead?.full_name || 'Student Enquiry'}
              </h3>
              {lead && (
                <span className={`badge ${getStatusBadgeClass(lead.status)}`}>
                  {lead.status}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              ID: {lead?.id.substring(0, 8)}... • Added on{' '}
              {lead ? new Date(lead.created_at).toLocaleDateString() : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'details' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'details' ? '2px solid #2563eb' : 'none',
            }}
          >
            Lead Information & Actions
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'activities' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'activities' ? '2px solid #2563eb' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <History size={15} />
            <span>Activity History ({activities.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ minHeight: '340px' }}>
          {errorMsg && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.65rem 1rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              Loading lead details...
            </div>
          ) : lead && activeTab === 'details' ? (
            <div>
              {/* Quick Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={13} /> Phone
                  </small>
                  <strong style={{ fontSize: '0.95rem' }}>{lead.phone}</strong>
                </div>

                <div>
                  <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={13} /> Email
                  </small>
                  <strong style={{ fontSize: '0.95rem' }}>{lead.email || 'None provided'}</strong>
                </div>

                <div>
                  <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BookOpen size={13} /> Course Interest
                  </small>
                  <strong style={{ fontSize: '0.95rem' }}>{lead.course_interest}</strong>
                </div>

                <div>
                  <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={13} /> Source
                  </small>
                  <strong style={{ fontSize: '0.95rem' }}>{lead.source}</strong>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="form-group">
                <label className="form-label required">Pipeline Stage / Status</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`btn btn-sm ${status === st ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {showLostInput && (
                <div className="form-group" style={{ backgroundColor: '#fef2f2', padding: '0.85rem', borderRadius: '8px' }}>
                  <label className="form-label required" style={{ color: '#991b1b' }}>
                    Reason for Lost Status (Required per Specification)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Budget constraints, opted for competitor, relocated..."
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                  />
                </div>
              )}

              {/* Lead Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Counsellor Interaction Notes</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Record call discussions, student requirements, parent preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          ) : activeTab === 'activities' ? (
            <div>
              {activities.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                  No recorded activities for this lead yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderLeft: '3px solid #3b82f6',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0 8px 8px 0',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                          {act.description}
                        </div>
                        <small style={{ color: '#94a3b8' }}>
                          {new Date(act.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary btn-sm"
            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
            title="Delete this lead"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              className="btn btn-secondary"
              style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
            >
              <CalendarCheck size={15} />
              <span>Schedule Follow-up</span>
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Updates'}</span>
            </button>
          </div>
        </div>
      </div>

      {lead && (
        <CreateFollowUpModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          preselectedLeadId={lead.id}
          preselectedLeadName={lead.full_name}
          onFollowUpCreated={async () => {
            await loadLead(lead.id);
            onLeadUpdated();
          }}
        />
      )}
    </div>
  );
};
