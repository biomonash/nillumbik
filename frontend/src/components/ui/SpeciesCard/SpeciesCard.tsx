import {Card, CardContent} from "../Card";
import Badge from "../Badge";
import { type Species } from "../../../features/map/data/species";

interface SpeciesCardProps {
    species: Species;
}

export default function SpeciesCard({species}: SpeciesCardProps) {
    return (
        <Card className="overflow-hidden">
            {/* Species Photo */}
            <img
                src={species.image}
                alt={species.commonName}
                className="w-full h-48 object-cover"
                />
            <CardContent className="p-4">
                {/* Common Name and Native/Non-native Badge*/}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm">{species.commonName}</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        {species.native ? "Native" : "Non-native"}
                    </Badge>
                </div>

                {/* Scientific Name */}
                <p className="text-xs italic text-gray-500 mb-2">
                    {species.scientificName}
                </p>

                {/* Indicator badge - only shows if indicator is true */}
                {species.indicator && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Indicator
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}