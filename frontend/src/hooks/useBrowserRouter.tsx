import { lazy } from 'react'
import routes from '../constants/route'
import { Navigate } from 'react-router'
import { createBrowserRouter } from 'react-router'
import MainLayout from '../layouts/MainLayout/MainLayout.tsx'

//? LAZY LOADING PAGES & LAYOUTS
// Layouts
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'))
const AdminLayout = lazy(() => import('../layouts/AdminLayout'))

// Pages
const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Gallery = lazy(() => import('../pages/Gallery'))
const Map = lazy(() => import('../pages/Map'))
const Graph = lazy(() => import('../pages/Graph.tsx'))
const Settings = lazy(() => import('../pages/Settings'))
const Error = lazy(() => import('../pages/Error'))

const useBrowserRouter = () => {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        Component: MainLayout,
        children: [
          {
            index: true,
            Component: () => <Navigate to={routes.HOME} replace />,
          },
          {
            path: routes.HOME,
            Component: Home,
          },
        ],
      },
      {
        path: routes.ABOUT,
        Component: About,
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
        path: '*',
        Component: Error,
      },
    ],
    {
      basename: import.meta.env['BASE_URL'],
    },
  )
  return router
}

export default useBrowserRouter
