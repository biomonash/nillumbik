import MapView from './components/MapView'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { init, selectQuery, type MapQuery } from '../../store/mapSlice'
import { useEffect, useState } from 'react'

function parseQuery(qs: string): MapQuery {
  const query: MapQuery = {}

  const params = new URLSearchParams(qs)
  for (const [key, value] of params) {
    switch (key) {
      case 'blocks':
        query.blocks = value.split(',').map(Number)
        break

      case 'sites':
        query.sites = value.split(',')
        break

      case 'taxa':
        query.taxa = value
        break

      case 'species':
        query.species = value
        break

      case 'tenure':
        if (value === 'Public' || value === 'Private') {
          query.tenure = value
        }
        break
    }
  }
  return query
}

export default function MapPage() {
  const query = useAppSelector(selectQuery)
  const [loaded, setLoaded] = useState(false)

  const dispatch = useAppDispatch()
  // load initial data
  useEffect(() => {
    if (loaded) return

    dispatch(init(parseQuery(window.location.search)))
    setLoaded(true)
  }, [dispatch, loaded])

  useEffect(() => {
    if (!loaded) return

    const params = new URLSearchParams()

    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return

      if (Array.isArray(v) && v.length === 0) return

      params.append(k, String(v))
    })

    history.pushState(null, '', `?${params.toString()}`)
  }, [query, loaded])

  return (
    <div className="w-screen h-screen overflow-hidden fixed">
      <MapView />
    </div>
  )
}
