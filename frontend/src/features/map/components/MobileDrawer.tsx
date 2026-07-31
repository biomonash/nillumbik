import SpeciesSidebar from './SpeciesSidebar'
import MapCharts from './MapCharts'

interface MobileDrawerProps {
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  activeTab: 'species' | 'filters'
  setActiveTab: (tab: 'species' | 'filters') => void
}

export default function MobileDrawer({
  drawerOpen,
  setDrawerOpen,
  activeTab,
  setActiveTab,
}: MobileDrawerProps) {
  const handleTabClick = (tab: 'species' | 'filters') => {
    if (!drawerOpen) setDrawerOpen(true)
    setActiveTab(tab)
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-[var(--muted-foreground2)] rounded-t-2xl shadow-xl
        transition-transform duration-300 ease-in-out
        ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}
      `}
    >
      <div className="flex items-center my-1 p-5 h-14 gap-2 select-none">
        <button
          onClick={() => handleTabClick('filters')}
          className={`
            flex-1 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200
            ${
              activeTab === 'filters'
                ? 'bg-green-700 border-green-700 text-white'
                : 'bg-transparent border-green-700 text-[var(--button)]'
            }
          `}
        >
          Zone Filter
        </button>

        <button
          onClick={() => handleTabClick('species')}
          className={`
            flex-1 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200
            ${
              activeTab === 'species'
                ? 'bg-green-700 border-green-700 text-white'
                : 'bg-transparent border-green-700 text-[var(--button)]'
            }
          `}
        >
          Species
        </button>

        <i
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`text-gray-600 text-xs fa cursor-pointer px-1 ${
            drawerOpen ? 'fa-angle-down' : 'fa-angle-up'
          }`}
        />
      </div>

      <div className="max-h-[65vh] overflow-y-auto px-4 pb-8">
        {activeTab === 'species' ? <SpeciesSidebar /> : <MapCharts />}
      </div>
    </div>
  )
}
