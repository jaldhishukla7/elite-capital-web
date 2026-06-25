# Elite Capital Markets

A modern, real-time Indian stock market information platform inspired by Groww.in. Built with Next.js 16, Tailwind CSS, and Framer Motion.

## Features

### 🎯 Live Ticker Scrollbar
- **Sticky positioning** - Stays at the top while scrolling
- **Real-time data** - Updates every 5 seconds
- **Seamless scrolling animation** - Infinite loop with market indices:
  - NIFTY 50
  - NIFTY500
  - NIFTYJR
  - NIFTYMIDCAP150
  - SENSEX
  - GOLD
  - SILVER
  - CRUDE OIL

### 📊 Markets at a Glance
- 4 major index cards with live data
- Mini sparkline charts for each index
- Interactive cards with hover states
- Real-time percentage change indicators (green for gains, red for losses)

### 🏠 Home Page Features
- **Navbar** - Sticky navigation with dark mode toggle
- **Hero Section** - Call-to-action with portfolio mockup
- **Live Market Data** - Continuously updating ticker with price movements
- **Market Overview** - Quick view of all major indices
- **Responsive Design** - Mobile-first, fully responsive across all devices

### 🎨 Design System
- **Color Scheme** (Groww.in inspired):
  - Primary: #44C2A4 (Teal)
  - Success: #00D09C (Green)
  - Danger: #E74C3C (Red)
  - Background: #FFFFFF (Light) / #0D0D0D (Dark)
- **Typography**: Inter font family
- **Spacing**: Tailwind CSS scale
- **Components**: Smooth transitions and animations with Framer Motion

### 🌙 Dark Mode
- Full dark mode support
- Toggle button in navbar
- Persistent across page navigation
- Optimized color contrast in both themes

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Data Fetching**: SWR (with mock data for demo)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── globals.css         # Global styles with design tokens
│   └── page.tsx            # Home page
├── components/
│   ├── Navbar.tsx          # Navigation bar with dark mode
│   ├── LiveTicker.tsx      # Scrolling market ticker
│   ├── HeroSection.tsx     # Hero section with CTA
│   └── MarketOverview.tsx  # Market indices cards
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ or bun/pnpm
- npm, pnpm, yarn, or bun

### Installation

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install

# Or using bun
bun install
```

### Development

```bash
# Start the dev server
pnpm dev

# Open http://localhost:3000 in your browser
```

The app will hot-reload as you make changes.

### Building

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

## Real-time Data Integration

Currently using **mock data** for demo purposes. The app simulates market data updates every 5 seconds.

### To integrate with real APIs:

The component structure supports easy API integration. Replace the mock data functions with actual API calls:

**Free APIs Available:**
1. **NSE Market Data**
   - Endpoint: `https://www.nseindia.com/api/equity-stockIndices`
   - Headers required for CORS

2. **Mutual Fund NAVs** (No key needed)
   - Endpoint: `https://api.mfapi.in/mf`
   - Free and widely used

3. **TradingView Charts** (Free embeds)
   - Advanced Chart Widget
   - Mini Chart Widget

4. **Upstox Developer API**
   - Register at: https://developer.upstox.com
   - Free tier available

5. **Angel One SmartAPI**
   - Register at: https://smartapi.angelbroking.com
   - JavaScript SDK available

## Live Ticker Component

The `LiveTicker` component handles:
- Horizontal scrolling animation using Framer Motion
- Seamless infinite loop (duplicates data set)
- Real-time data updates every 5 seconds
- Color-coded changes (green/red)
- Mobile responsive with truncation

## Usage Examples

### Using the Live Ticker
```tsx
import { LiveTicker } from '@/components/LiveTicker'

export default function Page() {
  return <LiveTicker />
}
```

### Updating Ticker Data
The ticker automatically updates every 5 seconds. Modify the interval in `LiveTicker.tsx`:
```tsx
const timer = setInterval(updateData, 5000) // Change 5000 to desired ms
```

## Responsive Design

- **Mobile** (< 768px): Single column layout, mobile-optimized navigation
- **Tablet** (768px - 1024px): 2-column grid layouts
- **Desktop** (> 1024px): Full 4-column grid with sidebar support

## Color System

### Light Mode
- Background: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Accent: #44C2A4
- Danger: #E74C3C

### Dark Mode
- Background: #0D0D0D
- Text Primary: #E8E8E8
- Text Secondary: #9CA3AF
- Accent: #44C2A4
- Danger: #E74C3C

## Performance Optimizations

- Server-side rendering (Next.js)
- Image optimization
- CSS minification
- Code splitting
- Turbopack bundler (default in Next.js 16)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers

## Future Enhancements

- [ ] Stock detail pages with TradingView charts
- [ ] Mutual funds page with fund selector
- [ ] IPO tracker with subscription status
- [ ] Options chain viewer
- [ ] Watchlist with local storage
- [ ] Portfolio tracker
- [ ] Price alerts
- [ ] Market news integration
- [ ] Technical indicators
- [ ] Backtest tools

## Contributing

Feel free to fork, modify, and use this project as a starting point.

## License

Open source - use freely for personal and commercial projects.

## Support

For issues, feature requests, or questions:
1. Check existing documentation
2. Review the code comments
3. Create an issue in your fork

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Other Platforms
- Netlify
- AWS Amplify
- GitHub Pages
- Docker containerization

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [React Documentation](https://react.dev)
- [SWR Data Fetching](https://swr.vercel.app)

---

Built with ❤️ for Indian investors. Happy investing! 📈
