import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Elite Capital Markets - Smart Investing Platform',
  description: 'Real-time stock market data, mutual funds, IPOs, and financial information for Indian investors. Live market ticker with NIFTY 50, SENSEX, and commodities data.',
  keywords: 'stocks, mutual funds, IPO, NIFTY, SENSEX, market data, trading',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

import { LoadDisclaimer } from '@/components/LoadDisclaimer'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-[#0D0D0D]`}>
      <body className="font-sans antialiased bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white">
        {children}
        <LoadDisclaimer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
