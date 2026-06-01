import fetcher from '../lib/fetcher'

export type SpeciesResponse = {
  id: number
  scientificName: string
  commonName: string
  native: boolean
  taxa: string
  indicator: boolean
  reportable: boolean
}

export async function getSpeciesList(): Promise<SpeciesResponse[]> {
  const res = await fetcher.get<SpeciesResponse[]>('/species')
  return res.data
}
