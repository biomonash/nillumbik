import fetcher from '../lib/fetcher'
import type { Species, ObservedSpecies } from '../types'
import type { ObservationStatsRequest } from './stats.api'

export async function getSpeciesList(): Promise<Species[]> {
  const res = await fetcher.get<Species[]>('/species')
  return res.data
}

// fetch full detail for a single species
export async function getSpeciesById(id: number): Promise<Species> {
  const response = await fetcher.get<{
    id: number
    commonName: string
    scientificName: string
    native: boolean
    indicator: boolean
    taxa: string
  }>(`/species/${id}`)

  return {
    ...response.data,
    image: undefined, // change to real URL when available
  }
}

export async function getObservedSpecies(
  req: Partial<ObservationStatsRequest>,
): Promise<ObservedSpecies[]> {
  // fetch species are observed at this site
  const observed = await fetcher.get<{
    species: ObservedSpecies[]
    total: number
  }>('/species/observed', {
    params: req,
  })

  return observed.data.species
}
