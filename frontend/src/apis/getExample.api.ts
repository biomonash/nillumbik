import fetcher from '../lib/fetcher';

export default async () => {
    const response = await fetcher("");

    return response
}