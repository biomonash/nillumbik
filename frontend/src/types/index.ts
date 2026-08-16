export type Site = {
  code: string
  name: string
  block: number
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
}

export type ObservedSpecies = Species & {
  observationCount: number
}
