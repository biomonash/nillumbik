import React, { type JSX } from "react";
import LineChart from "./components/LineChart";

import { dumbData } from "./constants/dumbData";

const Dashboard: React.FC = (): JSX.Element => {
  console.log(dumbData);
  return (
    <section>
      Dashboard Page
      <LineChart />
    </section>
  );
};

export default Dashboard;
