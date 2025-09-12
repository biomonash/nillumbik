import React, { type JSX } from 'react'
import { Outlet } from 'react-router'
import Header from '../../components/ui/Header'
import Footer from '../../components/ui/Footer/Footer'

const MainLayout: React.FC = (): JSX.Element => {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default MainLayout