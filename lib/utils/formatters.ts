export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return '₹0.00'

  return `₹${numPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatChange(change: number | string): string {
  const numChange = typeof change === 'string' ? parseFloat(change) : change
  if (isNaN(numChange)) return '0.00'

  const sign = numChange > 0 ? '+' : ''
  return `${sign}${numChange.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatChangePercent(changePercent: number | string): string {
  const numChange = typeof changePercent === 'string' ? parseFloat(changePercent) : changePercent
  if (isNaN(numChange)) return '0.00%'

  const sign = numChange > 0 ? '+' : ''
  return `${sign}${numChange.toFixed(2)}%`
}

export function formatVolume(volume: number | string): string {
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume
  if (isNaN(numVolume)) return '0'

  return numVolume.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })
}

export function formatMarketCap(marketCap: number | string | undefined): string {
  if (!marketCap) return 'N/A'

  const numCap = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap
  if (isNaN(numCap)) return 'N/A'

  if (numCap >= 10000000) {
    return `₹${(numCap / 10000000).toFixed(2)} Cr`
  }
  if (numCap >= 100000) {
    return `₹${(numCap / 100000).toFixed(2)} Lakh`
  }

  return `₹${numCap.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`
}

export function getChangeColor(change: number | string): string {
  const numChange = typeof change === 'string' ? parseFloat(change) : change
  if (isNaN(numChange)) return 'text-gray-500'

  if (numChange > 0) return 'text-green-600 dark:text-green-400'
  if (numChange < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-500'
}

export function getBgChangeColor(change: number | string): string {
  const numChange = typeof change === 'string' ? parseFloat(change) : change
  if (isNaN(numChange)) return 'bg-gray-100 dark:bg-gray-900'

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