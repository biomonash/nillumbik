import React, { useEffect, useRef, useState, type JSX } from "react";
import Select from "../../components/ui/Select";
import Search from "../../components/ui/Search";
import styles from "./Gallery.module.scss";

interface GalleryItems {
    id: number;
    commonName: string;
    scientificName: string;
    taxa: string;
    species: string;
    native: "Native" | "Non-native";
}


// Mock data for demonstration purposes 
// TODO: Replace with API data fetching from the csv 
const mockData: GalleryItems[] = [
    {
        id: 1,
        commonName: "Eastern Grey Kangaroo",
        scientificName: "Macropus giganteus",
        taxa: "Mammals",
        species: "Kangaroo",
        native: "Native",
    },
    {
        id: 2,
        commonName: "Superb Fairywren",
        scientificName: "Malurus cyaneus",
        taxa: "Birds",
        species: "Fairywren",
        native: "Native",
    },
    {
        id: 3,
        commonName: "Eastern Brown Snake",
        scientificName: "Pseudonaja textilis",
        taxa: "Reptiles",
        species: "Brown Snake",
        native: "Native",
    },
    // Created by AI for demonstration
];

const Gallery: React.FC = (): JSX.Element => {

    // State for Search and Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [taxaFilter, setTaxaFilter] = useState("");
    const [speciesFilter, setSpeciesFilter] = useState("");
    const [nativeFilter, setNativeFilter] = useState("");

    const [filteredItems, setFilteredItems] = useState<GalleryItems[]>(mockData); // Initially show all items

    /**
     * Refs for Search and Select components.
     * Using `forwardRef` in the child components(select & search) allows the parent (Gallery)
     * to directly access internal DOM nodes to:
     * 1. Focus elements programmatically  (useful for accessibility and UX)
     * 2. Clear input values (direct DOM manipulation)
     * 
     * Extra: Measure position for dropdown placement(.getBoundingClientRect) (e.g., open upwards if near bottom of viewport) - not shown here
     */
    const searchRef = useRef<HTMLInputElement>(null); // Clear input value on "Clear All"
    const taxaRef = useRef<HTMLDivElement>(null); // Can be used to measure position (dropdown menu)
    const speciesRef = useRef<HTMLDivElement>(null);
    const nativeRef = useRef<HTMLDivElement>(null);

    const taxaOptions = [
        { value: "Mammals", label: "Mammals" },
        { value: "Birds", label: "Birds" },
        { value: "Reptiles", label: "Reptiles" },
    ];

    /* Generate species options dynamically from mockData */
    const speciesOptions = mockData.map((item) => ({
        value: item.species,
        label: `${item.commonName} (${item.scientificName})`,
    }));

    const nativeOptions = [
        { value: "Native", label: "Native" },
        { value: "Non-native", label: "Non-native" },
    ];


    // Filter logic - runs whenever searchQuery or any filter changes
    useEffect(() => {
        let filtered = mockData;

        // Apply search filter (names only)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.commonName.toLowerCase().includes(query) ||
                    item.scientificName.toLowerCase().includes(query)
            );
        }

        // Apply taxa filter
        if (taxaFilter) {
            filtered = filtered.filter((item) => item.taxa === taxaFilter);
        }
        // Apply species filter
        if (speciesFilter) {
            filtered = filtered.filter((item) => item.species === speciesFilter);
        }

        // Apply native filter
        if (nativeFilter) {
            filtered = filtered.filter((item) => item.native === nativeFilter);
        }

        setFilteredItems(filtered);
    }, [searchQuery, taxaFilter, speciesFilter, nativeFilter]);

    // Use Case for forwardRef with Search component
    // Clears search input and resets searchQuery state
    const handleClearAll = () => {
        setSearchQuery("");
        setNativeFilter("");
        setSpeciesFilter("");
        setTaxaFilter("");

        if (searchRef.current) {
            searchRef.current.value = ""; // 1.  Directly clearing input via ref
            searchRef.current.focus();    // 2.  Focus input after clearing
        } // Direct DOM manipulation using .current() with forwardRef
    };

    // Clear Select Filters only
    const handleClearFilters = () => {
        setNativeFilter("");
        setSpeciesFilter("");
        setTaxaFilter("");
        setTimeout(() => taxaRef.current?.focus(), 50); // Focus first Select after clearing filters
    };

    // Use case - determines dropdown direction based on viewport space - not demonstrated in UI
    // uses getting bounding rect of Select component via its ref
    // to decide whether to open dropdown upwards or downwards
    // Can be implemented with Popper js as well (requires setup)

    return (
        <section className={styles.galleryContainer}>
            <h1 className={styles.title}>Gallery</h1>

            {/* Search Bar - Row 1 */}
            <div className={styles.searchRow}>
                <Search
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by common or scientific name..."
                    onClear={() => {
                        setSearchQuery("");
                        if (searchRef.current) searchRef.current.value = "";   // requires forwardRef to access internal input to clear value
                    }}
                />
            </div>

            {/* Filters - Row 2 */}
            <div className={styles.filtersRow}>
                <Select
                    ref={taxaRef}
                    options={taxaOptions}
                    value={taxaFilter}
                    onChange={setTaxaFilter}
                    placeholder="Filter by Taxa"
                />
                <Select
                    ref={speciesRef}
                    options={speciesOptions}
                    value={speciesFilter}
                    onChange={setSpeciesFilter}
                    placeholder="Filter by Species"
                />
                <Select
                    ref={nativeRef}
                    options={nativeOptions}
                    value={nativeFilter}
                    onChange={setNativeFilter}
                    placeholder="Filter by Native Status"
                />
            </div>

            {/* Action Buttons - Row 3 */}
            <div className={styles.actionsRow}>
                <button className={styles.clearFiltersButton} onClick={handleClearFilters}>
                    Clear Filters
                </button>
                {(searchQuery) && (
                    <button className={styles.clearAllButton} onClick={handleClearAll}>
                        Clear All
                    </button>
                )}
            </div>
            {/* Results [Example] */}
            <div className={styles.resultsGrid}>
                {filteredItems.length === 0 && <p>No results found.</p>}

                {filteredItems.map((item) => (
                    <div key={item.id} className={styles.resultCard}>
                        <h3>{item.commonName}</h3>
                        <p>
                            <i>{item.scientificName}</i>
                        </p>
                        <p>Taxa: {item.taxa}</p>
                        <p>Status: {item.native}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Gallery;
