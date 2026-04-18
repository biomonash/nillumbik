import { type Species } from "../data/species";
import SpeciesCard from "../../../components/ui/SpeciesCard";

interface SpeciesSidebarProps {
    zoneName: string;
    species: Species[];
    onClose: () => void;
}

export default function SpeciesSidebar({zoneName, species,onClose}: SpeciesSidebarProps) {
    return (
        <div 
        style={{
            position: "fixed",
            top: 0,
            left: "80px",
            width: "320px",
            height: "100vh",
            backgroundColor: "white",
            zIndex: 1000,
            overflowY: "auto",
        }}
        >
            {/* Header */}
            <div style={{
                padding: "16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "white",
            }}
            >
                <div>
                    <h2 style={{fontWeight:"bold", fontSize:"16px", margin:0, color: "black"}}>
                        {zoneName}
                    </h2>
                    <p style={{fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0"}}>
                        Wildlife species recorded in this zone
                    </p>
                    <p style={{fontSize: "12px", color:"#6b7280", margin: "4px 0 0 0" }}>
                        {species.length} Species Found
                    </p>
                </div>
                <button
                onClick={onClose}
                style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#6b7280",
                }}>
                    x
                </button>
            </div>

            {/* Species Cards */}
            <div style={{padding: "16px", display: "flex", flexDirection: "column", gap: "16px"}}>
                {species.map((s) => (
                    <SpeciesCard key={s.id} species={s} />
                ))}
            </div>
        </div>
    );
}