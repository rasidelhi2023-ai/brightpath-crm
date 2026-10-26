import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { metricService, ComprehensiveMetrics } from '../services/metricService';
import { followupService } from '../services/followupService';
import { Lead, FollowUp, LeadStatus } from '../types/crm.types';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ComprehensiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected lead modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await metricService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleQuickCompleteFollowUp = async (item: FollowUp) => {
    const res = await followupService.completeFollowUp(item.id);
    if (res.success) {
      loadMetrics();
    } else {
      alert(res.error || 'Failed to complete follow-up');
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
      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#2563eb', '--stat-bg': '#eff6ff' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Total Inquiries</div>
            <div className="stat-value">{loading ? '...' : metrics?.totalLeads ?? 0}</div>
          </div>
          <div className="stat-icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#0284c7', '--stat-bg': '#f0f9ff' } as React.CSSProperties}>
          <div>
            <div className="stat-label">New Inquiries</div>
            <div className="stat-value">{loading ? '...' : metrics?.newLeads ?? 0}</div>
          </div>
          <div className="stat-icon">
            <UserPlus size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#16a34a', '--stat-bg': '#f0fdf4' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Admitted / Converted</div>
            <div className="stat-value">{loading ? '...' : metrics?.convertedLeads ?? 0}</div>
          </div>
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#dc2626', '--stat-bg': '#fef2f2' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Overdue Follow-ups</div>
            <div className="stat-value" style={metrics && metrics.overdueFollowUps > 0 ? { color: '#dc2626' } : {}}>
              {loading ? '...' : metrics?.overdueFollowUps ?? 0}
            </div>
          </div>
          <div className="stat-icon">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#7c3aed', '--stat-bg': '#f5f3ff' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Conversion Rate</div>
            <div className="stat-value">{loading ? '...' : `${metrics?.conversionRate ?? '0.0'}%`}</div>
          </div>
          <div className="stat-icon">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Pipeline Stage Distribution Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 className="card-title">Admission Pipeline Progression</h2>
            <small style={{ color: '#64748b' }}>Live counts across all stages of student enrollment</small>
          </div>
          <Link to="/leads" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>View All Leads</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading pipeline...</div>
        ) : (
          <div>
            {/* Visual multi-segment bar */}
            <div style={{ height: '10px', display: 'flex', borderRadius: '5px', overflow: 'hidden', backgroundColor: '#e2e8f0', marginBottom: '1.25rem' }}>
              {(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as LeadStatus[]).map((st) => {
                const count = metrics?.stageCounts[st] || 0;
                const total = metrics?.totalLeads || 1;
                const pct = (count / total) * 100;
                if (pct === 0) return null;

                const colors: Record<LeadStatus, string> = {
                  New: '#38bdf8',
                  Contacted: '#a855f7',
                  Qualified: '#f59e0b',
                  Converted: '#22c55e',
                  Lost: '#ef4444',
                };
                return (
                  <div
                    key={st}
                    title={`${st}: ${count} (${pct.toFixed(0)}%)`}
                    style={{ width: `${pct}%`, backgroundColor: colors[st], transition: 'width 0.3s ease' }}
                  />
                );
              })}
            </div>

            {/* Stages Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as LeadStatus[]).map((st) => {
                const count = metrics?.stageCounts[st] || 0;
                const total = metrics?.totalLeads || 0;
                const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';

                return (
                  <div
                    key={st}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      {getStatusBadge(st)}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Lower Section: Recent Leads & Urgent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Recent Leads */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Student Inquiries</h2>
              <small style={{ color: '#64748b' }}>Latest registrations awaiting counseling</small>
            </div>
            <Link to="/leads" className="btn btn-secondary btn-sm">Manage</Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading inquiries...</div>
          ) : !metrics || metrics.recentLeads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={24} /></div>
              <div className="empty-state-title">No leads registered yet</div>
              <p className="empty-state-desc">Create your first student inquiry to see it here.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course Interest</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'right' }}>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentLeads.map((lead) => (
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
                            padding: 0,
                            textAlign: 'left',
                          }}
                        >
                          <strong style={{ color: '#1e3a8a', display: 'block', fontSize: '0.9rem' }}>
                            {lead.full_name}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{lead.phone}</span>
                        </button>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{lead.course_interest}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{lead.source}</td>
                      <td style={{ textAlign: 'right' }}>{getStatusBadge(lead.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Urgent Follow-ups */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Immediate Follow-up Tasks</h2>
              <small style={{ color: '#64748b' }}>Due calls requiring counselor attention</small>
            </div>
            <Link to="/followups" className="btn btn-secondary btn-sm">View All</Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading tasks...</div>
          ) : !metrics || metrics.urgentFollowUps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CheckCircle2 size={24} color="#16a34a" /></div>
              <div className="empty-state-title">Zero pending follow-ups</div>
              <p className="empty-state-desc">All student consultation reminders have been resolved.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.urgentFollowUps.map((task) => {
                const isOverdue = followupService.isOverdue(task);
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: '0.85rem 1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: isOverdue ? '#fff5f5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        {isOverdue ? (
                          <span className="badge badge-overdue">
                            <AlertCircle size={11} /> Overdue
                          </span>
                        ) : (
                          <span className="badge badge-qualified">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                          {task.lead?.full_name || 'Student'}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>{task.note}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Due: {new Date(task.due_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickCompleteFollowUp(task)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#16a34a', borderColor: '#bbf7d0', padding: '0.35rem 0.6rem' }}
                      title="Mark task done"
                    >
                      <Check size={14} />
                      <span>Done</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Linked Lead Detail Modal */}
      <LeadDetailModal
        leadId={selectedLeadId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={loadMetrics}
      />
    </div>
  );
};
