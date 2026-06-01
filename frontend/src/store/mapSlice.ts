import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './store'
import { getObservationStats } from '../apis/mapCharts.api'
import {
  getObservationsTimeseries,
  type TimeseriesPoint,
} from '../apis/stats.api'

interface MapState {
  mode: 'block' | 'site'
  selectedBlock: number | null
  selectedSite: string | null
  selectedTaxa: string | null
  selectedSpecies: string | null
  totalObservations: number
  nativeSpeciesCount: number
  nonNativeSpeciesCount: number
  timeseries: Record<string, TimeseriesPoint[]>
}

const initialState: MapState = {
  mode: 'site',
  selectedSite: null,
  selectedBlock: null,
  selectedTaxa: null,
  selectedSpecies: null,
  totalObservations: 0,
  nativeSpeciesCount: 0,
  nonNativeSpeciesCount: 0,
  timeseries: {},
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
      state.selectedBlock = null
      state.selectedSite = action.payload
    },
    setSelectedBlock(state, action: PayloadAction<string | null>) {
      state.selectedBlock = Number(action.payload)
      state.selectedSite = null
    },
    setSelectedTaxa(state, action: PayloadAction<string | null>) {
      state.selectedTaxa = action.payload
      state.selectedSpecies = ''
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
      }>,
    ) {
      const { total, nativeCount, nonNativeCount } = action.payload
      state.totalObservations = total
      state.nativeSpeciesCount = nativeCount
      state.nonNativeSpeciesCount = nonNativeCount
    },

    reset(state) {
      state.selectedSite = null
      state.selectedBlock = null
      state.selectedTaxa = null
      state.selectedSpecies = null
    },
  },
})

const DEFAULT_FROM = new Date('2020-01-01')

function updateQuery() {
  console.log('update qeury')
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { selectedBlock, selectedSite, selectedTaxa, selectedSpecies } =
      getState().map
    const params = {
      from: DEFAULT_FROM,
      block: selectedBlock ?? undefined,
      siteCode: selectedSite ?? undefined,
      taxa: selectedTaxa ?? undefined,
      commonName: selectedSpecies ?? undefined,
    }
    console.log('update query: ', params)

    getObservationStats(params)
      .then((statsData) => {
        const total = statsData.observationCount
        dispatch(
          setStats({
            total,
            nativeCount: statsData.nativeSpeciesCount,
            nonNativeCount:
              statsData.speciesCount - statsData.nativeSpeciesCount,
          }),
        )
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err)
      })
    getObservationsTimeseries(params).then((res) => {
      dispatch(setTimeseries(res.series))
    })
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

export function resetFilters() {
  return (dispatch: AppDispatch) => {
    dispatch(reset())
    dispatch(updateQuery())
  }
}

// export function updateSelectedTaxa(site: string | null) {
//   return (dispatch: AppDispatch) => {
//     dispatch(setSelectedSite(site))
//     dispatch(updateQuery())
//   }
// }

const {
  setMode,
  setSelectedSite,
  setSelectedBlock,
  setSelectedTaxa,
  setSelectedSpecies,
  setStats,
  setTimeseries,
  reset,
} = mapSlice.actions

export const selectTimeSeries = (state: RootState) => state.map.timeseries

export const selectSpecies = (state: RootState) => state.map.selectedSpecies

export const selectMode = (state: RootState) => state.map.mode

export default mapSlice.reducer
