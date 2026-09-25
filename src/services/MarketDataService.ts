import { MarketDataProvider } from '../data/MarketDataProvider.ts';
import { PerformanceCalculator } from '../domain/PerformanceCalculator.ts';
import { SelectionEngine } from '../domain/SelectionEngine.ts';
import {
  ConnectionState,
  MarketSession,
  MarketTick,
  SectorIndex,
  Stock,
  StrategyConfig,
  StrategyExecutionResult,
} from '../domain/types.ts';

export type StrategyUpdateListener = (result: StrategyExecutionResult) => void;
export type ConnectionStateListener = (state: ConnectionState) => void;
export type RawMarketUpdateListener = (stocks: Stock[], sectors: SectorIndex[]) => void;

export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  market: 'NSE',
  topSectorCount: 3,
  bottomSectorCount: 3,
  topStocksPerSector: 3,
  bottomStocksPerSector: 3,
  updateMode: 'realtime',
  staleThresholdSeconds: 10,
  rankingMetric: 'changePercent',
  tieBreaker: 'changePercent_absoluteChange_symbol',
  updateFrequencyMs: 1500,
};

export class MarketDataService {
  private provider: MarketDataProvider;
  private selectionEngine: SelectionEngine;
  private config: StrategyConfig;

  private sectorsMap: Map<string, SectorIndex> = new Map();
  private stocksMap: Map<string, Stock> = new Map();
  private currentSession: MarketSession = 'MARKET OPEN';
  private connectionState: ConnectionState = 'DISCONNECTED';

  private strategyListeners: Set<StrategyUpdateListener> = new Set();
  private connectionListeners: Set<ConnectionStateListener> = new Set();
  private rawUpdateListeners: Set<RawMarketUpdateListener> = new Set();

  private unsubscribeTicks: (() => void) | null = null;
  private unsubscribeConn: (() => void) | null = null;
  private staleCheckTimer: NodeJS.Timeout | null = null;
  private latestResult: StrategyExecutionResult | null = null;

  constructor(provider: MarketDataProvider, config: StrategyConfig = DEFAULT_STRATEGY_CONFIG) {
    this.provider = provider;
    this.config = config;
    this.selectionEngine = new SelectionEngine();
  }

  public async initialize(): Promise<void> {
    // 1. Fetch initial universe
    const snapshot = await this.provider.fetchSnapshot();
    this.currentSession = snapshot.marketSession;

    this.sectorsMap.clear();
    for (const sec of snapshot.sectors) {
      this.sectorsMap.set(sec.symbol, sec);
    }

    this.stocksMap.clear();
    for (const stk of snapshot.stocks) {
      this.stocksMap.set(stk.symbol, stk);
    }

    // 2. Wire provider listeners
    this.unsubscribeTicks = this.provider.subscribeTicks((tick) => this.handleIncomingTick(tick));
    this.unsubscribeConn = this.provider.subscribeConnectionState((state) => {
      this.connectionState = state;
      for (const listener of this.connectionListeners) {
        listener(state);
      }
    });

    // 3. Connect to streaming provider
    await this.provider.connect();

    // 4. Initial evaluation
    this.recalculateAndEmit();

    // 5. Periodic stale detector (every 3 seconds)
    this.staleCheckTimer = setInterval(() => {
      this.recalculateAndEmit();
    }, 3000);
  }

  public async switchProvider(newProvider: MarketDataProvider): Promise<void> {
    if (this.unsubscribeTicks) this.unsubscribeTicks();
    if (this.unsubscribeConn) this.unsubscribeConn();
    if (this.staleCheckTimer) clearInterval(this.staleCheckTimer);

    await this.provider.disconnect();

    this.provider = newProvider;
    this.selectionEngine.resetRankCache();
    await this.initialize();
  }

  public getProvider(): MarketDataProvider {
    return this.provider;
  }

  public updateConfig(newConfig: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.selectionEngine.resetRankCache();
    this.recalculateAndEmit();
  }

