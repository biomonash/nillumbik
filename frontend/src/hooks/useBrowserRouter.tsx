import { lazy } from 'react'
import routes from '../constants/route'
import { Navigate } from 'react-router'
import { createBrowserRouter } from 'react-router'

//? LAZY LOADING PAGES & LAYOUTS
// Layouts
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'))
const AdminLayout = lazy(() => import('../layouts/AdminLayout'))

// Pages
//const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const Instruction = lazy(() => import('../pages/Instruction'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Gallery = lazy(() => import('../pages/Gallery'))
const Map = lazy(() => import('../pages/Map'))
const Graph = lazy(() => import('../pages/Graph.tsx'))
const Settings = lazy(() => import('../pages/Settings'))
const Admin = lazy(() => import('../pages/Admin'))
const Error = lazy(() => import('../pages/Error'))

const useBrowserRouter = () => {
  const router = createBrowserRouter([
    {
      path: routes.HOME,
      Component: () => (<Navigate to={routes.DASHBOARD} replace />),
      children: [
        {
          index: true,
          Component: Dashboard,
        },
        {
          path: routes.ABOUT,
          Component: About,
        },
        {
          path: routes.INSTRUCTION,
          Component: Instruction,
        },
      ],
    },
    {
      path: '',
      Component: DashboardLayout,
      children: [
        {
          path: routes.DASHBOARD,
          Component: Dashboard,
        },
        {
          path: routes.GALLERY,
          Component: Gallery,
        },
        {
          path: routes.MAP,
          Component: Map,
        },
        {
          path: routes.GRAPH,
          Component: Graph,
        },
        {
          path: routes.SETTINGS,
          Component: Settings,
        },
      ],
    },
    {
      path: routes.ADMIN,
      Component: AdminLayout,
      children: [
        {
          index: true,
          Component: Admin,
        },
      ],
    },
    {
      path: '*',
      Component: Error,
    },
  ], {
    basename: import.meta.env["BASE_URL"]
  })
  return router
}

export default useBrowserRouter
