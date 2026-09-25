# NSE Market Watch — Real-Time Sector & Stock Watchlist Portal

A production-grade, event-driven market monitoring and quantitative screening system for the National Stock Exchange of India (NSE).

Continuously monitors NSE-listed stocks and sector indices during trading hours to identify:
- **Top Side:** The 3 highest-performing NSE sectors and highest-performing stocks within each sector.
- **Bottom Side:** The 3 lowest-performing NSE sectors and 3 weakest stocks within each sector.

---

## 🏗️ Architecture

```
MarketDataProvider (Mock / Licensed Vendor Feed)
        ↓
Market Data Normalizer
        ↓
Real-Time Market State Cache
        ↓
Sector Ranking Engine (changePercent DESC / ASC)
        ↓
Stock Ranking Engine (Top Gainers / Top Decliners within Sectors)
        ↓
Selection Engine (Integrity, Stale Checks, Tie-Breaking, Reasons)
        ↓
Incremental Event Stream (WebSocket / SSE / Reactive Observers)
        ↓
Terminal Dashboard (WCAG-Compliant, Compact, Zero Horizontal Overflow)
```

---

## ⚡ Key Capabilities

1. **Baseline Invariance:** Strictly calculates returns using the previous trading session close as baseline:
   $$\text{changePercent} = \frac{\text{currentValue} - \text{previousClose}}{\text{previousClose}} \times 100$$
2. **Transparent Rationale:** Every shortlisted stock displays an accessible breakdown explaining its exact sector rank, stock rank within sector, baseline previous close, LTP, and mathematical calculation.
3. **Pluggable Market Feed Providers:**
   - `MockMarketDataProvider`: Generates realistic incremental ticks, simulated rallies/plunges, halts, and disconnect/reconnect simulations.
   - `HttpMarketDataProvider`: Production gateway for licensed real-time NSE SSE/REST endpoints.
4. **Data Integrity & Stale Detection:**
   - Distinct badges for `● LIVE`, `DEMO / MOCK DATA`, `⚠ STALE DATA`, `× CONNECTION LOST`.
   - Stale data warnings trigger automatically if ticks stop arriving beyond the configured threshold (default 10s).
5. **Accessibility & Terminal UX:**
   - Zero horizontal scrollbars with responsive wrapping and fixed-width tabular typography.
   - Directional icons (`↑` / `↓`) beside all performance metrics so color is never the sole visual indicator.
   - Screen reader live announcements (`aria-live="polite"`) for structural sector rank migrations.
6. **Integrated Verification Test Suite:** 14 automated unit tests verifying calculations, rankings, tie-breakers, missing data exclusions, and connection resilience.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation
```bash
git clone https://github.com/KishanChauhan1402/Live-market-Watch-list.git
cd Live-market-Watch-list
npm install
```

### Running Locally
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run preview
```

---

## ⚙️ Configuration

Strategy parameters can be adjusted via the **Strategy Config** dialog in the UI or programmatically via `StrategyConfig`:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `topSectorCount` | `number` | `3` | Number of top performing sectors to rank |
| `bottomSectorCount` | `number` | `3` | Number of bottom performing sectors to rank |
| `topStocksPerSector` | `number` | `3` | Shortlisted stocks per top sector |
| `bottomStocksPerSector` | `number` | `3` | Shortlisted stocks per bottom sector |
| `staleThresholdSeconds` | `number` | `10` | Seconds before feed is flagged as `STALE` |
| `tieBreaker` | `enum` | `changePercent_absoluteChange_symbol` | Deterministic tie-breaking rule |
