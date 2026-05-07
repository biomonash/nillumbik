import fetcher from '../lib/fetcher'
import { getObservationSites } from './mapCharts.api'

type RawObservedSpecies = {
    id: number
    common_name: string
    scientific_name: string
    observation_count: number
}

export type Species = {
    id: number
    commonName: string
    scientificName: string
    native: boolean
    indicator: boolean
    taxa: string
    image?: string // placeholder for now
}

// fetch full detail for a single species
async function getSpeciesById(id: number): Promise<Species> {
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

export async function getSpeciesDetailBySite(
    siteCode: string,
): Promise<Species[]> {
    // fetch species are observed at this site
    const observed = await fetcher.get<{
        species: RawObservedSpecies[]
        total: number
    }>('/species/observed', { params: { siteCode , from: new Date('2020-01-01')} })
    const details = await Promise.all(
        observed.data.species.map((s) => getSpeciesById(s.id)),
    )

    return details
}

export async function getSpeciesDetailByBlock(
    block: number,
): Promise<Species[]> {
    const sitesData = await getObservationSites({ block })

    const observedResults = await Promise.all(
        sitesData.sites.map((site) =>
            fetcher.get<{
                species: RawObservedSpecies[]
                total: number
            }>('/species/observed', {
                params: { siteCode: site.siteCode , from: new Date('2020-01-01')},
            }),
        ),
    )


    const uniqueSpeciesIds = [
        ...new Set(
            observedResults.flatMap((result) =>
                result.data.species.map((species) => species.id),
            ),
        ),
    ]
    console.log('Unique species IDs:', uniqueSpeciesIds.length)

    const details = await Promise.all(
        uniqueSpeciesIds.map((id) => getSpeciesById(id)),
    )
    console.log('Final details count:', details.length,)

    return [
        ...new Map(details.map((species) => [species.id, species])).values(),
    ]
}

/**
 * Extra Documentation for tedious parts, blocks
 * Since the backend does not support: /species/observed?block=
 *
 * block/zone species fetching is handled on the frontend (Can be updated later?).
 *
 * All sites belonging to the selected block are first retrieved,
 * then species observed at each site are fetched and merged together.
 *
 * Duplicate species IDs are removed so the final result represents
 * all unique species found within the selected zone/block.
 */