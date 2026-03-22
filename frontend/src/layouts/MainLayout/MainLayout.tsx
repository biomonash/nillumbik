import React, { type JSX } from 'react'
import { Outlet } from 'react-router'
import Header from '../../components/ui/Header'
import Footer from '../../components/ui/Footer/Footer'
import Sidebar from '../../components/ui/Sidebar'

const MainLayout: React.FC = (): JSX.Element => {
    return (
        <>
            <Header />
                <main className="min-h-screen flex flex-col">
                    <Sidebar />
                    <div className="min-h-screen bg-[var(--background)] ml-[var(--sidebar-width)] pt-[var(--header-height)] flex-1">
                        <Outlet />
                    </div>
                </main>
            <Footer />
        </>
    )
}

export default MainLayout