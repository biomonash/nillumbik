import React, { useState, useEffect, useMemo } from 'react'
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
} from '../../../apis/mapCharts.api'
import { SpeciesLineChart } from './charts/SpeciesLineChart'
import { NativeBarChart } from './charts/NativeBarChart'

const DEFAULT_FROM = new Date('2020-01-01')
// Extracion Functions
function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function extractSortedZones(data: GetObservationBlocksResponse): ChartInput[] {
  const sorted = [...data.blocks]
    .sort((a, b) => a.block - b.block)
    .map((b) => ({ value: String(b.block), label: `Zone ${b.block}` }))
  return [{ value: 'all', label: 'All Zones' }, ...sorted]
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

const MapCharts: React.FC = () => {
  // States
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [zoneOptions, setZoneOptions] = useState<ChartInput[]>([])

  const [selectedTaxa, setSelectedTaxa] = useState<string>('all')
  const [taxaOptions, setTaxaOptions] = useState<ChartInput[]>([])

  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [speciesOptions, setSpeciesOptions] = useState<ChartInput[]>([])
  const [allSpecies, setAllSpecies] = useState<Species[]>([])

  const [observationCount, setObservationCount] = useState(0) // Outputs
  const [nativeCount, setNativeCount] = useState(0)
  const [nonNativeCount, setNonNativeCount] = useState(0)

  const [drawerOpen, setDrawerOpen] = useState(false) // For responsive view

  // Loads initial data
  useEffect(() => {
    getObservationBlocks({ from: DEFAULT_FROM }).then((data) =>
      setZoneOptions(extractSortedZones(data)),
    )
    getObservationStats({ from: DEFAULT_FROM }).then((data) =>
      setTaxaOptions(extractTaxaOptions(data)),
    )
    getAllSpecies().then(setAllSpecies)
  }, [])

  useEffect(() => {
    setSpeciesOptions(
      extractSpeciesOptions(
        allSpecies,
        selectedTaxa !== 'all' ? selectedTaxa : null,
      ),
    )
    setSelectedSpecies('') // Default as empty string for "all" options
  }, [selectedTaxa, allSpecies])

  // useMemo() : Memorizes params to avoid recalculating on every render
  const params = useMemo(
    () => ({
      from: DEFAULT_FROM,
      block: selectedZone !== 'all' ? Number(selectedZone) : undefined,
      taxa: selectedTaxa !== 'all' ? selectedTaxa : undefined,
      commonName: selectedSpecies !== '' ? selectedSpecies : undefined,
    }),
    [selectedZone, selectedTaxa, selectedSpecies],
  )

  // fetch obs stats when filter state changes
  useEffect(() => {
    Promise.all([
      getObservationBlocks(params),
      getObservationStats(params),
    ]).then(([blocksData, statsData]) => {
      const total = blocksData.blocks.reduce(
        (sum, b) => sum + b.observationCount,
        0,
      )
      setObservationCount(total)
      setNativeCount(statsData.nativeSpeciesCount)
      setNonNativeCount(statsData.speciesCount - statsData.nativeSpeciesCount)
    })
  }, [params])

  const handleReset = () => {
    setSelectedZone('all')
    setSelectedTaxa('all')
    setSelectedSpecies('')
  }
  // Shared content used in both desktop and mobile
  const content = (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-black text-lg font-semibold tracking-tight">
          Zone Filter 🔎
        </h1>
        <button
          onClick={handleReset}
          className="bg-[var(--button)] hover:bg-[var(--button-hover)] text-white font-semibold py-1.5 px-3 rounded-full text-xs transition-colors"
        >
          Reset Filters
        </button>

        {/**TODO: Add a download button or share link button(selections need to query/params in links)  
        <button className="bg-[var(--button)] hover:bg-[var(--button-hover)] text-white font-semibold py-1.5 px-3 rounded-full text-xs transition-colors">
          Download
        </button>
        */}
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
            onChange={(val) => setSelectedZone(val)}
            placeholder="Select Zone"
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
            onChange={setSelectedTaxa}
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
            onChange={setSelectedSpecies}
            placeholder="Select Species"
            disabled={selectedTaxa === 'all'}
            className="w-full"
          />
        </div>
      </div>

      {/* Species badge */}
      {selectedSpecies && selectedSpecies !== '' && (
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
            {observationCount.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">total detections</span>
        </div>
      </div>

      {/* Distribution — hidden when species selected */}
      {(!selectedSpecies || selectedSpecies === '') && (
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
            {!selectedSpecies || selectedSpecies === '' ? (
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
              {!selectedSpecies || selectedSpecies === ''
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed right-0 top-0 h-screen w-[350px] bg-[var(--muted-foreground2)] z-50 flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 pt-14 flex flex-col gap-4">
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
              {observationCount.toLocaleString()} detections
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
