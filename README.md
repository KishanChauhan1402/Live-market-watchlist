<div align="center">

# 📈 NSE Market Watch
### Real-Time Sector & Stock Watchlist Portal

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)](LICENSE)

**A professional-grade, real-time market intelligence dashboard for NSE sector indices and stock watchlists.**  
Built with a deterministic strategy engine that continuously ranks top & bottom performing sectors and surfaces the best qualifying stocks within each.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Real-Time Ticks** | Live market data feed with automatic reconnection and backoff |
| 📊 **Sector Strategy Engine** | Continuously ranks all NSE sector indices by session % change |
| 🏆 **Top Performers** | Auto-selects Top N sectors (gainers) and their top stocks |
| 📉 **Bottom Performers** | Auto-selects Bottom N sectors (losers) and their weakest stocks |
| 🔁 **Dynamic Re-ranking** | Rankings update every tick with tie-breaker rules |
| ⚠️ **Stale Data Detection** | Visual alerts when data hasn't refreshed within threshold |
| 🧪 **Demo Simulation Lab** | Simulate rallies, plunges, halts, and disconnections |
| 📱 **Fully Responsive** | Zero horizontal scrolling — mobile-first card layout |
| ♿ **Accessible** | ARIA roles, screen reader announcements, keyboard navigation |
| ⚙️ **Strategy Config** | Customize sector count, stock count, and tie-breaker rules |

---

## 🖥️ Tech Stack

- **Frontend**: React 19 + TypeScript 7
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Server**: Express (for live API proxy)
- **Runtime**: Node.js

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KishanChauhan1402/Live-market-watchlist.git
cd Live-market-watchlist

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Open `.env.local` and fill in your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your free Gemini API key at [Google AI Studio](https://ai.google.dev)

### Run Locally

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
src/
├── data/                    # Data providers
│   ├── HttpMarketDataProvider.ts   # Live API integration
│   ├── MockMarketDataProvider.ts   # Demo/simulation data
│   ├── MarketDataProvider.ts       # Provider interface
│   └── nseUniverse.ts              # NSE stock & sector universe
│
├── domain/                  # Core business logic
│   ├── types.ts                    # Shared TypeScript types
│   ├── PerformanceCalculator.ts    # % change & formatting
│   ├── SectorRankingEngine.ts      # Sector ranking algorithm
│   ├── StockRankingEngine.ts       # Stock ranking algorithm
│   ├── SelectionEngine.ts          # Top/Bottom selection logic
│   └── __tests__/                  # Unit tests
│
├── services/                # App-level services
│   └── MarketDataService.ts        # Data pipeline orchestration
│
├── ui/                      # React UI components
│   ├── Header.tsx                  # Sticky top bar with status & controls
│   ├── SectorOverviewTicker.tsx    # All-sector pill ticker
│   ├── SimulationToolbar.tsx       # Demo lab controls
│   ├── TopSectorSection.tsx        # Top performers panel
│   ├── BottomSectorSection.tsx     # Bottom performers panel
│   ├── StockTable.tsx              # Responsive stock list/table
│   ├── SelectionReasonModal.tsx    # "Why Selected?" detail modal
│   ├── StrategyConfigModal.tsx     # Strategy settings modal
│   ├── EngineTestModal.tsx         # Strategy engine unit tests
│   └── ScreenReaderAnnouncer.tsx   # Live region for accessibility
│
├── App.tsx                  # Root application component
├── main.tsx                 # React entry point
└── index.css                # Global styles & Tailwind base
```

---

## 🧠 How the Strategy Engine Works

1. **Data Ingestion** — Market ticks arrive from the provider (Mock or Live HTTP)
2. **Sector Ranking** — All NSE sector indices are ranked by `(currentValue - previousClose) / previousClose × 100`
3. **Top N Selection** — The top N sectors by gain % are selected; tie-broken by volume or alphabetical order
4. **Bottom N Selection** — The bottom N sectors by loss % are selected using the same tie-breaker
5. **Stock Selection** — For each selected sector, stocks are independently ranked and the top/bottom K stocks are surfaced
6. **Re-render** — UI updates reactively every tick cycle with smooth transitions

---

## 🛠️ Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server at port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type check |

---

## ⚙️ Strategy Configuration

You can customize the strategy via the **⚙ Strategy Config** button in the header:

| Setting | Default | Description |
|---|---|---|
| Top Sector Count | 3 | Number of top-performing sectors to display |
| Bottom Sector Count | 3 | Number of bottom-performing sectors to display |
| Stocks Per Sector | 3 | Number of stocks to show per sector |
| Stale Threshold | 60s | Seconds before data is flagged as stale |
| Tie Breaker | Volume | How to break % change ties |
| Data Provider | Mock | Switch between Mock Simulator and Live HTTP |

---

## 🧪 Demo Simulation Lab

The built-in **Demo Lab** lets you simulate real market events without a live data feed:

- **Swap Bank & IT Ranks** — Demonstrates dynamic sector re-ranking
- **Rally WIPRO** — Pushes WIPRO into top stock list
- **Plunge DLF** — Drops DLF into bottom stock list
- **Halt INFY** — Toggles trading halt status on INFY
- **Simulate Disconnect** — Tests reconnection & recovery logic
- **Speed Control** — Adjust tick frequency (0.8s / 1.5s / 3s)
- **Market Session** — Switch between Open / Pre-Market / Closed / Post-Market

---

## ⚠️ Disclaimer

> This portal is a **neutral watchlist tool** for informational purposes only. Securities displayed are selected purely by quantitative, session-based performance algorithms. This is **not** an investment recommendation, buy/sell call, or return prediction. Always consult a SEBI-registered investment advisor before making trading decisions.

---

## 📜 License

Licensed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ for NSE market enthusiasts
</div>
