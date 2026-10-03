import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav style={{ display: 'flex', itemsCenter: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
      <Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Home size={13} />
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} style={{ color: '#94a3b8' }} />
          {item.href ? (
            <Link to={item.href} style={{ color: '#3b59c4', textDecoration: 'none', fontWeight: 600 }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: '#1e293b', fontWeight: 700 }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
