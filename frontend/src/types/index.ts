export type Site = {
  code: string
  name: string
  block: number
  tenure: 'Public' | 'Private'
}

export type Species = {
  id: number
  commonName: string
  scientificName: string
  native: boolean
  indicator: boolean
  taxa: string
  images: string[]
  iucnStatus: string | null
  tenure: 'Public' | 'Private'
}

export type ObservedSpecies = Species & {
  observationCount: number
}
