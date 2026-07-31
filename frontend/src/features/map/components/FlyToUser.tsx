import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface Props {
  coords: {
    latitude: number
    longitude: number
  } | null
}

export default function FlyToUser({ coords }: Props) {
  const map = useMap()

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.latitude, coords.longitude], 14)
    }
  }, [coords, map])

  return null
}
