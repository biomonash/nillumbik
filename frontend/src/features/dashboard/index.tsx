import React, { useEffect, useState } from 'react'
import { StatsCard } from './components/StatsCard'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
  getDashboardStats,
  type DashboardStatsResponse,
} from '../../apis/stats.api'
import { toPercent } from '../../lib/utils'
import { BarChart } from './components/charts/BarChart'
import { LineChart } from './components/charts/LineChart'
import { PieChart } from './components/charts/PieChart'
import { useSearchParams } from 'react-router'
import dataConst from '../../constants/data'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const startYear = searchParams.get('startYear') || ''
  const endYear = searchParams.get('endYear') || ''
  const isFilterActive = !!(startYear && endYear)

  useEffect(() => {
    const fromDate = startYear ? new Date(`${startYear}-01-01`) : undefined
    const toDate = endYear ? new Date(`${endYear}-12-31`) : undefined

    getDashboardStats({ from: fromDate, to: toDate }).then(setStats)
  }, [startYear, endYear])

  const handleYearChange = (key: 'startYear' | 'endYear', value: string) => {
    if (value === 'all') {
      searchParams.delete('startYear')
      searchParams.delete('endYear')
    } else {
      searchParams.set(key, value)
    }
    setSearchParams(searchParams)
  }

  const IconPlaceholder = ({ label }: { label: string }) => (
    <span
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-[10px] mr-1.5"
    >
      {label[0]}
    </span>
  )

  const DataVisualizationPlaceholder = () => (
    <div className="h-[200px] rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground text-sm w-full">
      Data Visualization Coming Soon
    </div>
  )

  const yearOptions = dataConst.YEAR_OPTIONS

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-8 box-border">
      {/* Title */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground m-0">
            Ecological Monitoring Dashboard
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Real-time environmental data from across Nillumbik Shire
          </p>
        </div>
        <div className="flex items-center gap-3 bg-sidebar/50 p-2 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 uppercase font-bold">
              From
            </span>
            <select
              value={startYear || 'all'}
              onChange={(e) => handleYearChange('startYear', e.target.value)}
              className="bg-sidebar text-white border border-white/10 rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
            >
              <option value="all">Start</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 uppercase font-bold">
              To
            </span>
            <select
              value={endYear || 'all'}
              onChange={(e) => handleYearChange('endYear', e.target.value)}
              className="bg-sidebar text-white border border-white/10 rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
            >
              <option value="all">End</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-sidebar text-white"
          >
            <IconPlaceholder label="Live" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Key Statistics */}
      {stats !== null ? (
        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          <StatsCard
            title="Total Species Detected"
            value={stats.speciesCount}
            subtitle="Across all monitored areas"
            icon={<span>🔔</span>}
            trend={{ value: 12, label: 'vs last month' }}
            color="forest"
          />
          <StatsCard
            title="Active Monitoring Sites"
            value={stats.sitesCount}
            subtitle="Continuous data collection"
            icon={<span>🌁</span>}
            trend={{ value: 12, label: 'vs last month' }}
            color="primary"
          />
          <StatsCard
            title="Detection Events"
            value={stats.observationCount}
            subtitle="Total recorded observations"
            icon={<span>🔍</span>}
            trend={{ value: 8, label: 'vs last month' }}
            color="accent"
          />
          <StatsCard
            title="Native Species"
            value={toPercent(stats.nativeSpeciesCount / stats.speciesCount)}
            subtitle="Of all detected species"
            icon={<span>🦜</span>}
            trend={{ value: 12, label: 'vs last month' }}
            color="secondary"
          />
        </div>
      ) : (
        <p className="text-[var(--muted-foreground)]">Loading</p>
      )}

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Card className={isFilterActive ? 'md:col-span-2' : ''}>
          <CardHeader>
            <CardTitle>Species by Year</CardTitle>
            <CardDescription>Distribution across years</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart startYear={startYear} endYear={endYear} />
          </CardContent>
        </Card>

        <Card className={isFilterActive ? 'md:col-span-2 order-last' : ''}>
          <CardHeader>
            <CardTitle>Native vs Invasive Trends</CardTitle>
            <CardDescription>Annual variation</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart startYear={startYear} endYear={endYear} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Species Composition</CardTitle>
            <CardDescription>Native, Invasive, Rare</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart startYear={startYear} endYear={endYear} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Habitat or Location breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <DataVisualizationPlaceholder />
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Interactive Map</CardTitle>
            <CardDescription>Placeholder for the map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] bg-white/5">
              Map Placeholder
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="!bg-transparent !border-transparent !shadow-none">
        {' '}
        {/** Override the transparent background*/}
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and report generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 w-full grid-cols-1 sm:grid-cols-4">
            {[
              { key: 'Map', label: 'View Map' },
              { key: 'Tree', label: 'Species Report' },
              { key: 'Trnd', label: 'Analytics' },
              { key: 'Data', label: 'Data Export' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant="outline"
                className="flex flex-col items-center gap-1 py-3"
              >
                <IconPlaceholder label={key} />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
