import React from 'react';

export const Card = ({
  children,
  className = '',
  title = null,
  subtitle = null,
  action = null,
  style = {},
  ...props
}) => {
  return (
    <div className={`card ${className}`.trim()} style={style} {...props}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            {title && <h3 style={{ margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#67738a' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
