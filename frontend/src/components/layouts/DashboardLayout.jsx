import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import DashboardNavbar from '../navbar/DashboardNavbar'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(prev => !prev)} />
      <DashboardNavbar sidebarCollapsed={collapsed} />
      <main
        className="transition-all duration-300 pt-16 min-h-screen"
        style={{ marginLeft: collapsed ? '72px' : '256px' }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
