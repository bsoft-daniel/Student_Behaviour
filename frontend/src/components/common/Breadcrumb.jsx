import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
      <Link to="/dashboard" className="hover:text-primary transition flex items-center gap-1">
        <Home size={13} />
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} className="text-slate-400" />
          {item.href ? (
            <Link to={item.href} className="hover:text-primary transition font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
