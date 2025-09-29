// This component is only used as debugging API request.
// Should be removed later.

import type React from "react";
import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-dev-runtime";
import {
  getObservationsOverview,
  getObservationsTimeseries,
  type ObservationStatsRequest,
  type ObservationOverviewResponse,
  type ObservationTimeseriesResponse,
  type ObservationBlocksResponse,
  getObservationsBlocks,
} from "../../../apis/stats.api";

const ApiDisplay: React.FC = (): JSX.Element => {
  const [filter] = useState<Partial<ObservationStatsRequest>>({});
  const [overview, setOverview] = useState<ObservationOverviewResponse | null>(
    null,
  );
  const [timeseries, setTimeseries] =
    useState<ObservationTimeseriesResponse | null>(null);
  const [blocks, setBlocks] = useState<ObservationBlocksResponse | null>(null);

  useEffect(() => {
    getObservationsOverview(filter).then(setOverview);
    getObservationsTimeseries(filter).then(setTimeseries);
    getObservationsBlocks(filter).then(setBlocks);
  }, [filter]);

  if (overview === null || timeseries === null || blocks === null) {
    return <p>Loading</p>;
  }

  const taxaList = Object.keys(overview.countByTaxa).map((key) => (
    <li key={key}>
      {key}: {overview.countByTaxa[key]}
    </li>
  ));

  const timeseriesList = Object.keys(timeseries.series).map((key) => (
    <div key={key}>
      <p>{key}</p>
      <ul>
        {timeseries.series[key].map(
          ({ timestamp, observationCount, speciesCount }) => (
            <li key={timestamp}>
              {timestamp}: Observations: {observationCount}. Species:{" "}
              {speciesCount}
            </li>
          ),
        )}
      </ul>
    </div>
  ));

  const blockList = blocks?.blocks.map(
    ({ block, observationCount, speciesCount }) => (
      <li key={block}>
        Block {block}: Observations: {observationCount}, species: {speciesCount}
      </li>
    ),
  );

  return (
    <div>
      <h1>API Debugger</h1>
      <p>This is API Debug section, should be removed later</p>
      <div>
        <h2>Overview</h2>
        <p>Observation count: {overview.observationCount}</p>
        <p>Unique species count: {overview.speciesCount}</p>
        <p>Native species count: {overview.nativeSpeciesCount}</p>
        <p>
          Non-native species count:{" "}
          {overview.speciesCount - overview.nativeSpeciesCount}
        </p>
        <ul>{taxaList}</ul>
      </div>
      <div>
        <h2>Timeseries</h2>
        {timeseriesList}
      </div>
      <div>
        <h2>Blocks</h2>
        <ul>{blockList}</ul>
      </div>
    </div>
  );
};

export default ApiDisplay;
