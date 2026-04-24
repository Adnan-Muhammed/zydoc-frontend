'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AuthGuard from '../auth/AuthGuard';
import './dashboard-layout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'doctor' | 'patient';
  title?: string;
}

export default function DashboardLayout({ children, role, title = 'Dashboard' }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <AuthGuard>
      <div className="dashboard-wrapper">
        <Sidebar  
          role={role}  
          isOpen={isSidebarOpen}  
          onClose={() => setIsSidebarOpen(false)}  
        />
                
        <main className="dashboard-main">
          <Topbar  
            role={role}  
            title={title}  
            onToggleSidebar={toggleSidebar}  
          />
                    
          <div className="dashboard-content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
