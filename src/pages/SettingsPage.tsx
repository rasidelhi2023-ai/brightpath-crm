import React from 'react';
import { Settings, ShieldCheck, Database, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">User Profile & Role</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" defaultValue="Admissions Counsellor" readOnly />
          </div>
          <div>
            <label className="form-label">Role (Enforced by Database)</label>
            <input type="text" className="form-input" defaultValue="counsellor" readOnly />
            <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Per BrightPath CRM security specifications, roles cannot be modified directly via the client UI.
            </small>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Supabase Database Connection</h2>
        </div>
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          <Database size={18} />
          <div>
            <strong>Phase 2 Target:</strong> Connect your Supabase project URL and anon public key in <code>.env</code>.
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
          BrightPath CRM connects directly to Supabase PostgreSQL using Row Level Security (RLS) policies. Once configured, your leads, tasks, and activity audits persist in real time.
        </p>
      </div>
    </div>
  );
};
