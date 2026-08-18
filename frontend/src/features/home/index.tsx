import { Container } from '@mantine/core'
import React, { useEffect, type JSX } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { init, selectObservedSpecies } from '../../store/mapSlice'
import WildLifeCarousel from '../../components/ui/WildLifeCarousel'
import homemap2 from '../../assets/image/homemap2.png'
import dashboardsnap from '../../assets/image/dashboardsnap.png'
import { useNavigate } from 'react-router'
import route from '../../constants/route'

function SectionDivider({
  topColor,
  bottomColor,
}: {
  topColor: string
  bottomColor: string
}) {
  return (
    <div className="w-full h-10 md:h-16 flex flex-col" aria-hidden="true">
      <div className="flex-1 w-full" style={{ backgroundColor: topColor }} />
      <div className="flex-1 w-full" style={{ backgroundColor: bottomColor }} />
    </div>
  )
}

const COLORS = {
  hero: '#2f343d',
  carousel: '#e8f0dc',
  dashboard: '#1f2421',
  map: '#ffffff',
}

const Home: React.FC = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const observedSpecies = useAppSelector(selectObservedSpecies) ?? []
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(init({}))
  }, [dispatch])

  return (
    <main className="w-full overflow-x-hidden flex flex-col">
      {/* Hero Sec */}
      <div
        className="w-full py-10 md:py-16"
        style={{ backgroundColor: COLORS.hero }}
      >
        <Container fluid className="w-full min-w-0">
          <div
            className="w-full min-w-0 h-64 sm:h-80 md:h-[28rem]
                       border-2 border-dashed border-grey-accent
                       flex flex-col items-center justify-center gap-2 text-center px-4"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-text/50">
              Hero Image Placeholder
            </span>
            <span className="text-xs text-text/40">
              1600 × 600 recommended — swap in final asset when ready
            </span>
          </div>
        </Container>
      </div>

      <SectionDivider topColor={COLORS.hero} bottomColor={COLORS.carousel} />

      {/* Wildlife carousel — bg lives inside WildLifeCarousel itself */}
      <Container fluid className="w-full min-w-0">
        <WildLifeCarousel species={observedSpecies} />
      </Container>

      <SectionDivider
        topColor={COLORS.carousel}
        bottomColor={COLORS.dashboard}
      />

      {/* Dashboard snapshot */}
      <div
        className="w-full py-10 md:py-16"
        style={{ backgroundColor: COLORS.dashboard }}
      >
        <Container fluid className="w-full min-w-0">
          <div className="rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[35rem]">
            <img
              src={dashboardsnap}
              alt="Dashboard Snapshot"
              className="w-full h-full object-cover"
            />
          </div>
        </Container>
      </div>

      <SectionDivider topColor={COLORS.dashboard} bottomColor={COLORS.map} />

      {/* Map section */}
      <div
        className="w-full py-10 md:py-16"
        style={{ backgroundColor: COLORS.map }}
      >
        <Container fluid className="w-full min-w-0">
          <div className="w-full min-w-0 flex flex-col md:flex-row items-center gap-8 md:gap-4 px-6 md:px-10">
            <div className="flex-1 flex justify-center w-full">
              <div className="relative w-full max-w-[300px]">
                <div className="rounded-full overflow-hidden border-[10px] border-white aspect-square shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                  <img
                    src={homemap2}
                    alt="Home map"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0
                             px-5 py-2 rounded-full bg-[var(--button)] text-white text-sm font-semibold
                             shadow-md transition-transform duration-200
                             hover:bg-[var(--button-hover)] hover:scale-105"
                  onClick={() => navigate(route.MAP)}
                >
                  Explore Map
                </button>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-[#1f2421] mb-3">
                I am a placeholder
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-[#1f2421]/70">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </main>
  )
}

export default Home
