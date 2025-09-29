import fetcher from "../lib/fetcher";

export type ObservationStatsRequest = {
  from: Date;
  to: Date;
  block: number;
  siteCode: string;
  taxa: string;
  commonName: string;
};

export type ObservationOverviewResponse = ObservationStats & {
  nativeSpeciesCount: number;
  countByTaxa: Record<string, string>;
};

export type ObservationTimeseriesResponse = {
  series: Record<string, TimeseriesPoint[]>;
};

export type TimeseriesPoint = ObservationStats & {
  timestamp: string;
};

export type ObservationStats = {
  observationCount: number;
  speciesCount: number;
};

export type ObservationBlocksResponse = {
  blocks: BlockResponse[];
};

export type BlockResponse = ObservationStats & {
  block: number;
};

export async function getObservationsOverview(
  req: Partial<ObservationStatsRequest>,
): Promise<ObservationOverviewResponse> {
  const response = await fetcher.get<ObservationOverviewResponse>(
    "/stats/observations",
    {
      params: req,
    },
  );
  return response.data;
}

export async function getObservationsTimeseries(
  req: Partial<ObservationStatsRequest>,
): Promise<ObservationTimeseriesResponse> {
  const response = await fetcher.get<ObservationTimeseriesResponse>(
    "/stats/observations/timeseries",
    {
      params: req,
    },
  );
  return response.data;
}

export async function getObservationsBlocks(
  req: Partial<ObservationStatsRequest>,
): Promise<ObservationBlocksResponse> {
  const response = await fetcher.get<ObservationBlocksResponse>(
    "/stats/observations/blocks",
    {
      params: req,
    },
  );
  return response.data;
}
