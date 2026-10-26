import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const ConfigBanner: React.FC = () => {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fef3c7',
        color: '#92400e',
        padding: '0.65rem 1.5rem',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <AlertTriangle size={17} color="#d97706" />
        <span>
          <strong>Database Not Connected:</strong> Supabase credentials are missing or placeholder. Add{' '}
          <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
        </span>
      </div>
      <a
        href="https://supabase.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontWeight: 600,
          color: '#b45309',
          textDecoration: 'underline',
        }}
      >
        <span>Open Supabase</span>
        <ExternalLink size={13} />
      </a>
    </div>
  );
};
