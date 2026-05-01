import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface MapState {
    selectedSite: string | null
}

const initialState: MapState = {
selectedSite: null
}

const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setSelectedSite(state, action: PayloadAction<string | null>) {
            state.selectedSite = action.payload
        },
    },
})

export const { setSelectedSite } = mapSlice.actions
export default mapSlice.reducer