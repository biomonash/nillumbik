import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/Card'
import Select from '../../../components/ui/Select'
import {
  getAllSpecies,
  getObservationBlocks,
  getObservationStats,
  type GetObservationBlocksResponse,
  type GetObservationStatsResponse,
  type Species,
  type ChartInput,
  type GetObservationSitesResponse,
  getObservationSites,
} from '../../../apis/mapCharts.api'
import { SpeciesLineChart } from './charts/SpeciesLineChart'
import { NativeBarChart } from './charts/NativeBarChart'
import { useSearchParams } from 'react-router'

interface MapChartsProps {
  selectedBlock: string
}

const DEFAULT_FROM = new Date('2020-01-01')
// Extraction Functions
function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function extractSortedZones(data: GetObservationBlocksResponse): ChartInput[] {
  const sorted = [...data.blocks]
    .sort((a, b) => a.block - b.block)
    .map((b) => ({ value: String(b.block), label: `Zone ${b.block}` }))
  return [{ value: 'all', label: 'All Zones' }, ...sorted]
}

function extractSortedSites(data: GetObservationSitesResponse): ChartInput[] {
  const sorted = [...data.sites]
    .sort((a, b) => a.siteCode.localeCompare(b.siteCode))
    .map((site) => ({
      value: site.siteCode,
      label: `Site ${site.siteCode}`,
    }))

  return [{ value: 'all', label: 'All Sites' }, ...sorted]
}

function extractTaxaOptions(data: GetObservationStatsResponse): ChartInput[] {
  const taxa = Object.keys(data.countByTaxa)
    .sort()
    .map((t) => ({ value: t, label: capitalize(t) }))
  return [{ value: 'all', label: 'All Taxa' }, ...taxa]
}

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

const MapCharts: React.FC<MapChartsProps> = ({ selectedBlock }) => {
  // States
  const [searchParams, setSearchParams] = useSearchParams()

  // derived from url
  const selectedZone = searchParams.get('zone') ?? 'all'
  const selectedSite = searchParams.get('site') ?? 'all'
  const selectedTaxa = searchParams.get('taxa') ?? 'all'
  const selectedSpecies = searchParams.get('species') ?? ''
  // state
  const [zoneOptions, setZoneOptions] = useState<ChartInput[]>([])
  const [siteOptions, setSiteOptions] = useState<ChartInput[]>([])
  const [taxaOptions, setTaxaOptions] = useState<ChartInput[]>([])
  const [allSpecies, setAllSpecies] = useState<Species[]>([])
  const [stats, setStats] = useState({
    total: 0,
    nativeCount: 0,
    nonNativeCount: 0,
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'filters' | 'species'>('filters')
  const [showToast, setShowToast] = useState(false)
  // refs
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const { total, nativeCount, nonNativeCount } = stats
  const speciesOptions = useMemo(
    () =>
      extractSpeciesOptions(
        allSpecies,
        selectedTaxa !== 'all' ? selectedTaxa : null,
      ),
    [allSpecies, selectedTaxa],
  )
  // useMemo() : Memorizes params to avoid recalculating on every render
  const params = useMemo(() => {
    const zoneBlock = selectedZone !== 'all' ? Number(selectedZone) : undefined

    const mapBlock = selectedBlock !== '' ? Number(selectedBlock) : undefined

    const block =
      zoneBlock !== undefined && !Number.isNaN(zoneBlock)
        ? zoneBlock
        : mapBlock !== undefined && !Number.isNaN(mapBlock)
          ? mapBlock
          : undefined

    return {
      from: DEFAULT_FROM,
      block,
      siteCode: selectedSite !== 'all' ? selectedSite : undefined,
      taxa: selectedTaxa !== 'all' ? selectedTaxa : undefined,
      commonName: selectedSpecies !== '' ? selectedSpecies : undefined,
    }
  }, [selectedZone, selectedSite, selectedBlock, selectedTaxa, selectedSpecies])
  const handleReset = useCallback(() => setSearchParams({}), [setSearchParams])
  const setParam = useCallback(
    (updates: Record<string, string>, empties: Record<string, string> = {}) => {
      setSearchParams((prev) => {
        Object.entries(updates).forEach(([k, v]) => {
          const empty = empties[k] ?? 'all'
          if (v === empty) prev.delete(k)
          else prev.set(k, v)
        })
        return prev
      })
    },
    [setSearchParams],
  )

  const copy = useCallback(() => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setShowToast(true)
      timerRef.current = setTimeout(() => setShowToast(false), 2000)
    })
  }, [])

  useEffect(() => {
    getObservationBlocks({ from: DEFAULT_FROM })
      .then((data) => setZoneOptions(extractSortedZones(data)))
      .catch((err) => console.error('Failed to fetch zones:', err))

    getAllSpecies()
      .then(setAllSpecies)
      .catch((err) => console.error('Failed to fetch species:', err))
  }, [])

  useEffect(() => {
    setSiteOptions([])
    getObservationSites({
      from: DEFAULT_FROM,
      block: selectedZone !== 'all' ? Number(selectedZone) : undefined,
    })
      .then((data) => setSiteOptions(extractSortedSites(data)))
      .catch((err) => console.error('Failed to fetch sites:', err))
  }, [selectedZone])

  useEffect(() => {
    setTaxaOptions([])
    getObservationStats({
      from: DEFAULT_FROM,
      block: selectedZone !== 'all' ? Number(selectedZone) : undefined,
      siteCode: selectedSite !== 'all' ? selectedSite : undefined,
    })
      .then((data) => setTaxaOptions(extractTaxaOptions(data)))
      .catch((err) => console.error('Failed to fetch taxa:', err))
  }, [selectedZone, selectedSite])

  useEffect(() => {
    Promise.all([getObservationBlocks(params), getObservationStats(params)])
      .then(([blocksData, statsData]) => {
        const total = params.siteCode
          ? statsData.observationCount
          : blocksData.blocks.reduce((sum, b) => sum + b.observationCount, 0)
        setStats({
          total,
          nativeCount: statsData.nativeSpeciesCount,
          nonNativeCount: statsData.speciesCount - statsData.nativeSpeciesCount,
        })
      })
      .catch((err) => console.error('Failed to fetch stats:', err))
  }, [params])

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
            onClick={handleReset}
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
            Zone
          </span>
          <Select
            options={zoneOptions}
            value={selectedZone}
            onChange={(z) => setParam({ zone: z, site: 'all' })}
            placeholder="Select Zone"
            className="w-full"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-primary">{selectedBlock}</p>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Site
          </span>
          <Select
            options={siteOptions}
            value={selectedSite}
            onChange={(s) => setParam({ site: s })}
            disabled={selectedZone === 'all'}
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
            value={selectedTaxa}
            onChange={(t) =>
              setParam({ taxa: t, species: '' }, { species: '' })
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
            value={selectedSpecies}
            onChange={(s) => setParam({ species: s }, { species: '' })}
            placeholder="Select Species"
            disabled={selectedTaxa === 'all'}
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
          {selectedZone !== 'all' ? `Zone ${selectedZone}` : 'All Zones'}
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
            <SpeciesLineChart
              filters={params}
              selectedSpecies={selectedSpecies}
            />
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
      <div className="hidden md:flex fixed right-0 top-0 h-screen w-[350px] bg-[var(--muted-foreground2)] z-50 flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto p-2 pt-14 flex flex-col gap-4">
          {content}
        </div>
      </div>

      {/* Mobile bottom drawer */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--muted-foreground2)] rounded-t-2xl shadow-xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}`}
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
