import React from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../../components/ui/Sidebar'
import Header from '../../components/ui/Header'
import Footer from '../../components/ui/Footer'
const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-20 flex flex-col min-h-screen bg-[#2d2d2d]">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;