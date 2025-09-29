// This component is only used as debugging API request.
// Should be removed later.

import type React from "react";
import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-dev-runtime";
import {
  getObservationsOverview,
  type ObservationOverviewResponse,
} from "../../../apis/stats.api";

const ApiDisplay: React.FC = (): JSX.Element => {
  const [overview, setOverview] = useState<ObservationOverviewResponse | null>(
    null,
  );

  useEffect(() => {
    getObservationsOverview({}).then(setOverview);
  }, []);

  if (overview === null) {
    return <p>Loading</p>;
  }

  const taxaList = Object.keys(overview.countByTaxa).map((key) => (
    <li key={key}>
      {key}: {overview.countByTaxa[key]}
    </li>
  ));
  return (
    <div>
      <p>This is API Debug section, should be removed later</p>
      <p>
        <div>
          <p>Observation count: {overview.observationCount}</p>
          <p>Unique species count: {overview.speciesCount}</p>
          <p>Native species count: {overview.nativeSpeciesCount}</p>
          <p>
            Non-native species count:{" "}
            {overview.speciesCount - overview.nativeSpeciesCount}
          </p>
          <ul>{taxaList}</ul>
        </div>
      </p>
    </div>
  );
};

export default ApiDisplay;
