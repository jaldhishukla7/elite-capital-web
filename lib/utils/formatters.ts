const RUPEE = '\u20b9'

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return 'N/A'

  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (Number.isNaN(numPrice)) return 'N/A'

  if (numPrice >= 100000) {
    return `${RUPEE}${(numPrice / 100000).toFixed(2)}L`
  }

  if (numPrice >= 1000) {
    return `${RUPEE}${(numPrice / 1000).toFixed(2)}K`
  }

  return `${RUPEE}${numPrice.toFixed(2)}`
}

export function formatChange(change: number | string | null | undefined): string {
  if (change === null || change === undefined) return 'N/A'

  const numChange = typeof change === 'string' ? parseFloat(change) : change
  if (Number.isNaN(numChange)) return 'N/A'

  const sign = numChange > 0 ? '+' : ''
  return `${sign}${numChange.toFixed(2)}`
}

export function formatChangePercent(changePercent: number | string | null | undefined): string {
  if (changePercent === null || changePercent === undefined) return 'N/A'

  const numChange = typeof changePercent === 'string' ? parseFloat(changePercent) : changePercent
  if (Number.isNaN(numChange)) return 'N/A'

  const sign = numChange > 0 ? '+' : ''
  return `${sign}${numChange.toFixed(2)}%`
}

export function formatVolume(volume: number | string | null | undefined): string {
  if (volume === null || volume === undefined) return 'N/A'

  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume
  if (Number.isNaN(numVolume)) return 'N/A'

  if (numVolume >= 1000000) {
    return `${(numVolume / 1000000).toFixed(2)}M`
  }

  if (numVolume >= 1000) {
    return `${(numVolume / 1000).toFixed(2)}K`
  }

  return numVolume.toFixed(0)
}

export function formatMarketCap(marketCap: number | string | null | undefined): string {
  if (!marketCap) return 'N/A'

  const numCap = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap
  if (Number.isNaN(numCap)) return 'N/A'

  if (numCap >= 1000000000000) {
    return `${RUPEE}${(numCap / 1000000000000).toFixed(2)}T`
  }

  if (numCap >= 1000000000) {
    return `${RUPEE}${(numCap / 1000000000).toFixed(2)}B`
  }

  if (numCap >= 1000000) {
    return `${RUPEE}${(numCap / 1000000).toFixed(2)}M`
  }

  return `${RUPEE}${numCap.toFixed(0)}`
}

export function getChangeColor(change: number | string | null | undefined): string {
  if (change === null || change === undefined) return 'text-gray-500'

  const numChange = typeof change === 'string' ? parseFloat(change) : change
  if (Number.isNaN(numChange)) return 'text-gray-500'

  if (numChange > 0) return 'text-green-600 dark:text-green-400'
  if (numChange < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-500'
}

export function getBgChangeColor(change: number | string | null | undefined): string {
  if (change === null || change === undefined) return 'bg-gray-100 dark:bg-gray-900'

  const numChange = typeof change === 'string' ? parseFloat(change) : change
  if (Number.isNaN(numChange)) return 'bg-gray-100 dark:bg-gray-900'

  if (numChange > 0) return 'bg-green-100 dark:bg-green-900'
  if (numChange < 0) return 'bg-red-100 dark:bg-red-900'
  return 'bg-gray-100 dark:bg-gray-900'
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
