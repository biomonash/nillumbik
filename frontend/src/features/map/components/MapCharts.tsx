import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";


interface Species {
  id: number;
  commonName: string;
  scientificName: string;
  taxa: string;
  indicator: boolean;
  native: boolean;
  reportable: boolean;
}

const MapCharts: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedTaxa, setSelectedTaxa] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");

  const [taxaOptions, setTaxaOptions] = useState<{ value: string; label: string }[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<{ value: string; label: string }[]>([]);
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);

  const [nativeCount, setNativeCount] = useState(0);
  const [nonNativeCount, setNonNativeCount] = useState(0);

  // Fetch species from API 
  useEffect(() => {
    fetch("http://localhost:8000/species")
      .then((res) => res.json())
      .then((data: Species[]) => {
        setAllSpecies(data);

        // Get unique taxa
        const uniqueTaxa = Array.from(
          new Map(data.map((item) => [item.taxa, { value: item.taxa, label: item.taxa }])).values()
        );

        setTaxaOptions(uniqueTaxa);
      })
      .catch((err) => console.error("Failed to fetch species:", err));
  }, []);

  // Update species options when taxa changes
  useEffect(() => {
    if (!selectedTaxa) {
      setSpeciesOptions([]);
      return;
    }

    const filteredSpecies = allSpecies
      .filter((s) => s.taxa === selectedTaxa)
      .map((s) => ({
        value: s.id.toString(),
        label: s.commonName || s.scientificName,
      }));

    setSpeciesOptions(filteredSpecies);
    setSelectedSpecies("");
  }, [selectedTaxa, allSpecies]);


  useEffect(() => {
    if (!selectedZone) {
      setNativeCount(0);
      setNonNativeCount(0);
      return;
    }

    fetch(`http://localhost:8000/stats/observations/sites?zone=${selectedZone}`)
      .then(res => res.json())
      .then((data: any) => {
        let native = 0;
        let nonNative = 0;

        // Count native vs non-native species
        data.sites.forEach((site: any) => {
          site.species.forEach((s: any) => {
            if (s.native) native++;
            else nonNative++;
          });
        });

        setNativeCount(native);
        setNonNativeCount(nonNative);
      })
      .catch(err => console.error("Failed to fetch species stats:", err));
  }, [selectedZone]);



  return (
    <div className="fixed top-10  right-0 h-screen w-[300px] bg-[var(--muted-foreground2)] z-50 p-4 flex flex-col">
      {/* Title part and download data */}
      <div className="flex justify-between items-center mb-6 mt-5">
        <h1 className="text-black text-xl font-semibold">Zone Filter🔎</h1>
        <button className="bg-[#689C5E] hover:bg-[#A1A1A1] text-white font-bold py-2 px-4 rounded-3xl text-sm">
          Download Data
        </button>
      </div>

      {/* Selects outer wrapper */}
      <div className="flex flex-col gap-4 w-full">
        {/*  Select for Zone */}
        <div className="flex flex-col w-full">
          <span className="text-sm font-medium mb-1 text-black">Zone</span>
          <Select
            options={[
              { value: "Zone 1", label: "Zone 1" },
              { value: "Zone 2", label: "Zone 2" },
              { value: "Zone 3", label: "Zone 3" },
              { value: "Zone 4", label: "Zone 4" },
            ]}
            value={selectedZone}
            onChange={setSelectedZone}
            placeholder="Select Zone"
            className="w-full"
          />
        </div>

        {/* Taxa Select */}
        <div className="flex flex-col w-full">
          <span className="text-sm font-medium mb-1 text-black">Taxa</span>
          <Select
            options={taxaOptions}
            value={selectedTaxa}
            onChange={setSelectedTaxa}
            placeholder="Select Taxa"
            className="w-full"
          />
        </div>

        {/* Species Select */}
        <div className="flex flex-col w-full">
          <span className="text-sm font-medium mb-1 text-black">Species</span>
          <Select
            options={speciesOptions}
            value={selectedSpecies}
            onChange={setSelectedSpecies}
            placeholder="Select Species"
            disabled={!selectedTaxa}
            className="w-full"
          />
        </div>
      </div>

      {/* Display selected zone specific info */}
      <h1 className="text-black text-xl font-semibold mt-6">{selectedZone ? selectedZone : "Zone"}</h1>

      <div className="mb-4 flex flex-col w-full">
        <span className="text-sm font-medium mb-1 text-black">Total Species in this Zone: </span>
        <input
          type="text"
          readOnly
          value={"Total: "}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
        />
      </div>

      <div className="mt-4">
        <h2 className=" font-large text-center mb-1 text-black">Distribution</h2>
        <table className="w-full text-center border-black-800 rounded-lg">
          <thead>
            <tr className="bg-[#9BD990] text-black">
              <th className="border px-2 py-1">Native</th>
              <th className="border px-2 py-1">Non-Native</th>
            </tr>
          </thead>
          <tbody className="text-black">
            <tr >
              <td className="border px-2 py-1">{nativeCount}</td>
              <td className="border px-2 py-1">{nonNativeCount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

      </div>
    </div>


  );
};

export default MapCharts;