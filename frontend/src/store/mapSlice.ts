import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './store'
import {
  getObservationsOverview,
  getObservationsTimeseries,
  type TimeseriesPoint,
} from '../apis/stats.api'
import { getSiteList } from '../apis/sites.api'
import { getObservedSpecies, getSpeciesList } from '../apis/species.api'
import type { ObservedSpecies, Site, Species } from '../types'

interface MapState {
  mode: 'block' | 'site'
  blocks: number[]
  sites: Site[]
  taxas: string[]
  species: Species[]
  selectedBlock: number | null
  selectedSite: string | null
  selectedTaxa: string | null
  selectedSpecies: string | null
  totalObservations: number
  nativeSpeciesCount: number
  nonNativeSpeciesCount: number
  countByTaxa: Record<string, number>
  timeseries: Record<string, TimeseriesPoint[]>
  observedSpecies: ObservedSpecies[]
}

const initialState: MapState = {
  mode: 'site',
  blocks: [],
  sites: [],
  taxas: [],
  species: [],
  selectedSite: null,
  selectedBlock: null,
  selectedTaxa: null,
  selectedSpecies: null,
  totalObservations: 0,
  nativeSpeciesCount: 0,
  nonNativeSpeciesCount: 0,
  countByTaxa: {},
  timeseries: {},
  observedSpecies: [],
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<'block' | 'site'>) {
      state.mode = action.payload
      state.selectedBlock = null
      state.selectedSite = null
    },
    setSelectedSite(state, action: PayloadAction<string | null>) {
      state.selectedSite = action.payload
    },
    setSelectedBlock(state, action: PayloadAction<string | null>) {
      state.selectedBlock = Number(action.payload)
      state.selectedSite = null
    },
    setSelectedTaxa(state, action: PayloadAction<string | null>) {
      state.selectedTaxa = action.payload
      state.selectedSpecies = null
    },
    setSelectedSpecies(state, action: PayloadAction<string | null>) {
      state.selectedSpecies = action.payload
    },
    setTimeseries(
      state,
      action: PayloadAction<Record<string, TimeseriesPoint[]>>,
    ) {
      state.timeseries = action.payload
    },
    setStats(
      state,
      action: PayloadAction<{
        total: number
        nativeCount: number
        nonNativeCount: number
        countByTaxa: Record<string, number>
      }>,
    ) {
      const { total, nativeCount, nonNativeCount, countByTaxa } = action.payload
      state.totalObservations = total
      state.nativeSpeciesCount = nativeCount
      state.nonNativeSpeciesCount = nonNativeCount
      state.countByTaxa = countByTaxa
    },

    setSites(state, action: PayloadAction<Site[]>) {
      state.sites = [...action.payload]
      state.blocks = Array.from(new Set(action.payload.map((s) => s.block)))
    },

    setSpecies(state, action: PayloadAction<Species[]>) {
      state.species = action.payload
      state.taxas = Array.from(new Set(action.payload.map((s) => s.taxa)))
    },

    reset(state) {
      state.selectedSite = null
      state.selectedBlock = null
      state.selectedTaxa = null
      state.selectedSpecies = null
    },

    setObservedSpecies(state, action: PayloadAction<ObservedSpecies[]>) {
      state.observedSpecies = action.payload
    },
  },
})

const {
  setMode,
  setSites,
  setSpecies,
  setSelectedSite,
  setSelectedBlock,
  setSelectedTaxa,
  setSelectedSpecies,
  setStats,
  setTimeseries,
  reset,
  setObservedSpecies,
} = mapSlice.actions

function updateQuery() {
  console.log('update qeury')
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { selectedBlock, selectedSite, selectedTaxa, selectedSpecies } =
      getState().map
    const params = {
      block: selectedBlock ?? undefined,
      siteCode: selectedSite ?? undefined,
      taxa: selectedTaxa ?? undefined,
      commonName: selectedSpecies ?? undefined,
    }
    console.log('update query: ', params)

    getObservationsOverview(params)
      .then((statsData) => {
        const total = statsData.observationCount
        dispatch(
          setStats({
            total,
            nativeCount: statsData.nativeSpeciesCount,
            nonNativeCount:
              statsData.speciesCount - statsData.nativeSpeciesCount,
            countByTaxa: statsData.countByTaxa,
          }),
        )
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err)
      })
    getObservationsTimeseries(params).then((res) => {
      dispatch(setTimeseries(res.series))
    })

    getObservedSpecies(params).then((species) =>
      dispatch(setObservedSpecies(species)),
    )
  }
}

export function init() {
  return (dispatch: AppDispatch) => {
    getSiteList().then((sites) => dispatch(setSites(sites)))
    getSpeciesList().then((species) => dispatch(setSpecies(species)))
    dispatch(updateQuery())
  }
}

export function updateMode(mode: 'site' | 'block') {
  return (dispatch: AppDispatch) => {
    dispatch(setMode(mode))
    dispatch(updateQuery())
  }
}

export function updateSelectedSite(site: string | null) {
  return (dispatch: AppDispatch) => {
    dispatch(setSelectedSite(site))
    dispatch(updateQuery())
  }
}

export function updateSelectedBlock(block: string | null) {
  return (dispatch: AppDispatch) => {
    dispatch(setSelectedBlock(block))
    dispatch(updateQuery())
  }
}

export function updateSelectedTaxa(taxa: string | null) {
  return (dispatch: AppDispatch) => {
    dispatch(setSelectedTaxa(taxa === 'all' ? null : taxa))
    dispatch(updateQuery())
  }
}

export function updateSelectedSpecies(species: string | null) {
  return (dispatch: AppDispatch) => {
    dispatch(setSelectedSpecies(species === 'all' ? null : species))
    dispatch(updateQuery())
  }
}

export function resetFilters() {
  return (dispatch: AppDispatch) => {
    dispatch(reset())
    dispatch(updateQuery())
  }
}

export const selectMode = (state: RootState) => state.map.mode
export const selectBlock = (state: RootState) => state.map.selectedBlock
export const selectSite = (state: RootState) => state.map.selectedSite
export const selectCurrentRegion = (state: RootState) =>
  state.map.mode === 'site'
    ? state.map.selectedSite
    : String(state.map.selectedBlock)
export const selectTaxa = (state: RootState) => state.map.selectedTaxa
export const selectSpecies = (state: RootState) => state.map.selectedSpecies
export const selectCountByTaxa = (state: RootState) => state.map.countByTaxa
export const selectTimeSeries = (state: RootState) => state.map.timeseries
export const selectObservedSpecies = (state: RootState) =>
  state.map.observedSpecies

export default mapSlice.reducer
