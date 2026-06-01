import fetcher from '../lib/fetcher'

export type SiteResponse = {
  id: number
  code: string
  block: number
  name: string
  location: string | null
  tenure: string
  forest: 'dry' | 'wet'
}

export async function getSiteList(): Promise<SiteResponse[]> {
  const res = await fetcher.get<SiteResponse[]>('/sites')
  return res.data
}
