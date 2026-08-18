import { useCallback, useEffect, useRef, useState } from 'react'
import SpeciesProfile from '../../../components/ui/SpeciesProfile'
import type { ObservedSpecies } from '../../../types'

type WildLifeCarouselProps = {
  species: ObservedSpecies[]
}

export default function WildLifeCarousel({ species }: WildLifeCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollerRef.current
    if (!el) return

    el.addEventListener('scroll', updateScrollState, { passive: true })
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [updateScrollState, species])

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="w-full min-w-0 bg-[#e8f0dc] px-5 py-6 sm:px-8 sm:py-8">
      <h1 className=" font-bold mb-5 sm:mb-6 text-2xl py-2">
        Explore Wildlife
      </h1>

      <div className="relative min-w-0 pt-4">
        <div
          ref={scrollerRef}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden
                     snap-x snap-mandatory scroll-smooth
                     [scrollbar-width:none] [-ms-overflow-style:none]
                     "
        >
          <div className="flex gap-5 sm:gap-8 pr-14 pb-2">
            {species.map((s) => (
              <div key={s.id} className="snap-start">
                <SpeciesProfile species={s} />
              </div>
            ))}
          </div>
        </div>

        {canScrollRight && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-20
                         bg-gradient-to-l from-[#e8f0dc] via-[#e8f0dc]/80 to-transparent"
            />
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              aria-label="Scroll right"
              className="absolute right-1 top-1/2 -translate-y-1/2
                         w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
                         rounded-full bg-white shadow-md text-[#1f2421]
                         transition-transform hover:scale-105 active:scale-95
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount('left')}
            aria-label="Scroll left"
            className="absolute left-1 top-1/2 -translate-y-1/2
                       w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
                       rounded-full bg-white shadow-md text-[#1f2421]
                       transition-transform hover:scale-105 active:scale-95
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </section>
  )
}
