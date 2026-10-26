import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'connected' | 'not_configured' | 'error';
    latencyMs?: number;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setTestResult({
          status: 'not_configured',
          message:
            'Supabase credentials are not configured in .env. The app is currently running in local demonstration mode.',
        });
        setTestingConnection(false);
      }, 300);
      return;
    }

    const start = performance.now();
    try {
      // Query profiles table to probe database availability and RLS
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const end = performance.now();
      const latencyMs = Math.round(end - start);

      if (error) {
        setTestResult({
          status: 'error',
          message: `Connection test error: ${error.message}`,
        });
      } else {
        setTestResult({
          status: 'connected',
          latencyMs,
          message: `Successfully connected to Supabase PostgreSQL database (${latencyMs}ms response time). Tables and RLS policies are active.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Failed to communicate with Supabase',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      {/* User Profile Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={20} color="#2563eb" />
            <h2 className="card-title">User Account & Role Authorization</h2>
          </div>
          <span className="badge badge-contacted" style={{ textTransform: 'capitalize' }}>
            {profile?.role || 'counsellor'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile?.full_name || 'Admissions Counsellor (Demo)'}
                readOnly
                style={{ backgroundColor: '#f8fafc' }}
              />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className="form-input"
                value={user?.email || 'demo@brightpath.edu'}
                readOnly
                style={{ backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">System Role Permission</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={profile?.role || 'counsellor'}
                readOnly
                style={{ backgroundColor: '#f8fafc', fontWeight: 600, textTransform: 'capitalize', width: '200px' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                (Least-privileged default role)
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: '#475569',
            }}
          >
            <Lock size={16} color="#64748b" style={{ marginTop: '0.15rem' }} />
            <div>
              <strong>Security Rule (Section 11 & 12):</strong> Role changes cannot be executed through client UI requests. Administrator status must be granted exclusively via the database owner procedures or SQL Editor.
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection Test Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={20} color="#2563eb" />
            <h2 className="card-title">Supabase Database Connectivity</h2>
          </div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={14} className={testingConnection ? 'spin' : ''} />
            <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.6' }}>
          Tests real-time communication with your Supabase cloud project, verifying that the project URL is reachable and the anon public client key is valid.
        </p>

        {testResult && (
          <div
            className={`alert ${
              testResult.status === 'connected'
                ? 'alert-info'
                : testResult.status === 'not_configured'
                ? 'alert-warning'
                : 'alert-danger'
            }`}
            style={{
              marginBottom: '1rem',
              ...(testResult.status === 'connected'
                ? { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }
                : {}),
            }}
          >
            {testResult.status === 'connected' ? (
              <CheckCircle2 size={18} color="#16a34a" />
            ) : (
              <AlertTriangle size={18} />
            )}
            <div>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                {testResult.status === 'connected'
                  ? 'Supabase Connected'
                  : testResult.status === 'not_configured'
                  ? 'Not Configured (Demo Mode)'
                  : 'Connection Failed'}
              </strong>
              <span>{testResult.message}</span>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Key size={14} color="#64748b" />
            <span>Required Environment Variables (.env)</span>
          </div>
          <pre
            style={{
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              overflowX: 'auto',
              fontFamily: 'monospace',
            }}
          >
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-client-key`}
          </pre>
        </div>
      </div>

      {/* SQL Migration & Admin Bootstrap Reference Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={20} color="#2563eb" />
            <h2 className="card-title">Database Setup & Administrator Bootstrap</h2>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <span>Supabase SQL Editor</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            To deploy or reset the database schema for the BrightPath Academy workshop, paste and run our migrations in the Supabase SQL Editor:
          </p>

          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>
              Execute <code>supabase/migrations/001_initial_schema.sql</code> (Creates tables, triggers, and RLS policies).
            </li>
            <li>
              Optional: Execute <code>supabase/migrations/002_demo_seed.sql</code> (Loads fictional student records).
            </li>
            <li>
              After creating your user account, bootstrap administrator privileges with this SQL command:
            </li>
          </ol>

          <pre
            style={{
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              overflowX: 'auto',
              fontFamily: 'monospace',
            }}
          >
{`-- Grant administrator role to your email in Supabase SQL Editor:
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');`}
          </pre>
        </div>
      </div>
    </div>
  );
};
