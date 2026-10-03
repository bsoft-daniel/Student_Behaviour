import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { user } = useAuth();
  const initial = user?.first_name ? user.first_name[0].toUpperCase() : 'U';
  const roleName = user?.role_name || user?.role?.role_name || user?.role_code || 'Portal User';

  return (
    <header className="topbar">
      <h2>Student Behaviour Monitoring System</h2>
      <div className="meta">
        <div style={{ textAlign: 'right' }}>
          <strong style={{ display: 'block', fontSize: '13px', color: '#17233b' }}>
            {user?.first_name} {user?.last_name || ''}
          </strong>
          <small style={{ color: '#67738a', fontSize: '11px' }}>{roleName}</small>
        </div>
        <div className="avatar">{initial}</div>
      </div>
    </header>
  );
};
