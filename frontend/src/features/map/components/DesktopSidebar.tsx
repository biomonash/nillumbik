import { type ReactNode } from 'react'

interface DesktopSidebarProps {
  side: 'left' | 'right'
  width: number
  collapsed: boolean
  setWidth: React.Dispatch<React.SetStateAction<number>>
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  children: ReactNode
  navWidth?: number
}

const MIN_WIDTH = 250
const MAX_WIDTH = 500
const COLLAPSED_WIDTH = 30 //the size of the sidebars when u close it

export default function DesktopSidebar({
  side,
  width,
  collapsed,
  setWidth,
  setCollapsed,
  children,
  navWidth = 80,
}: DesktopSidebarProps) {
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()

    const move = (event: MouseEvent) => {
      if (side === 'left') {
        const newWidth = event.clientX - navWidth
        setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)))
      } else {
        const newWidth = window.innerWidth - event.clientX
        setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)))
      }
    }

    const stop = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', stop)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', stop)
  }

  return (
    <div
      className={`fixed z-50 flex flex-col shadow-xl transition-[width] duration-200
        ${
          side === 'left'
            ? 'left-[80px] top-14 h-[calc(100vh-56px)]  bg-white'
            : 'right-0 top-0 h-screen ]  bg-[var(--muted-foreground2)]'
        }`}
      style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className={`fixed top-1/2 -translate-y-1/2 z-[60]
                    flex h-10 w-10 items-center justify-center
                    rounded-full border border-gray-300 text-[var(--grey-accent)]
                    bg-white/80 shadow-lg 
                    transition-all
                    hover:scale-110 hover:shadow-xl
                    active:scale-95
                    ${side === 'left' ? '' : ''}`}
        style={{
          left:
            side === 'left'
              ? `${80 + (collapsed ? 44 : width) - 20}px`
              : undefined,

          right:
            side === 'right'
              ? `${5 + (collapsed ? 44 : width) - 20}px`
              : undefined,
        }}
      >
        {side === 'left' ? (
          collapsed ? (
            <i className="fa-solid fa-angle-right"></i>
          ) : (
            <i className="fa-solid fa-angle-left"></i>
          )
        ) : collapsed ? (
          <i className="fa-solid fa-angle-left"></i>
        ) : (
          <i className="fa-solid fa-angle-right"></i>
        )}
      </button>

      {!collapsed && (
        <div
          className={`flex-1 overflow-y-auto ${side === 'right' ? 'p-2 pt-14' : ''}`}
        >
          {children}
        </div>
      )}

      {/* Resize Handle */}
      {!collapsed && (
        <div
          onMouseDown={startResize}
          className={`absolute top-0 h-full w-3 cursor-ew-resize flex items-center justify-center
                                ${side === 'left' ? 'right-0' : 'left-0'}`}
        >
          <div className="h-12 w-1 rounded-full bg-gray-300 hover:bg-green-500 transition-colors" />
        </div>
      )}
    </div>
  )
}
