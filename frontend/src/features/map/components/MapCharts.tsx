import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/Card'
import Select from '../../../components/ui/Select'
import type { Site, Species } from '../../../types'
import { type ChartInput } from '../../../apis/mapCharts.api'
import { SpeciesLineChart } from './charts/SpeciesLineChart'
import { NativeBarChart } from './charts/NativeBarChart'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import {
  resetFilters,
  updateSelectedBlock,
  updateSelectedSite,
  selectSpecies,
  selectTaxa,
  updateSelectedTaxa,
  init,
  selectBlock,
  selectSite,
  updateSelectedSpecies,
} from '../../../store/mapSlice'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'

// Extraction Functions
function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function extractSortedBlocks(data: number[]): ChartInput[] {
  const sorted = data.map((b) => ({ value: String(b), label: `Block ${b}` }))
  return [{ value: 'all', label: 'All Blocks' }, ...sorted]
}

function extractSortedSites(
  data: Site[],
  selectedBlock: number | null,
): ChartInput[] {
  const sorted = data
    .filter((site) => (selectedBlock ? site.block === selectedBlock : true))
    .map((site) => ({
      value: site.code,
      label: `Site ${site.name}`,
    }))

  return [{ value: 'all', label: 'All Sites' }, ...sorted]
}

const taxaOptions = [
  { value: 'all', label: 'All Taxa' },
  ...['bird', 'mammal', 'reptile'].map((t) => ({
    value: t,
    label: capitalize(t),
  })),
]

function extractSpeciesOptions(
  allSpecies: Species[],
  selectedTaxa: string | null,
): ChartInput[] {
  const filtered = selectedTaxa
    ? allSpecies.filter(
        (s) => s.taxa.toLowerCase() === selectedTaxa.toLowerCase(),
      )
    : allSpecies
  const unique = [...new Map(filtered.map((s) => [s.commonName, s])).values()]
  return [
    { value: '', label: 'All Species' },
    ...unique.map((s) => ({ value: s.commonName, label: s.commonName })),
  ]
}

