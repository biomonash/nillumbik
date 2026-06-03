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

export type MapQuery = Partial<{
  block: number
  site: string
  taxa: string
  species: string
}>

interface MapState {
  mode: 'block' | 'site'
  blocks: number[]
  sites: Site[]
  taxas: string[]
  species: Species[]
  query: MapQuery
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
  query: {},
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
      state.query.block = undefined
      state.query.site = undefined
    },
    setQuery(state, action: PayloadAction<MapQuery>) {
      state.query = action.payload
    },
    setSelectedSite(state, action: PayloadAction<string | null>) {
      state.query.site = action.payload ?? undefined
    },
    setSelectedBlock(state, action: PayloadAction<string | null>) {
      state.query.block = action.payload ? Number(action.payload) : undefined
      state.query.site = undefined
    },
    setSelectedTaxa(state, action: PayloadAction<string | null>) {
      state.query.taxa = action.payload ?? undefined
      state.query.species = undefined
    },
    setSelectedSpecies(state, action: PayloadAction<string | null>) {
      state.query.species = action.payload ?? undefined
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
      state.query = {}
    },

    setObservedSpecies(state, action: PayloadAction<ObservedSpecies[]>) {
      state.observedSpecies = action.payload
    },
  },
})

const {
  setMode,
  setQuery,
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
    const { block, site, taxa, species } = getState().map.query
    const params = {
      block,
      siteCode: site,
      taxa,
      commonName: species,
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

export function init(query: MapQuery) {
  return (dispatch: AppDispatch) => {
    dispatch(setQuery(query))
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
export const selectQuery = (state: RootState) => state.map.query
export const selectBlock = (state: RootState) => state.map.query.block
export const selectSite = (state: RootState) => state.map.query.site
export const selectCurrentRegion = (state: RootState): string | undefined =>
  state.map.mode === 'site'
    ? state.map.query.site
    : state.map.query.block
      ? String(state.map.query.block)
      : undefined
export const selectTaxa = (state: RootState) => state.map.query.taxa
export const selectSpecies = (state: RootState) => state.map.query.species
export const selectCountByTaxa = (state: RootState) => state.map.countByTaxa
export const selectTimeSeries = (state: RootState) => state.map.timeseries
export const selectObservedSpecies = (state: RootState) =>
  state.map.observedSpecies

export default mapSlice.reducer
