import { Badge } from '@mantine/core'
import { API_BASE_URL } from '../../../constants/api'
import type { ObservedSpecies } from '../../../types'

type SpeciesProfileProps = {
  species: ObservedSpecies
}

export default function SpeciesProfile({ species }: SpeciesProfileProps) {
  const image = species.images?.[0]
  const status = (species as { status?: 'native' | 'non-native' }).status

  return (
    <div className="group flex flex-col items-center w-40 sm:w-44 md:w-48 shrink-0 my-2 ml-2">
      <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <div
          className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden
                     bg-grey-accent ring-4 ring-white
                     shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                     transition-shadow duration-300 ease-out
                     group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
        >
          {image ? (
            <img
              src={`${API_BASE_URL}/images/species/${image}`}
              alt={species.commonName}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <i
                className="fa-solid fa-image text-2xl text-gray-400"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {status && (
          <Badge
            variant={status}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap
                       shadow-[0_2px_6px_rgba(0,0,0,0.12)] px-3 py-1 text-[11px] tracking-wide"
          >
            {status === 'native' ? 'Native' : 'Non-native'}
          </Badge>
        )}
      </div>

      <span className="mt-4 max-w-full truncate text-sm font-semibold text-[#1f2421] text-center">
        {species.commonName}
      </span>
    </div>
  )
}
