import React, { type JSX } from 'react'
import { Outlet } from 'react-router'

const AdminLayout: React.FC = (): JSX.Element => {
    return (
        <main>
            AdminLayout
            <Outlet />
        </main>
    )
}

export default AdminLayout