const MapCharts: React.FC = () => {
  const dispatch = useAppDispatch()

  // read all filter state from redux
  const selectedBlock = useSelector(selectBlock)
  const selectedSite = useSelector(selectSite)
  const selectedTaxa = useSelector(selectTaxa)
  const selectedSpecies = useSelector(selectSpecies)
  const stats = useSelector((state: RootState) => ({
    total: state.map.totalObservations,
    nativeCount: state.map.nativeSpeciesCount,
    nonNativeCount: state.map.nonNativeSpeciesCount,
  }))
  // state
  const blockOptions = useAppSelector((state) =>
    extractSortedBlocks(state.map.blocks),
  )
  const siteOptions = useAppSelector((state) =>
    extractSortedSites(state.map.sites, state.map.selectedBlock),
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  // refs
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const height = drawerOpen ? '65vh' : '56px'
    document.documentElement.style.setProperty('--drawer-height', height)
  }, [drawerOpen])

  const { total, nativeCount, nonNativeCount } = stats
  const speciesOptions = useAppSelector((state) =>
    extractSpeciesOptions(state.map.species, state.map.selectedTaxa),
  )

  const copy = useCallback(() => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setShowToast(true)
      timerRef.current = setTimeout(() => setShowToast(false), 2000)
    })
  }, [])

  // load initial data
  useEffect(() => {
    dispatch(init())
  }, [dispatch])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
  // Shared content used in both desktop and mobile
  const content = (
    <>
      {/* Header */}
      <div className="flex relative justify-between items-center">
        <h1 className="text-black text-lg font-semibold tracking-tight">
          Zone Filter 🔎
        </h1>
        <div className="flex items-center gap-1.5 my-2">
          <button
            onClick={copy}
            className="border-2 border-[var(--button)] text-[var(--button)] font-semibold py-1.5 w-22 rounded-full text-xs transition-all duration-200 hover:scale-105 hover:bg-[var(--button-hover)] hover:text-white hover:shadow-md"
          >
            Copy Link
          </button>
          <button
            onClick={() => dispatch(resetFilters())}
            className="border-2 border-[var(--button)] bg-[var(--button)] font-semibold py-1.5 w-22 rounded-full text-xs transition-all duration-200 hover:bg-[var(--button-hover)] hover:scale-105 hover:shadow-lg"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Select Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Block
          </span>
          <Select
            options={blockOptions}
            value={selectedBlock ? String(selectedBlock) : 'all'}
            onChange={(z) =>
              dispatch(updateSelectedBlock(z === 'all' ? null : z))
            }
            placeholder="Select Block"
            className="w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Site
          </span>
          <Select
            options={siteOptions}
            value={selectedSite ?? 'all'}
            onChange={(s) =>
              dispatch(updateSelectedSite(s === 'all' ? null : s))
            }
            // disabled={selectedBlock === null}
            placeholder="Select Site"
            className="w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Taxa{' '}
            <span className="normal-case font-normal text-gray-400">
              (optional)
            </span>
          </span>
          <Select
            options={taxaOptions}
            value={selectedTaxa ?? 'all'}
            onChange={(t) =>
              dispatch(updateSelectedTaxa(t === 'all' ? null : t))
            }
            placeholder="Select Taxa"
            className="w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Species{' '}
            <span className="normal-case font-normal text-gray-400">
              (optional)
            </span>
          </span>
          <Select
            options={speciesOptions}
            value={selectedSpecies ?? 'all'}
            onChange={(s) =>
              dispatch(updateSelectedSpecies(s === 'all' ? null : s))
            }
            placeholder="Select Species"
            className="w-full"
          />
        </div>
      </div>

      {/* Species badge */}
      {selectedSpecies && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Species Type:</span>
          <span
            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${nativeCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {nativeCount > 0 ? '🌿 Native' : '⚠️ Non-Native'}
          </span>
        </div>
      )}

      {/* Zone summary */}
      <div className="bg-white/50 rounded-xl p-3 flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {selectedBlock ? `Zone ${selectedBlock}` : 'All Zones'}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-black">
            {total.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">total detections</span>
        </div>
      </div>

      {/* Distribution — hidden when species selected */}
      {!selectedSpecies && (
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block">
            Distribution
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-700">
                {nativeCount}
              </div>
              <div className="text-xs text-green-600 font-medium">Native</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-red-500">
                {nonNativeCount}
              </div>
              <div className="text-xs text-red-400 font-medium">Non-Native</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="flex flex-col gap-4">
        <Card className="text-black border-0 shadow-sm">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm">Native vs Non-Native</CardTitle>
            <CardDescription className="text-xs">
              Species distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            {!selectedSpecies ? (
              <NativeBarChart
                nativeCount={nativeCount}
                nonNativeCount={nonNativeCount}
              />
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                Clear species to see distribution
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="text-black border-0 shadow-sm">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm">Species Richness</CardTitle>
            <CardDescription className="text-xs">
              {!selectedSpecies
                ? 'Unique species observed over time'
                : `Number of ${selectedSpecies} observed over time`}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <SpeciesLineChart />
          </CardContent>
        </Card>
      </div>
    </>
  )

  return (
    <>
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2 bg-white text-gray-800 text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-gray-100">
          <span className="text-green-500 text-sm">
            ✓ Link copied to clipboard
          </span>
        </div>
      )}
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed right-0 top-0 h-screen w-[350px] bg-[var(--muted-foreground2)] z-50 flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto p-2 pt-14 flex flex-col gap-4">
          {content}
        </div>
      </div>

      {/* Mobile bottom drawer */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--muted-foreground2)] rounded-t-2xl shadow-xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}`}
      >
        {/* Handle bar */}
        <div
          className="flex justify-between items-center px-4 h-14 cursor-pointer"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black text-sm">
              Zone Filter 🔎
            </span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-500 text-xs">
              {total.toLocaleString()} detections
            </span>
          </div>
          <i
            className={`text-gray-600 text-xs mr-5 ${drawerOpen ? 'fa fa-angle-down' : 'fa fa-angle-up'}`}
          />
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-4 pb-8 flex flex-col gap-4">
          {content}
        </div>
      </div>
    </>
  )
}

export default MapCharts