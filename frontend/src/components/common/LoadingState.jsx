import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading content...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center', padding: '3rem', textAlign: 'center' }}>
      <Loader2 size={32} style={{ color: '#3b59c4', animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>{message}</p>
    </div>
  );
};
