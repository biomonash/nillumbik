import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import routes from "../constants/route";
import route from "../constants/route";

//? LAZY LOADING PAGES & LAYOUTS
// Layouts
const MainLayout = lazy(() => import("../layouts/MainLayout"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// Pages
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Instruction = lazy(() => import("../pages/Instruction"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Map = lazy(() => import("../pages/Map"));
const Admin = lazy(() => import("../pages/Admin"));
const Error = lazy(() => import("../pages/Error"));

const useBrowserRouter = () => {
    const router = createBrowserRouter([
        {
            path: routes.HOME,
            Component: MainLayout,
            children: [
                {
                    index: true,
                    Component: Home
                },
                {
                    path: routes.ABOUT,
                    Component: About
                },
                {
                    path: routes.INSTRUCTION,
                    Component: Instruction
                },

            ],
        },
        {
            path: "",
            Component: DashboardLayout,
            children: [
                {
                    path: routes.DASHBOARD,
                    Component: Dashboard
                },
                {
                    path: routes.GALLERY,
                    Component: Gallery
                },
                {
                    path: routes.MAP,
                    Component: Map
                },
            ]
        },
        {
            path: routes.ADMIN,
            Component: AdminLayout,
            children: [
                {
                    index: true,
                    Component: Admin
                },
            ]
        },
        {
            path: "*",
            Component: Error
        }
    ]);

    return router;
};

export default useBrowserRouter;
