import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  Check,
  Calendar,
  UserCheck
} from 'lucide-react';
import { FollowUp } from '../types/crm.types';
import { followupService, FollowUpFilterTab } from '../services/followupService';
import { CreateFollowUpModal } from '../components/followups/CreateFollowUpModal';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';

export const FollowUpsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FollowUpFilterTab>('all');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await followupService.getFollowUps(activeTab);
      setFollowUps(data);
      const count = await followupService.getOverdueCount();
      setOverdueCount(count);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load follow-up tasks');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkComplete = async (item: FollowUp) => {
    try {
      const res = await followupService.completeFollowUp(item.id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Failed to mark follow-up as complete');
      }
    } catch (err: any) {
      alert(err.message || 'Error completing follow-up');
    }
  };

  const getStatusBadge = (item: FollowUp) => {
    if (item.status === 'completed') {
      return (
        <span className="badge badge-converted">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </span>
      );
    }
    if (item.status === 'cancelled') {
      return <span className="badge badge-lost">Cancelled</span>;
    }
    if (followupService.isOverdue(item)) {
      return (
        <span className="badge badge-overdue">
          <AlertCircle size={12} />
          <span>Overdue</span>
        </span>
      );
    }
    if (followupService.isDueToday(item)) {
      return (
        <span className="badge badge-qualified">
          <Clock size={12} />
          <span>Due Today</span>
        </span>
      );
    }
    return (
      <span className="badge badge-new">
        <Calendar size={12} />
        <span>Upcoming</span>
      </span>
    );
  };

  return (
    <div>
      {/* Top Filter Tabs & Action */}
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Tasks
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`btn btn-sm ${activeTab === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Due Today
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overdue')}
              className={`btn btn-sm ${activeTab === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
              style={
                activeTab !== 'overdue' && overdueCount > 0
                  ? { color: '#dc2626', borderColor: '#fca5a5' }
                  : {}
              }
            >
              <span>Overdue Tasks</span>
              {overdueCount > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'overdue' ? '#fff' : '#ef4444',
                    color: activeTab === 'overdue' ? '#dc2626' : '#fff',
                    borderRadius: '12px',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginLeft: '0.35rem',
                  }}
                >
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`btn btn-sm ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed History
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Follow-ups Table */}
      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Due Date & Time</th>
              <th>Student Lead</th>
              <th>Task Objective / Note</th>
              <th>Completed Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                  Loading follow-up tasks...
                </td>
              </tr>
            ) : followUps.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <CalendarCheck size={26} />
                    </div>
                    <div className="empty-state-title">
                      {activeTab === 'overdue'
                        ? 'Zero overdue tasks - Great job!'
                        : activeTab === 'today'
                        ? 'No tasks due today'
                        : activeTab === 'completed'
                        ? 'No completed tasks yet'
                        : 'No follow-up tasks scheduled'}
                    </div>
                    <p className="empty-state-desc">
                      {activeTab === 'overdue'
                        ? 'All scheduled student follow-up calls are on schedule or completed.'
                        : 'Schedule reminders for student calls, syllabus reviews, and counseling visits.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={15} />
                      <span>Schedule First Follow-up</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              followUps.map((item) => (
                <tr
                  key={item.id}
                  style={
                    followupService.isOverdue(item)
                      ? { backgroundColor: '#fffafa' }
                      : undefined
                  }
                >
                  <td>{getStatusBadge(item)}</td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      {new Date(item.due_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {new Date(item.due_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadId(item.lead_id);
                        setIsLeadDetailOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <strong style={{ color: '#1e3a8a', fontSize: '0.92rem' }}>
                        {item.lead?.full_name || 'View Lead'}
                      </strong>
                      <ExternalLink size={12} color="#2563eb" />
                    </button>
                    {item.lead?.course_interest && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {item.lead.course_interest}
                      </div>
                    )}
                  </td>

                  <td style={{ maxWidth: '380px' }}>
                    <div style={{ fontSize: '0.88rem', color: '#1e293b' }}>{item.note}</div>
                  </td>

                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                    {item.completed_at
                      ? new Date(item.completed_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {item.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(item)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#16a34a', borderColor: '#bbf7d0' }}
                        title="Mark follow-up as completed"
                      >
                        <Check size={14} />
                        <span>Mark Done</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Follow-up Modal */}
      <CreateFollowUpModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onFollowUpCreated={loadData}
      />

      {/* Linked Lead Detail Modal */}
      <LeadDetailModal
        leadId={selectedLeadId}
        isOpen={isLeadDetailOpen}
        onClose={() => {
          setIsLeadDetailOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={loadData}
      />
    </div>
  );
};
