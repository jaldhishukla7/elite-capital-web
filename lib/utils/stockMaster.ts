import { BASE_STOCKS } from './nseHelper'

export interface StockMasterItem {
  symbol: string
  name: string
  exchange: 'NSE' | 'BSE'
  isin?: string
  bseCode?: string
  yahooSymbols: string[]
  source: 'exchange' | 'fallback'
}

interface StockPageOptions {
  query?: string
  page?: number
  limit?: number
  exchange?: 'all' | 'NSE' | 'BSE'
}

const NSE_EQUITY_URL = 'https://archives.nseindia.com/content/equities/EQUITY_L.csv'
const BSE_SCRIP_URLS = [
  'https://www.bseindia.com/downloads1/ListOfScrips.csv',
  'https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w?Group=&Scripcode=&industry=&segment=Equity&status=Active',
]

const FALLBACK_STOCKS: StockMasterItem[] = [
  ...BASE_STOCKS.map((stock) => ({
    symbol: normalizeSymbol(stock.symbol),
    name: stock.name,
    exchange: 'NSE' as const,
    yahooSymbols: [`${normalizeSymbol(stock.symbol)}.NS`],
    source: 'fallback' as const,
  })),
  {
    symbol: 'CARRARO',
    name: 'Carraro India Limited',
    exchange: 'NSE',
    isin: 'INE0V7S01010',
    yahooSymbols: ['CARRARO.NS'],
    source: 'fallback',
  },
]

let cachedMaster: StockMasterItem[] | null = null
let lastMasterFetch = 0
const MASTER_CACHE_MS = 6 * 60 * 60 * 1000

export async function getStockMaster() {
  const now = Date.now()
  if (cachedMaster && now - lastMasterFetch < MASTER_CACHE_MS) {
    return cachedMaster
  }

  const [nseStocks, bseStocks] = await Promise.all([
    fetchNseStocks(),
    fetchBseStocks(),
  ])

  cachedMaster = mergeStocks([...nseStocks, ...bseStocks, ...FALLBACK_STOCKS])
  lastMasterFetch = now
  return cachedMaster
}

export async function findStockInMaster(symbol: string) {
  const normalized = normalizeSymbol(symbol)
  const stocks = await getStockMaster()

  return stocks.find((stock) => {
    return (
      stock.symbol === normalized ||
      stock.bseCode === normalized ||
      stock.yahooSymbols.some((candidate) => candidate.toUpperCase().split('.')[0] === normalized)
    )
  })
}

export async function getStockPage(options: StockPageOptions = {}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 25))
  const query = options.query?.trim().toLowerCase() || ''
  const exchange = options.exchange || 'all'
  const stocks = await getStockMaster()

  const filtered = stocks.filter((stock) => {
    const exchangeMatches = exchange === 'all' || stock.exchange === exchange
    if (!exchangeMatches) return false
    if (!query) return true

    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query) ||
      stock.isin?.toLowerCase().includes(query) ||
      stock.bseCode?.toLowerCase().includes(query)
    )
  })

  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit)

  return {
    data,
    count: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  }
}

export function buildYahooCandidates(stock: Pick<StockMasterItem, 'symbol' | 'exchange' | 'bseCode' | 'yahooSymbols'>) {
  const candidates = new Set<string>()
  stock.yahooSymbols.forEach((candidate) => candidates.add(candidate))

  if (stock.exchange === 'BSE' && stock.bseCode) {
    candidates.add(`${stock.bseCode}.BO`)
  }

  if (stock.symbol) {
    candidates.add(`${stock.symbol}.NS`)
    candidates.add(`${stock.symbol}.BO`)
  }

  return Array.from(candidates)
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase()
}

function mergeStocks(stocks: StockMasterItem[]) {
  const merged = new Map<string, StockMasterItem>()

  for (const stock of stocks) {
    const key = `${stock.exchange}:${stock.symbol}`
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, stock)
      continue
    }

    merged.set(key, {
      ...existing,
      ...stock,
      yahooSymbols: Array.from(new Set([...existing.yahooSymbols, ...stock.yahooSymbols])),
      source: existing.source === 'exchange' || stock.source === 'exchange' ? 'exchange' : 'fallback',
    })
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (a.exchange !== b.exchange) return a.exchange.localeCompare(b.exchange)
    return a.symbol.localeCompare(b.symbol)
  })
}

