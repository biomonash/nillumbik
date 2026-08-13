import SpeciesCard from '../../../components/ui/SpeciesCard'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import {
  selectCurrentRegion,
  selectObservedSpecies,
  selectSpecies,
  updateSelectedSpecies,
} from '../../../store/mapSlice'

export default function SpeciesSidebar() {
  const dispatch = useAppDispatch()
  const observedSpecies = useAppSelector(selectObservedSpecies)
  const currentRegion = useAppSelector(selectCurrentRegion)
  const selectedSpecies = useAppSelector(selectSpecies)
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="pt-4 fw-bold text-[16px] m-0 text-black">
          {currentRegion?.join(', ') ?? 'All'}
        </h2>

        <p className="text-xs text-gray-500 mt-1 m-0">
          Wildlife species recorded here
        </p>
        <p className="text-xs text-gray-500 mt-1 m-0">
          {observedSpecies.length} Species Found
        </p>
      </div>

      {/* Species Cards */}
      <div className="text-[16px] m-2 flex flex-col gap-4">
        <div className="text-[16px] m-2 flex flex-col gap-4">
          {observedSpecies.map((s) => (
            <div
              key={s.id}
              onClick={() =>
                dispatch(
                  updateSelectedSpecies(
                    selectedSpecies === s.commonName ? null : s.commonName,
                  ),
                )
              }
              className={[
                'cursor-pointer rounded-lg transition-all duration-150',
                'hover:ring-2 hover:ring-[var(--button)]/50 hover:scale-101',
                selectedSpecies === s.commonName
                  ? // ? 'ring-2 ring-[#216869]'
                    'bg-[var(--button)]/25 ring-2 ring-[var(--button)] '
                  : '',
              ].join(' ')}
            >
              <SpeciesCard species={s} observationCount={s.observationCount} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
