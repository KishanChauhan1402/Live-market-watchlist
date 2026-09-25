/**
 * Domain types for Real-Time NSE Stock Market Watchlist Portal
 */

export type DataStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'HALTED' | 'N/A' | 'MOCK';

export type ConnectionState = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'PAUSED';

export type MarketSession = 'PRE-MARKET' | 'MARKET OPEN' | 'MARKET CLOSED' | 'POST-MARKET' | 'DATA UNAVAILABLE';

export interface Stock {
  symbol: string;
  companyName: string;
  exchange: 'NSE';
  sector: string; // e.g. "NIFTY IT"
  previousClose: number;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  dataStatus: DataStatus;
  isHalted?: boolean;
}

export interface SectorIndex {
  name: string;
  symbol: string;
  previousClose: number;
  currentValue: number;
  change: number;
  changePercent: number;
  timestamp: number;
  dataStatus: DataStatus;
}

export type TieBreakerRule = 'changePercent_absoluteChange_symbol' | 'changePercent_volume_symbol' | 'symbol_alpha';

export interface StrategyConfig {
  market: 'NSE';
  topSectorCount: number;
  bottomSectorCount: number;
  topStocksPerSector: number;
  bottomStocksPerSector: number;
  updateMode: 'realtime' | 'interval';
  staleThresholdSeconds: number;
  rankingMetric: 'changePercent';
  tieBreaker: TieBreakerRule;
  updateFrequencyMs: number;
}

export interface StockSelectionReason {
  selectionSide: 'TOP' | 'BOTTOM';
  sectorSymbol: string;
  sectorName: string;
  sectorRank: number;
  totalSectorsConsidered: number;
  sectorPerformance: number;
  stockRankInSector: number;
  totalEligibleStocksInSector: number;
  stockPerformance: number;
  previousClose: number;
  currentPrice: number;
  absoluteChange: number;
  calculationFormula: string;
  selectedAt: number;
  note?: string;
}

export interface SelectedStockItem {
  stock: Stock;
  reason: StockSelectionReason;
  previousRank?: number;
  rankDelta?: number; // positive = improved rank, negative = dropped rank, 0 = unchanged
}

export interface SelectedSectorItem {
  sector: SectorIndex;
  rank: number;
  selectedStocks: SelectedStockItem[];
  availableStockCount: number;
  notice?: string; // e.g. "Only 2 eligible stocks available."
}

export interface StrategyExecutionResult {
  timestamp: number;
  marketSession: MarketSession;
  dataStatus: DataStatus;
  topSectors: SelectedSectorItem[];
  bottomSectors: SelectedSectorItem[];
  allSectorsRanked: SectorIndex[];
  staleSectorsCount: number;
  staleStocksCount: number;
  announcementEvents: string[]; // Screen reader / structural shifts
}

export interface MarketTick {
  type: 'STOCK_TICK' | 'SECTOR_TICK' | 'BATCH_TICKS' | 'HALT_EVENT' | 'SESSION_CHANGE';
  symbol: string;
  ltp?: number;
  currentValue?: number;
  volume?: number;
  timestamp: number;
  isHalted?: boolean;
  session?: MarketSession;
}
