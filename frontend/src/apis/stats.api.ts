import fetcher from "../lib/fetcher";

export type ObservationStatsRequest = {
  from: Date;
  to: Date;
  block: number;
  siteCode: string;
  taxa: string;
  commonName: string;
};

export type ObservationOverviewResponse = {
  observationCount: number;
  speciesCount: number;
  nativeSpeciesCount: number;
  countByTaxa: Record<string, string>;
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
