import React, { type JSX } from 'react'
import { useNavigate, useLocation } from 'react-router'

interface NavbarLinkProps {
  icon: JSX.Element
  label: string
  active?: boolean
  onClick?: () => void
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-[50px] h-[50px] rounded-lg flex items-center justify-center my-2.5 mx-auto transition-all text-white ${
          active
            ? 'bg-white/20 border-l-4 border-white'
            : 'bg-transparent border-l-4 border-transparent hover:bg-white/10'
        }`}
        aria-label={label}
      >
        {Icon}
      </button>
      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    </div>
  )
}

const mockdata = [
  { icon: <i className="fa-solid fa-house"></i>, label: 'Home', path: '/' },
  {
    icon: <i className="fa-regular fa-window-maximize"></i>,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: <i className="fa-solid fa-map-location-dot"></i>,
    label: 'Map',
    path: '/map',
  },
  {
    icon: <i className="fa-solid fa-chart-simple"></i>,
    label: 'Graph',
    path: '/graph',
  },
  {
    icon: <i className="fa-solid fa-gear"></i>,
    label: 'Settings',
    path: '/settings',
  },
]

const Sidebar: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()

  const links = mockdata.map((link) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={location.pathname === link.path}
      onClick={() => {
        navigate(link.path)
      }}
    />
  ))

  return (
    <nav className="w-20 min-h-screen p-4 flex flex-col bg-sidebar fixed top-0 left-0">
      <div className="flex-1 mt-[50px]">
        <div className="flex flex-col items-center">{links}</div>
      </div>
    </nav>
  )
}

export default Sidebar
