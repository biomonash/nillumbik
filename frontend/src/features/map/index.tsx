import React, { type JSX } from "react";
import ApiDisplay from "./components/ApiDisplay";

const Map: React.FC = (): JSX.Element => {
  return (
    <section>
      Map Page
      <ApiDisplay />
    </section>
  );
};

export default Map;
