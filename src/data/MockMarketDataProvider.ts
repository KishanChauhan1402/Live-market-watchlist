import {
  ConnectionState,
  MarketSession,
  MarketTick,
  SectorIndex,
  Stock,
} from '../domain/types.ts';
import { MarketDataProvider, TickCallback, ConnectionCallback } from './MarketDataProvider.ts';
import {
  INITIAL_NSE_SECTORS,
  INITIAL_NSE_STOCKS,
  buildInitialSectorIndex,
  buildInitialStock,
} from './nseUniverse.ts';

export class MockMarketDataProvider implements MarketDataProvider {
  public readonly id = 'nse-mock-provider';
  public readonly name = 'NSE Mock Tick Simulator';
  public readonly isSimulated = true;

  private connectionState: ConnectionState = 'DISCONNECTED';
  private tickListeners: Set<TickCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private intervalTimer: NodeJS.Timeout | null = null;
  private tickIntervalMs: number = 1500;
  private currentMarketSession: MarketSession = 'MARKET OPEN';

  private cachedSectors: Map<string, SectorIndex> = new Map();
  private cachedStocks: Map<string, Stock> = new Map();

  constructor() {
    this.resetUniverse();
  }

  public resetUniverse(): void {
    const now = Date.now();
    this.cachedSectors.clear();
    for (const def of INITIAL_NSE_SECTORS) {
      this.cachedSectors.set(def.symbol, buildInitialSectorIndex(def, now));
    }
    this.cachedStocks.clear();
    for (const def of INITIAL_NSE_STOCKS) {
      this.cachedStocks.set(def.symbol, buildInitialStock(def, now));
    }
  }

  public async connect(): Promise<void> {
    this.setConnectionState('CONNECTED');
    this.startStreaming();
  }

