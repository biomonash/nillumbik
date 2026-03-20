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
                    <div className="ml-20 min-h-screen bg-[var(--background)]">
                        <Outlet />
                    </div>
                </main>
            <Footer />
        </>
    )
}

export default MainLayout