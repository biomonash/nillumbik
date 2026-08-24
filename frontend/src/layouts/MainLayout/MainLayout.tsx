import React from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../../components/ui/Sidebar'
import Header from '../../components/ui/Header'
import Footer from '../../components/ui/Footer'
const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen text-black">
      <Sidebar />
      <div className="flex-1 min-w-0 ml-[var(--sidebar-width)] pt-[var(--header-height)] flex flex-col min-h-screen ">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default MainLayout
