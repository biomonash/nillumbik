import { Grid } from '@mantine/core'
import React, { type JSX } from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../../components/ui/Sidebar'

const DashboardLayout: React.FC = (): JSX.Element => {
    return (
        <main>
            <Grid>
                <Grid.Col span={1}>
                    <Sidebar />
                </Grid.Col>
                <Grid.Col span={11}>
                    DashboardLayout
                    <Outlet />
                </Grid.Col>
            </Grid>
        </main>
    )
}

export default DashboardLayout