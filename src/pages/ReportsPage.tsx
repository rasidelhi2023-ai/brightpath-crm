import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Info,
  CheckCircle2,
  Users,
  Compass
} from 'lucide-react';
import { metricService, ComprehensiveMetrics } from '../services/metricService';
import { LeadStatus } from '../types/crm.types';

export const ReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ComprehensiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metricService.getDashboardMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Top Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Overall Conversion Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                {loading ? '...' : `${metrics?.conversionRate}%`}
              </div>
            </div>
          </div>
          <small style={{ color: '#64748b' }}>
            Converted students ({metrics?.convertedLeads || 0}) / Total inquiries ({metrics?.totalLeads || 0})
          </small>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Enrolled Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                {loading ? '...' : metrics?.convertedLeads ?? 0}
              </div>
            </div>
          </div>
          <small style={{ color: '#64748b' }}>
            Students completed batch enrollment & registration
          </small>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Active Pipeline Enquiries</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                {loading ? '...' : (metrics ? metrics.totalLeads - metrics.convertedLeads - metrics.lostLeads : 0)}
              </div>
            </div>
          </div>
          <small style={{ color: '#64748b' }}>
            Inquiries currently in New, Contacted, or Qualified stages
          </small>
        </div>
      </div>

      {/* Main Analysis Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Source Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Inquiries by Acquisition Channel</h2>
              <small style={{ color: '#64748b' }}>Where prospective students discover BrightPath</small>
            </div>
            <PieChart size={18} color="#64748b" />
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading source metrics...</div>
          ) : !metrics || Object.keys(metrics.sourceCounts).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><PieChart size={24} /></div>
              <div className="empty-state-title">No acquisition data</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(metrics.sourceCounts).map(([source, count]) => {
                const total = metrics.totalLeads || 1;
                const pct = ((count / total) * 100).toFixed(1);
                return (
                  <div key={source}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#0f172a' }}>{source}</strong>
                      <span style={{ color: '#64748b' }}>
                        {count} leads ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: '#2563eb',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Funnel Stage Progression */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Admission Funnel Conversion</h2>
              <small style={{ color: '#64748b' }}>Drop-off and conversion rates across counseling stages</small>
            </div>
            <BarChart3 size={18} color="#64748b" />
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading funnel metrics...</div>
          ) : !metrics ? null : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['New', 'Contacted', 'Qualified', 'Converted'] as LeadStatus[]).map((stage, idx) => {
                const count = metrics.stageCounts[stage] || 0;
                const total = metrics.totalLeads || 1;
                const pct = ((count / total) * 100).toFixed(1);
                const stepColors = ['#0284c7', '#7c3aed', '#d97706', '#16a34a'];

                return (
                  <div key={stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        Step {idx + 1}: {stage}
                      </span>
                      <span style={{ color: '#64748b' }}>
                        {count} inquiries ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: stepColors[idx],
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Specification Metric Verification Legend */}
      <div className="card" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={20} color="#2563eb" style={{ marginTop: '0.15rem' }} />
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
              Metric Definitions & Compliance Reference (Section 15)
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.6' }}>
              Per BrightPath CRM specifications, all reports reconcile directly with permitted database records:
              <br />
              • <strong>Total Leads:</strong> Accessible rows in <code>leads</code> table.
              <br />
              • <strong>Conversion Rate:</strong> <code>(Converted Leads / Total Accessible Leads) × 100</code> with zero-division safeguard.
              <br />
              • <strong>Overdue Tasks:</strong> Accessible records in <code>follow_ups</code> where <code>status = 'pending' AND due_at &lt; NOW()</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
