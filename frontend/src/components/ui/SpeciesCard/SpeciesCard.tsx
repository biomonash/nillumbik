import { Card, CardContent } from '../Card'
import Badge from '../Badge'
import { type ObservedSpecies } from '../../../types'
import { API_BASE_URL } from '../../../constants/api'

interface SpeciesCardProps {
  species: ObservedSpecies
  observationCount?: number
}

function iucnBadgeColor(status: string) {
  switch (status) {
    case 'LC':
      return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
    case 'NT':
      return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' }
    case 'VU':
      return { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' }
    case 'EN':
      return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
    case 'CR':
      return { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' }
    case 'EW':
    case 'EX':
      return { bg: '#1f2937', text: '#f9fafb', border: '#374151' }
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }
  }
}

export default function SpeciesCard({
  species,
  observationCount,
}: SpeciesCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Species Photo */}
      {species.images.map((filename) => (
        <img
          src={`${API_BASE_URL}/images/species/${filename}`}
          alt={species.commonName}
          className="w-full object-cover mb-2"
        />
      ))}
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
        {/* IUCN Status badge */}
        {species.iucnStatus && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs italic text-gray-500 mb-0">
              IUCN Status
            </span>
            <Badge
              style={{
                backgroundColor: iucnBadgeColor(species.iucnStatus).bg,
                color: iucnBadgeColor(species.iucnStatus).text,
                border: `1px solid ${iucnBadgeColor(species.iucnStatus).border}`,
              }}
            >
              {species.iucnStatus}
            </Badge>
          </div>
        )}
        {observationCount && (
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-gray-900">
              {`${observationCount}`} observations
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