  public async disconnect(): Promise<void> {
    this.stopStreaming();
    this.setConnectionState('DISCONNECTED');
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public async fetchSnapshot(): Promise<{
    sectors: SectorIndex[];
    stocks: Stock[];
    marketSession: MarketSession;
    timestamp: number;
  }> {
    return {
      sectors: Array.from(this.cachedSectors.values()),
      stocks: Array.from(this.cachedStocks.values()),
      marketSession: this.currentMarketSession,
      timestamp: Date.now(),
    };
  }

  public subscribeTicks(callback: TickCallback): () => void {
    this.tickListeners.add(callback);
    return () => {
      this.tickListeners.delete(callback);
    };
  }

  public subscribeConnectionState(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    // fire initial state
    callback(this.connectionState);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  public setMarketSession(session: MarketSession): void {
    this.currentMarketSession = session;
    const tick: MarketTick = {
      type: 'SESSION_CHANGE',
      symbol: 'NSE',
      session,
      timestamp: Date.now(),
    };
    this.broadcastTick(tick);
  }

  public setTickFrequency(ms: number): void {
    this.tickIntervalMs = ms;
    if (this.connectionState === 'CONNECTED') {
      this.startStreaming();
    }
  }

  public getTickFrequency(): number {
    return this.tickIntervalMs;
  }

  // --- Simulation Actions for Demo / Testing ---

  /**
   * Swaps IT and Bank ranking to demonstrate requirement 9
   * (Rankings dynamically update with zero page refresh)
   */
  public triggerRankSwapITAndBank(): void {
    const it = this.cachedSectors.get('NIFTY IT');
    const bank = this.cachedSectors.get('NIFTY BANK');
    if (!it || !bank) return;

    const now = Date.now();
    // Swap their currentValue such that Bank is higher percent (+3.4%) and IT is lower (+2.1%)
    const newBankVal = Math.round(bank.previousClose * 1.034 * 100) / 100;
    const newItVal = Math.round(it.previousClose * 1.021 * 100) / 100;

    it.currentValue = newItVal;
    it.change = Math.round((newItVal - it.previousClose) * 100) / 100;
    it.changePercent = Math.round(((newItVal - it.previousClose) / it.previousClose) * 10000) / 100;
    it.timestamp = now;

    bank.currentValue = newBankVal;
    bank.change = Math.round((newBankVal - bank.previousClose) * 100) / 100;
    bank.changePercent = Math.round(((newBankVal - bank.previousClose) / bank.previousClose) * 10000) / 100;
    bank.timestamp = now;

    this.broadcastTick({
      type: 'SECTOR_TICK',
      symbol: 'NIFTY BANK',
      currentValue: newBankVal,
      timestamp: now,
    });
    this.broadcastTick({
      type: 'SECTOR_TICK',
      symbol: 'NIFTY IT',
      currentValue: newItVal,
      timestamp: now,
    });
  }

  /**
   * Simulates a rally in a specific stock, causing it to jump ranks
   */
  public triggerStockRally(symbol: string, percentGain: number = 4.5): void {
    const stock = this.cachedStocks.get(symbol);
    if (!stock) return;

    const now = Date.now();
    const newPrice = Math.round(stock.previousClose * (1 + percentGain / 100) * 100) / 100;
    stock.ltp = newPrice;
    stock.change = Math.round((newPrice - stock.previousClose) * 100) / 100;
    stock.changePercent = Math.round(((newPrice - stock.previousClose) / stock.previousClose) * 10000) / 100;
    stock.volume += Math.floor(Math.random() * 500000) + 100000;
    stock.timestamp = now;

    this.broadcastTick({
      type: 'STOCK_TICK',
      symbol: stock.symbol,
      ltp: newPrice,
      volume: stock.volume,
      timestamp: now,
    });
  }

  /**
   * Simulates a drop in a specific stock, causing it to sink to bottom rank
   */
  public triggerStockPlunge(symbol: string, percentDrop: number = -6.5): void {
    const stock = this.cachedStocks.get(symbol);
    if (!stock) return;

    const now = Date.now();
    const newPrice = Math.round(stock.previousClose * (1 + percentDrop / 100) * 100) / 100;
    stock.ltp = newPrice;
    stock.change = Math.round((newPrice - stock.previousClose) * 100) / 100;
    stock.changePercent = Math.round(((newPrice - stock.previousClose) / stock.previousClose) * 10000) / 100;
    stock.volume += Math.floor(Math.random() * 800000) + 200000;
    stock.timestamp = now;

    this.broadcastTick({
      type: 'STOCK_TICK',
      symbol: stock.symbol,
      ltp: newPrice,
      volume: stock.volume,
      timestamp: now,
    });
  }

  /**
   * Toggle trading halt on a security
   */
  public toggleStockHalt(symbol: string): void {
    const stock = this.cachedStocks.get(symbol);
    if (!stock) return;

    stock.isHalted = !stock.isHalted;
    stock.dataStatus = stock.isHalted ? 'HALTED' : 'MOCK';
    stock.timestamp = Date.now();

    this.broadcastTick({
      type: 'HALT_EVENT',
      symbol: stock.symbol,
      isHalted: stock.isHalted,
      timestamp: stock.timestamp,
    });
  }

  /**
   * Simulates connection drop and automatic reconnection with backoff
   */
  public simulateConnectionLossAndRecovery(reconnectDelayMs: number = 3500): void {
    this.stopStreaming();
    this.setConnectionState('DISCONNECTED');

    // After 1.5s transition to RECONNECTING
    setTimeout(() => {
      this.setConnectionState('RECONNECTING');

      // Then reconnect
      setTimeout(() => {
        this.setConnectionState('CONNECTED');
        this.startStreaming();
      }, reconnectDelayMs - 1500);
    }, 1500);
  }

  // --- Internal Tick Engine ---

  private startStreaming(): void {
    this.stopStreaming();
    if (this.tickIntervalMs <= 0) return; // paused

    this.intervalTimer = setInterval(() => {
      this.generateIncrementalTick();
    }, this.tickIntervalMs);
  }

  private stopStreaming(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    for (const listener of this.connectionListeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in connection listener', err);
      }
    }
  }

  private broadcastTick(tick: MarketTick): void {
    for (const listener of this.tickListeners) {
      try {
        listener(tick);
      } catch (err) {
        console.error('Error in tick listener', err);
      }
    }
  }

  private generateIncrementalTick(): void {
    if (this.connectionState !== 'CONNECTED' || this.currentMarketSession === 'MARKET CLOSED') {
      return;
    }

    const now = Date.now();
    const stocksArray = Array.from(this.cachedStocks.values()).filter(s => !s.isHalted);
    const sectorsArray = Array.from(this.cachedSectors.values());

    // 80% chance stock tick, 20% chance sector tick
    const isStockTick = Math.random() < 0.8;

    if (isStockTick && stocksArray.length > 0) {
      const targetStock = stocksArray[Math.floor(Math.random() * stocksArray.length)];
      // Subtle realistic delta: between -0.3% and +0.3%
      const deltaPercent = (Math.random() - 0.49) * 0.4;
      const priceDelta = targetStock.ltp * (deltaPercent / 100);
      const newLtp = Math.max(1, Math.round((targetStock.ltp + priceDelta) * 100) / 100);
      const volDelta = Math.floor(Math.random() * 25000) + 500;

      targetStock.ltp = newLtp;
      targetStock.change = Math.round((newLtp - targetStock.previousClose) * 100) / 100;
      targetStock.changePercent = Math.round(((newLtp - targetStock.previousClose) / targetStock.previousClose) * 10000) / 100;
      targetStock.volume += volDelta;
      targetStock.timestamp = now;

      this.broadcastTick({
        type: 'STOCK_TICK',
        symbol: targetStock.symbol,
        ltp: newLtp,
        volume: targetStock.volume,
        timestamp: now,
      });
    } else if (sectorsArray.length > 0) {
      const targetSector = sectorsArray[Math.floor(Math.random() * sectorsArray.length)];
      const deltaPercent = (Math.random() - 0.49) * 0.2;
      const indexDelta = targetSector.currentValue * (deltaPercent / 100);
      const newVal = Math.max(10, Math.round((targetSector.currentValue + indexDelta) * 100) / 100);

      targetSector.currentValue = newVal;
      targetSector.change = Math.round((newVal - targetSector.previousClose) * 100) / 100;
      targetSector.changePercent = Math.round(((newVal - targetSector.previousClose) / targetSector.previousClose) * 10000) / 100;
      targetSector.timestamp = now;

      this.broadcastTick({
        type: 'SECTOR_TICK',
        symbol: targetSector.symbol,
        currentValue: newVal,
        timestamp: now,
      });
    }
  }
}
