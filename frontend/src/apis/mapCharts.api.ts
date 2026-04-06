import fetcher from "../lib/fetcher";
import type { ObservationStatsRequest } from "./stats.api";
// Req:
// Zone | Taxa | Species | Total per Zone | Native/Non Native observed species per zone/taxa
// Zone = Block, each zone has sites
// /stats/observations/blocks -> total observation count 
// native/non-native species

export type BlockStat = {
    block: number;           // "Zone" ID
    observationCount: number;
    speciesCount: number;
};

export type GetObservationBlocksResponse = {
    blocks: BlockStat[];
};

export type GetObservationStatsResponse = {
    countByTaxa: Record<string, string>;  // keys = unique taxa names
    nativeSpeciesCount: number;
    observationCount: number;
    speciesCount: number;
};

export type Species = {
    commonName: string;
    id: number;
    indicator: boolean;
    native: boolean;
    reportable: boolean;
    scientificName: string;
    taxa: string;
};

export type ChartInput = { value: string; label: string };


export async function getObservationBlocks(
  params: Partial<ObservationStatsRequest> = {}
): Promise<GetObservationBlocksResponse> {
  const response = await fetcher.get<GetObservationBlocksResponse>("/stats/observations/blocks", { params });
  return response.data;
}

export async function getObservationStats(
  params: Partial<ObservationStatsRequest> = {}
): Promise<GetObservationStatsResponse> {
  const response = await fetcher.get<GetObservationStatsResponse>("/stats/observations", { params });
  return response.data;
}

export async function getAllSpecies(): Promise<Species[]> {
  const response = await fetcher.get<Species[]>("/species");
  return response.data;
}
