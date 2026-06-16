import useSWR from 'swr'
import axios from 'axios'

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

interface UseMarketDataOptions {
  refreshInterval?: number
  dedupingInterval?: number
}

export function useMarketData(symbol: string, options?: UseMarketDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `/api/quotes/${symbol}` : null,
    fetcher,
    {
      refreshInterval: options?.refreshInterval || 5000,
      dedupingInterval: options?.dedupingInterval || 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

export function useIndices(options?: UseMarketDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/indices',
    fetcher,
    {
      refreshInterval: options?.refreshInterval || 5000,
      dedupingInterval: options?.dedupingInterval || 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    indices: data || [],
    error,
    isLoading,
    mutate,
  }
}

export function useCommodities(options?: UseMarketDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/commodities',
    fetcher,
    {
      refreshInterval: options?.refreshInterval || 5000,
      dedupingInterval: options?.dedupingInterval || 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    commodities: data || [],
    error,
    isLoading,
    mutate,
  }
}

export function useStocks(limit: number = 50, options?: UseMarketDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/stocks?limit=${limit}`,
    fetcher,
    {
      refreshInterval: options?.refreshInterval || 5000,
      dedupingInterval: options?.dedupingInterval || 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    stocks: data?.data || [],
    count: data?.count || 0,
    error,
    isLoading,
    mutate,
  }
}

export function useMarketStatus(options?: UseMarketDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/market-status',
    fetcher,
    {
      refreshInterval: options?.refreshInterval || 60000,
      dedupingInterval: options?.dedupingInterval || 5000,
      revalidateOnFocus: false,
    }
  )

  return {
    status: data?.status || 'unknown',
    message: data?.message || '',
    exchanges: data?.exchanges || [],
    error,
    isLoading,
    mutate,
  }
}
