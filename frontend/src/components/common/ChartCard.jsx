import React from 'react';
import { Card } from './Card';

export const ChartCard = ({ title, subtitle, action, children, height = 'h-72', className = '' }) => {
  return (
    <Card title={title} subtitle={subtitle} action={action} className={className}>
      <div className={`w-full ${height} mt-2`}>
        {children}
      </div>
    </Card>
  );
};
