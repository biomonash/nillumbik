import React, { type JSX } from 'react'
import { Outlet } from 'react-router'
import Header from '../../components/ui/Header'
import Footer from '../../components/ui/Footer/Footer'
import Sidebar from '../../components/ui/Sidebar'

const MainLayout: React.FC = (): JSX.Element => {
    return (
        <>
            <Header />
                <Sidebar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default MainLayout