import SpeciesCard from '../../../components/ui/SpeciesCard'
import { useAppSelector } from '../../../hooks/redux'
import {
  selectCurrentRegion,
  selectObservedSpecies,
} from '../../../store/mapSlice'

export default function SpeciesSidebar() {
  const observedSpecies = useAppSelector(selectObservedSpecies)
  const currentRegion = useAppSelector(selectCurrentRegion)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="pt-4 md:pt-12 fw-bold text-[16px] m-0 text-black">
          {currentRegion ?? 'All'}
        </h2>

        <p className="text-xs text-gray-500 mt-1 m-0">
          Wildlife species recorded here
        </p>
        <p className="text-xs text-gray-500 mt-1 m-0">
          {observedSpecies.length} Species Found
        </p>
      </div>

      {/* Species Cards */}
      <div className="text-[16px] flex p-16 flex-col gap-4">
        {observedSpecies.map((s) => (
          <SpeciesCard
            key={s.id}
            species={s}
            observationCount={s.observationCount}
          />
        ))}
      </div>
    </div>
  )
}
