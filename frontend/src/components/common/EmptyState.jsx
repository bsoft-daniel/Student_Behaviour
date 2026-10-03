import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no records matching your current filter criteria.',
  actionText = null,
  onAction = null,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '1rem', border: '2px dashed #cbd5e1' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: '0.75rem' }}>
        <Icon size={24} />
      </div>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.875rem', color: '#64748b', maxWidth: '380px' }}>{description}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
