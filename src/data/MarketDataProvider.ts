import {
  ConnectionState,
  MarketSession,
  MarketTick,
  SectorIndex,
  Stock,
} from '../domain/types.ts';

export type TickCallback = (tick: MarketTick) => void;
export type ConnectionCallback = (state: ConnectionState) => void;

/**
 * Universal Market Data Provider contract.
 * Any licensed vendor (e.g. Thomson Reuters / Refinitiv, Bloomberg, NSE NOW, Zerodha Kite Connect, TrueData)
 * or mock provider implements this interface without altering downstream ranking or UI components.
 */
export interface MarketDataProvider {
  readonly id: string;
  readonly name: string;
  readonly isSimulated: boolean;

  /**
   * Initializes network/stream connection to market provider
   */
  connect(): Promise<void>;

  /**
   * Gracefully terminates stream connection
   */
  disconnect(): Promise<void>;

  /**
   * Current network connection state
   */
  getConnectionState(): ConnectionState;

  /**
   * Fetch initial universe snapshot of NSE sectors and stocks
   */
  fetchSnapshot(): Promise<{
    sectors: SectorIndex[];
    stocks: Stock[];
    marketSession: MarketSession;
    timestamp: number;
  }>;

  /**
   * Subscribe to real-time market ticks (increments)
   */
  subscribeTicks(callback: TickCallback): () => void;

  /**
   * Subscribe to connection status state transitions
   */
  subscribeConnectionState(callback: ConnectionCallback): () => void;

  /**
   * Optional manual session update
   */
  setMarketSession?(session: MarketSession): void;
}