  public getConfig(): StrategyConfig {
    return this.config;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getMarketSession(): MarketSession {
    return this.currentSession;
  }

  public setMarketSession(session: MarketSession): void {
    this.currentSession = session;
    if (this.provider.setMarketSession) {
      this.provider.setMarketSession(session);
    }
    this.recalculateAndEmit();
  }

  public getLatestResult(): StrategyExecutionResult | null {
    return this.latestResult;
  }

  public subscribeStrategy(listener: StrategyUpdateListener): () => void {
    this.strategyListeners.add(listener);
    if (this.latestResult) {
      listener(this.latestResult);
    }
    return () => {
      this.strategyListeners.delete(listener);
    };
  }

  public subscribeConnection(listener: ConnectionStateListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connectionState);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  public subscribeRawUpdates(listener: RawMarketUpdateListener): () => void {
    this.rawUpdateListeners.add(listener);
    return () => {
      this.rawUpdateListeners.delete(listener);
    };
  }

  public destroy(): void {
    if (this.staleCheckTimer) clearInterval(this.staleCheckTimer);
    if (this.unsubscribeTicks) this.unsubscribeTicks();
    if (this.unsubscribeConn) this.unsubscribeConn();
    this.provider.disconnect();
    this.strategyListeners.clear();
    this.connectionListeners.clear();
    this.rawUpdateListeners.clear();
  }

  // --- Incremental Tick Processing Pipeline ---

  private handleIncomingTick(tick: MarketTick): void {
    const now = tick.timestamp || Date.now();

    if (tick.type === 'STOCK_TICK' && tick.ltp !== undefined) {
      const stock = this.stocksMap.get(tick.symbol);
      if (stock) {
        stock.ltp = tick.ltp;
        stock.change = PerformanceCalculator.calculateAbsoluteChange(tick.ltp, stock.previousClose);
        stock.changePercent = PerformanceCalculator.calculateChangePercent(tick.ltp, stock.previousClose);
        if (tick.volume !== undefined) stock.volume = tick.volume;
        stock.timestamp = now;
        stock.dataStatus = this.provider.isSimulated ? 'MOCK' : 'LIVE';
      }
    } else if (tick.type === 'SECTOR_TICK' && tick.currentValue !== undefined) {
      const sector = this.sectorsMap.get(tick.symbol);
      if (sector) {
        sector.currentValue = tick.currentValue;
        sector.change = PerformanceCalculator.calculateAbsoluteChange(tick.currentValue, sector.previousClose);
        sector.changePercent = PerformanceCalculator.calculateChangePercent(tick.currentValue, sector.previousClose);
        sector.timestamp = now;
        sector.dataStatus = this.provider.isSimulated ? 'MOCK' : 'LIVE';
      }
    } else if (tick.type === 'HALT_EVENT') {
      const stock = this.stocksMap.get(tick.symbol);
      if (stock) {
        stock.isHalted = tick.isHalted ?? false;
        stock.dataStatus = stock.isHalted ? 'HALTED' : (this.provider.isSimulated ? 'MOCK' : 'LIVE');
        stock.timestamp = now;
      }
    } else if (tick.type === 'SESSION_CHANGE' && tick.session) {
      this.currentSession = tick.session;
    }

    this.recalculateAndEmit();
  }

  private recalculateAndEmit(): void {
    const sectors = Array.from(this.sectorsMap.values());
    const stocks = Array.from(this.stocksMap.values());

    const result = this.selectionEngine.evaluateStrategy(
      sectors,
      stocks,
      this.config,
      this.currentSession,
      Date.now(),
      this.provider.isSimulated
    );

    this.latestResult = result;

    // Notify strategy listeners
    for (const listener of this.strategyListeners) {
      try {
        listener(result);
      } catch (err) {
        console.error('Error notifying strategy listener', err);
      }
    }

    // Notify raw market listeners
    for (const listener of this.rawUpdateListeners) {
      try {
        listener(stocks, sectors);
      } catch (err) {
        console.error('Error notifying raw market listener', err);
      }
    }
  }
}
