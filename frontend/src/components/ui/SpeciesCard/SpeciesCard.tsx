import { Card, CardContent } from '../Card'
import Badge from '../Badge'
import { type Species } from '../../../apis/speciesList.api'

interface SpeciesCardProps {
  species: Species
}

export default function SpeciesCard({ species }: SpeciesCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Species Photo */}
      <img
        src={species.image ?? 'https://placehold.co/600x400?text=Species+photo'} //placeholder
        alt={species.commonName}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        {/* Common Name and Native/Non-native Badge*/}
        <div className="flex items-center justify-between gap-2 mb-3 mt-4">
          <span className="font-semibold text-sm text-gray-900">
            {species.commonName}
          </span>
          <Badge
            style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              border: '1px solid #bbf7d0',
            }}
          >
            {species.native ? 'Native' : 'Non-native'}
          </Badge>
        </div>

        {/* Scientific Name and Indicator tag*/}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs italic text-gray-500 mb-0">
            {species.scientificName}
          </p>
          {species.indicator && (
            <Badge
              style={{
                backgroundColor: '#f3e8ff',
                color: '#6b21a8',
                border: '1px solid #e9d5ff',
              }}
            >
              Indicator
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
