'use client'

import React, { useEffect, useRef, useState } from 'react'

let tvScriptLoadingPromise: Promise<void> | null = null

function getTradingViewSymbol(symbol: string): string {
  const upper = symbol.toUpperCase().trim()
  if (upper === 'NIFTY50' || upper === '^NSEI' || upper === 'NIFTY') return 'NSE:NIFTY'
  if (upper === 'NIFTYBANK' || upper === '^NSEBANK' || upper === 'BANKNIFTY') return 'NSE:BANKNIFTY'
  if (upper === 'SENSEX' || upper === '^BSESN') return 'BSE:SENSEX'
  if (upper === 'GOLD') return 'MCX:GOLD1!'
  if (upper === 'SILVER') return 'MCX:SILVER1!'
  if (upper === 'CRUDE') return 'MCX:CRUDEOIL1!'
  
  if (upper.includes(':')) return upper
  
  if (upper.endsWith('.NS')) {
    return `NSE:${upper.slice(0, -3)}`
  }
  if (upper.endsWith('.BO')) {
    return `BSE:${upper.slice(0, -3)}`
  }

  if (/^\d+$/.test(upper)) {
    return `BSE:${upper}`
  }
  return `NSE:${upper}`
}

export function TradingViewWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(false)

  // Listen to document.documentElement classes for dark mode toggle
  useEffect(() => {
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains('dark')
      setIsDark(dark)
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let active = true

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script')
        script.id = 'tradingview-widget-loading-script'
        script.src = 'https://s3.tradingview.com/tv.js'
        script.type = 'text/javascript'
        script.onload = () => resolve()
        document.head.appendChild(script)
      })
    }

    tvScriptLoadingPromise.then(() => {
      if (active && containerRef.current && 'TradingView' in window) {
        // Clear previous widget
        containerRef.current.innerHTML = `<div id="tradingview_canvas_${symbol}" class="w-full h-full min-h-[420px]" />`
        
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: getTradingViewSymbol(symbol),
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: isDark ? 'dark' : 'light',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: false, // Disallow arbitrary search in widget to stick to selected symbol
          container_id: `tradingview_canvas_${symbol}`,
          hide_side_toolbar: false,
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
        })
      }
    })

    return () => {
      active = false
    }
  }, [symbol, isDark])

  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#161618]">
      <div ref={containerRef} className="w-full h-full min-h-[420px]" />
    </div>
  )
}