async function fetchNseStocks(): Promise<StockMasterItem[]> {
  try {
    const response = await fetch(NSE_EQUITY_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/csv,*/*',
      },
      next: { revalidate: 21600 },
    })

    if (!response.ok) return []

    const csv = await response.text()
    const rows = parseCsv(csv)
    const [header, ...dataRows] = rows
    const indexes = indexHeaders(header)

    return dataRows
      .map((row) => {
        const symbol = row[indexes.symbol]
        const name = row[indexes.name]
        if (!symbol || !name) return null

        const normalized = normalizeSymbol(symbol)
        return {
          symbol: normalized,
          name: name.trim(),
          exchange: 'NSE' as const,
          isin: row[indexes.isin]?.trim(),
          yahooSymbols: [`${normalized}.NS`],
          source: 'exchange' as const,
        }
      })
      .filter(Boolean) as StockMasterItem[]
  } catch {
    return []
  }
}

async function fetchBseStocks(): Promise<StockMasterItem[]> {
  for (const url of BSE_SCRIP_URLS) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'text/csv,application/json,*/*',
          Referer: 'https://www.bseindia.com/',
        },
        next: { revalidate: 21600 },
      })

      if (!response.ok) continue

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const json = await response.json()
        const rows = Array.isArray(json) ? json : json?.Data || json?.data || []
        const parsed = parseBseJson(rows)
        if (parsed.length > 0) return parsed
      } else {
        const csv = await response.text()
        const parsed = parseBseCsv(csv)
        if (parsed.length > 0) return parsed
      }
    } catch {
      continue
    }
  }

  return []
}

function parseBseJson(rows: any[]): StockMasterItem[] {
  return rows
    .map((row) => {
      const code = String(row.SCRIP_CD || row.ScripCode || row.Scripcode || row.scripcode || '').trim()
      const symbol = String(row.SCRIP_ID || row.ScripID || row.scrip_id || code || '').trim()
      const name = String(row.Scrip_Name || row.SCRIP_NAME || row.Name || row.name || '').trim()
      const isin = String(row.ISIN_NUMBER || row.ISIN || row.isin || '').trim()
      if (!code || !symbol || !name) return null

      return {
        symbol: normalizeSymbol(symbol),
        name,
        exchange: 'BSE' as const,
        isin,
        bseCode: code,
        yahooSymbols: [`${code}.BO`, `${normalizeSymbol(symbol)}.BO`],
        source: 'exchange' as const,
      }
    })
    .filter(Boolean) as StockMasterItem[]
}

function parseBseCsv(csv: string): StockMasterItem[] {
  const rows = parseCsv(csv)
  const [header, ...dataRows] = rows
  if (!header) return []

  const normalizedHeaders = header.map((item) => item.trim().toLowerCase())
  const codeIndex = findHeader(normalizedHeaders, ['security code', 'scrip code', 'code'])
  const symbolIndex = findHeader(normalizedHeaders, ['security id', 'scrip id', 'symbol'])
  const nameIndex = findHeader(normalizedHeaders, ['security name', 'issuer name', 'name'])
  const isinIndex = findHeader(normalizedHeaders, ['isin no', 'isin number', 'isin'])

  return dataRows
    .map((row) => {
      const code = row[codeIndex]?.trim()
      const symbol = row[symbolIndex]?.trim() || code
      const name = row[nameIndex]?.trim()
      if (!code || !symbol || !name) return null

      return {
        symbol: normalizeSymbol(symbol),
        name,
        exchange: 'BSE' as const,
        isin: row[isinIndex]?.trim(),
        bseCode: code,
        yahooSymbols: [`${code}.BO`, `${normalizeSymbol(symbol)}.BO`],
        source: 'exchange' as const,
      }
    })
    .filter(Boolean) as StockMasterItem[]
}

function indexHeaders(header: string[]) {
  const normalizedHeaders = header.map((item) => item.trim().toLowerCase())
  return {
    symbol: findHeader(normalizedHeaders, ['symbol']),
    name: findHeader(normalizedHeaders, ['name of company', 'name']),
    isin: findHeader(normalizedHeaders, ['isin number', 'isin']),
  }
}

function findHeader(headers: string[], candidates: string[]) {
  for (const candidate of candidates) {
    const index = headers.indexOf(candidate)
    if (index >= 0) return index
  }
  return -1
}

function parseCsv(csv: string) {
  return csv
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseCsvLine)
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      index++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }

  cells.push(current)
  return cells
}
