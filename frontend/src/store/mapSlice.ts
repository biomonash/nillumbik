import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './store'
import { getObservationStats } from '../apis/mapCharts.api'

interface MapState {
  selectedBlock: number | null
  selectedSite: string | null
  selectedTaxa: string | null
  selectedSpecies: string | null
  totalObservations: number
  nativeSpeciesCount: number
  nonNativeSpeciesCount: number
}

const initialState: MapState = {
  selectedSite: null,
  selectedBlock: null,
  selectedTaxa: null,
  selectedSpecies: null,
  totalObservations: 0,
  nativeSpeciesCount: 0,
  nonNativeSpeciesCount: 0,
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
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

    resetFilters(state) {
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

// export function updateSelectedTaxa(site: string | null) {
//   return (dispatch: AppDispatch) => {
//     dispatch(setSelectedSite(site))
//     dispatch(updateQuery())
//   }
// }
export const {
  setSelectedSite,
  setSelectedBlock,
  setSelectedTaxa,
  setSelectedSpecies,
  setStats,
  resetFilters,
} = mapSlice.actions

export default mapSlice.reducer
