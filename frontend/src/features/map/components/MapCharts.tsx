import React, { useState, useCallback, useRef, useEffect } from 'react'
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
  selectBlock,
  selectSite,
  updateSelectedSpecies,
} from '../../../store/mapSlice'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import Badge from '../../../components/ui/Badge'

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function extractSortedBlocks(data: number[]): ChartInput[] {
  const sorted = data.map((b) => ({ value: String(b), label: `Block ${b}` }))
  return [{ value: 'all', label: 'All Blocks' }, ...sorted]
}

function extractSortedSites(
  data: Site[],
  selectedBlocks?: number[],
): ChartInput[] {
  const sorted = data
    .filter((site) =>
      selectedBlocks ? selectedBlocks.includes(site.block) : true,
    )
    .map((site) => ({ value: site.code, label: `Site ${site.name}` }))
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
  selectedTaxa?: string,
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

  const selectedBlock = useSelector(selectBlock)
  const selectedSite = useSelector(selectSite)
  const selectedTaxa = useSelector(selectTaxa)
  const selectedSpecies = useSelector(selectSpecies)
  const stats = useSelector((state: RootState) => ({
    total: state.map.totalObservations,
    nativeCount: state.map.nativeSpeciesCount,
    nonNativeCount: state.map.nonNativeSpeciesCount,
  }))

  const blockOptions = useAppSelector((state) =>
    extractSortedBlocks(state.map.blocks),
  )
  const siteOptions = useAppSelector((state) =>
    extractSortedSites(state.map.sites, state.map.query.blocks),
  )
  const speciesOptions = useAppSelector((state) =>
    extractSpeciesOptions(state.map.species, state.map.query.taxa),
  )

  const [showToast, setShowToast] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const { total, nativeCount, nonNativeCount } = stats

  const copy = useCallback(() => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setShowToast(true)
      timerRef.current = setTimeout(() => setShowToast(false), 2000)
    })
  }, [])

  const downloadCSV = useCallback(() => {
    const params = new URLSearchParams()
    if (selectedBlock && selectedBlock.length > 0) {
      selectedBlock.forEach((b) => params.append('block[]', String(b)))
    }
    if (selectedSite && selectedSite.length > 0) {
      selectedSite.forEach((s) => params.append('siteCode[]', s))
    }
    if (selectedTaxa) params.append('taxa', selectedTaxa)
    if (selectedSpecies) params.append('commonName', selectedSpecies)

    const url = `http://localhost:8000/api/export?${params.toString()}`
    window.location.href = url
  }, [selectedBlock, selectedSite, selectedTaxa, selectedSpecies])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="bg-[var(--muted-foreground2)] flex flex-col gap-3">
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2 bg-white text-gray-800 text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-gray-100">
          <span className="text-green-500 text-sm">
            ✓ Link copied to clipboard
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex relative justify-between items-center">
        <h1 className="text-black text-lg font-semibold tracking-tight">
          Zone Filter 🔎
        </h1>
        <div className="flex items-center gap-1.5 my-2">
          <button
            onClick={copy}
            className="border-2 border-green-700 text-green-700 font-semibold py-1.5 w-22 rounded-full text-xs transition-all duration-200 hover:scale-105 hover:bg-[var(--button-hover)] hover:text-white hover:shadow-md"
          >
            Copy Link
          </button>
          <button
            onClick={() => dispatch(resetFilters())}
            className="border-2 border-green-700 bg-green-700 font-semibold py-1.5 w-22 rounded-full text-xs transition-all duration-200 hover:bg-[var(--button-hover)] hover:scale-105 hover:shadow-lg"
          >
            Reset Filters
          </button>
          <button
            onClick={downloadCSV}
            className="border-2 border-green-700 bg-green-700 font-semibold py-1.5 w-22 rounded-full text-xs transition-all duration-200 hover:bg-[var(--button-hover)] hover:scale-105 hover:shadow-lg"
          >
            {' '}
            Download
          </button>
        </div>
      </div>

      {/* Select Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Block
          </span>
          {selectedBlock && selectedBlock.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {selectedBlock.map((block) => (
                <Badge key={block} className="gap-1 pr-1.5 bg-sidebar">
                  {block}
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateSelectedBlock(
                          selectedBlock.filter((s) => s !== block).map(String),
                        ),
                      )
                    }
                    aria-label={`Remove ${block}`}
                    className="flex items-center justify-center rounded-full hover:bg-black/10 w-3.5 h-3.5 leading-none"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Select
            options={blockOptions}
            value={selectedBlock ? String(selectedBlock) : 'all'}
            onChange={(z) =>
              dispatch(
                updateSelectedBlock(
                  z === 'all' ? [] : [...(selectedBlock ?? []).map(String), z],
                ),
              )
            }
            placeholder="Select Block"
            className="w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            Site
          </span>
          {selectedSite && selectedSite.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {selectedSite.map((site) => (
                <Badge key={site} className="gap-1 pr-1.5 bg-sidebar">
                  {site}
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateSelectedSite(
                          selectedSite.filter((s) => s !== site),
                        ),
                      )
                    }
                    aria-label={`Remove ${site}`}
                    className="flex items-center justify-center rounded-full hover:bg-black/10 w-3.5 h-3.5 leading-none"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Select
            options={siteOptions}
            value={selectedSite?.join(', ') ?? 'all'}
            onChange={(s) =>
              dispatch(
                updateSelectedSite(
                  s === 'all' ? [] : [...(selectedSite ?? []), s],
                ),
              )
            }
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
            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
              nativeCount > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
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

      {/* Distribution */}
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
    </div>
  )
}

export default MapCharts
