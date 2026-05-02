import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface MapState {
  selectedSite: string | null
  selectedZone: string
  selectedTaxa: string
  selectedSpecies: string
}

const initialState: MapState = {
  selectedSite: null,
  selectedZone: 'all',
  selectedTaxa: 'all',
  selectedSpecies: '',
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setSelectedSite(state, action: PayloadAction<string | null>) {
      state.selectedSite = action.payload
    },
    setSelectedZone(state, action: PayloadAction<string>) {
      state.selectedZone = action.payload
      state.selectedSite = null
    },
    setSelectedTaxa(state, action: PayloadAction<string>) {
      state.selectedTaxa = action.payload
      state.selectedSpecies = ''
    },
    setSelectedSpecies(state, action: PayloadAction<string>) {
      state.selectedSpecies = action.payload
    },
    resetFilters(state) {
      state.selectedSite = null
      state.selectedZone = 'all'
      state.selectedTaxa = 'all'
      state.selectedSpecies = ''
    },
  },
})

export const {
  setSelectedSite,
  setSelectedZone,
  setSelectedTaxa,
  setSelectedSpecies,
  resetFilters,
} = mapSlice.actions
export default mapSlice.reducer
