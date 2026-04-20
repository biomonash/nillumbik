export type Species = {
  id: number
  commonName: string
  scientificName: string
  native: boolean
  indicator: boolean
  taxa: string
  image: string
}

export const SPECIES: Species[] = [
  {
    id: 1,
    commonName: 'Australasian swamphen',
    scientificName: 'Porphyrio melanotus',
    native: true,
    indicator: false,
    taxa: 'Bird',
    image: 'https://placehold.co/600x400?text=Species+photo',
  },
  {
    id: 2,
    commonName: 'Australian king-parrot',
    scientificName: 'Alisterus scapularis',
    native: true,
    indicator: true,
    taxa: 'Bird',
    image: 'https://placehold.co/600x400?text=Species+photo',
  },
  {
    id: 3,
    commonName: 'Eurasian blackbird',
    scientificName: 'Turdus merula',
    native: false,
    indicator: false,
    taxa: 'Bird',
    image: 'https://placehold.co/600x400?text=Species+photo',
  },
]
