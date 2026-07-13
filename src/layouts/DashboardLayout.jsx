// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Content shifts based on sidebar state */}
      <div className={isCollapsed ? 'md:ml-20' : 'md:ml-72'}>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
