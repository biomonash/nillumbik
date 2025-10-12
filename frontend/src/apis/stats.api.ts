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

export type ObservationSitesResponse = {
  sites: SiteResponse[];
};

export type SiteResponse = ObservationStats & {
  siteCode: string;
};

export type DashboardStatsRequest = {
  from: Date;
  to: Date;
};

export type DashboardStatsResponse = ObservationStats & {
  nativeSpeciesCount: number;
  sitesCount: number;
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

export async function getObservationsSites(
  req: Partial<ObservationStatsRequest>,
): Promise<ObservationSitesResponse> {
  const response = await fetcher.get<ObservationSitesResponse>(
    "/stats/observations/sites",
    {
      params: req,
    },
  );
  return response.data;
}

export async function getDashboardStats(
  req: Partial<DashboardStatsRequest>,
): Promise<DashboardStatsResponse> {
  const response = await fetcher.get<DashboardStatsResponse>(
    "/stats/dashboard",
    {
      params: req,
    },
  );
  return response.data;
}
