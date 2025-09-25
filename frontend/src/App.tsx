import './styles/base/_global.scss';
import useBrowserRouter from './hooks/useBrowserRouter';
import { RouterProvider } from "react-router/dom";

function App() {
  const router = useBrowserRouter()
  return <RouterProvider router={router} />
}

export default App
