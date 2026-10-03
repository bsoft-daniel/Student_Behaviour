import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Header />
        <div className="content">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

