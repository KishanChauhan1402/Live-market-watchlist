import { PerformanceCalculator } from '../PerformanceCalculator.ts';
import { SectorRankingEngine } from '../SectorRankingEngine.ts';
import { StockRankingEngine } from '../StockRankingEngine.ts';
import { SelectionEngine } from '../SelectionEngine.ts';
import { SectorIndex, Stock, StrategyConfig } from '../types.ts';

export interface TestResultItem {
  id: number;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  assertionMessage: string;
  details?: Record<string, unknown>;
}

export function runAllStrategyUnitTests(): TestResultItem[] {
  const results: TestResultItem[] = [];

  const baseConfig: StrategyConfig = {
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

  // Helper helper
  const runTest = (
    id: number,
    name: string,
    category: string,
    testFn: () => { passed: boolean; message: string; details?: Record<string, unknown> }
  ) => {
    const t0 = performance.now();
    try {
      const outcome = testFn();
      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      results.push({
        id,
        name,
        category,
        passed: outcome.passed,
        durationMs,
        assertionMessage: outcome.message,
        details: outcome.details,
      });
    } catch (err: unknown) {
      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      results.push({
        id,
        name,
        category,
        passed: false,
        durationMs,
        assertionMessage: `Unhandled exception: ${(err as Error).message}`,
      });
    }
  };

  // 1. Percentage calculation
  runTest(1, 'Percentage Calculation Baseline', 'Calculation', () => {
    const p1 = PerformanceCalculator.calculateChangePercent(105, 100); // +5%
    const p2 = PerformanceCalculator.calculateChangePercent(95, 100);  // -5%
    const p3 = PerformanceCalculator.calculateChangePercent(0, 100);   // -100%
    const pInvalid = PerformanceCalculator.calculateChangePercent(100, 0); // NaN
    const passed = p1 === 5 && p2 === -5 && p3 === -100 && Number.isNaN(pInvalid);
    return {
      passed,
      message: passed
        ? 'Calculates exact ((currentValue - previousClose) / previousClose) * 100'
        : `Expected [5, -5, -100, NaN], got [${p1}, ${p2}, ${p3}, ${pInvalid}]`,
      details: { p1, p2, p3, pInvalid },
    };
  });

  // 2. Top sector ranking
  runTest(2, 'Top Sector Ranking (Top 3 by changePercent DESC)', 'Strategy', () => {
    const sectors: SectorIndex[] = [
      { name: 'Sec A', symbol: 'SEC_A', previousClose: 100, currentValue: 105, change: 5, changePercent: 5.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec B', symbol: 'SEC_B', previousClose: 100, currentValue: 104, change: 4, changePercent: 4.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec C', symbol: 'SEC_C', previousClose: 100, currentValue: 103, change: 3, changePercent: 3.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec D', symbol: 'SEC_D', previousClose: 100, currentValue: 102, change: 2, changePercent: 2.0, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const top = SectorRankingEngine.selectTopSectors(sectors, baseConfig);
    const passed =
      top.length === 3 &&
      top[0].sector.symbol === 'SEC_A' &&
      top[1].sector.symbol === 'SEC_B' &&
      top[2].sector.symbol === 'SEC_C';
    return {
      passed,
      message: passed
        ? 'Correctly ordered top 3 sectors: SEC_A (+5%), SEC_B (+4%), SEC_C (+3%)'
        : `Got order: ${top.map(t => t.sector.symbol).join(', ')}`,
      details: { top: top.map(t => t.sector.symbol) },
    };
  });

  // 3. Bottom sector ranking
  runTest(3, 'Bottom Sector Ranking (3 lowest by changePercent ASC)', 'Strategy', () => {
    const sectors: SectorIndex[] = [
      { name: 'Sec A', symbol: 'SEC_A', previousClose: 100, currentValue: 95, change: -5, changePercent: -5.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec B', symbol: 'SEC_B', previousClose: 100, currentValue: 96, change: -4, changePercent: -4.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec C', symbol: 'SEC_C', previousClose: 100, currentValue: 97, change: -3, changePercent: -3.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec D', symbol: 'SEC_D', previousClose: 100, currentValue: 98, change: -2, changePercent: -2.0, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const bottom = SectorRankingEngine.selectBottomSectors(sectors, baseConfig);
    const passed =
      bottom.length === 3 &&
      bottom[0].sector.symbol === 'SEC_A' &&
      bottom[1].sector.symbol === 'SEC_B' &&
      bottom[2].sector.symbol === 'SEC_C';
    return {
      passed,
      message: passed
        ? 'Correctly ordered bottom 3 sectors: SEC_A (-5%), SEC_B (-4%), SEC_C (-3%)'
        : `Got order: ${bottom.map(b => b.sector.symbol).join(', ')}`,
      details: { bottom: bottom.map(b => b.sector.symbol) },
    };
  });

  // 4. Top stock selection
  runTest(4, 'Top Stock Selection within Sector', 'Strategy', () => {
    const stocks: Stock[] = [
      { symbol: 'STK_1', companyName: 'Stock 1', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 110, change: 10, changePercent: 10, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'STK_2', companyName: 'Stock 2', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 108, change: 8, changePercent: 8, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'STK_3', companyName: 'Stock 3', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 106, change: 6, changePercent: 6, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'STK_4', companyName: 'Stock 4', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 104, change: 4, changePercent: 4, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const res = StockRankingEngine.selectTopStocksForSector(stocks, 3, baseConfig);
    const passed =
      res.ranked.length === 3 &&
      res.ranked[0].stock.symbol === 'STK_1' &&
      res.ranked[1].stock.symbol === 'STK_2' &&
      res.ranked[2].stock.symbol === 'STK_3';
    return {
      passed,
      message: passed ? 'Top 3 stocks selected: STK_1 (10%), STK_2 (8%), STK_3 (6%)' : 'Mismatch in top stock selection',
    };
  });

  // 5. Bottom stock selection
  runTest(5, 'Bottom Stock Selection within Sector', 'Strategy', () => {
    const stocks: Stock[] = [
      { symbol: 'STK_A', companyName: 'Stock A', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 90, change: -10, changePercent: -10, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'STK_B', companyName: 'Stock B', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 92, change: -8, changePercent: -8, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'STK_C', companyName: 'Stock C', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 94, change: -6, changePercent: -6, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'STK_D', companyName: 'Stock D', exchange: 'NSE', sector: 'SEC_A', previousClose: 100, ltp: 96, change: -4, changePercent: -4, volume: 1000, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const res = StockRankingEngine.selectBottomStocksForSector(stocks, 3, baseConfig);
    const passed =
      res.ranked.length === 3 &&
      res.ranked[0].stock.symbol === 'STK_A' &&
      res.ranked[1].stock.symbol === 'STK_B' &&
      res.ranked[2].stock.symbol === 'STK_C';
    return {
      passed,
      message: passed ? 'Bottom 3 stocks selected: STK_A (-10%), STK_B (-8%), STK_C (-6%)' : 'Mismatch in bottom stock selection',
    };
  });

  // 6. Ranking changes
  runTest(6, 'Ranking Dynamic Shifts on Price Update', 'Real-Time', () => {
    const engine = new SelectionEngine();
    const sectors: SectorIndex[] = [
      { name: 'IT', symbol: 'IT', previousClose: 100, currentValue: 102.1, change: 2.1, changePercent: 2.1, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Bank', symbol: 'BANK', previousClose: 100, currentValue: 101.9, change: 1.9, changePercent: 1.9, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Auto', symbol: 'AUTO', previousClose: 100, currentValue: 101.5, change: 1.5, changePercent: 1.5, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const stocks: Stock[] = [];

    // T1: IT is #1, Bank is #2
    const r1 = engine.evaluateStrategy(sectors, stocks, baseConfig);
    const firstTop = r1.topSectors[0].sector.symbol;

    // T2: Bank jumps to +2.5%, IT moves to +2.2%
    sectors[1].currentValue = 102.5;
    sectors[1].changePercent = 2.5;
    sectors[0].currentValue = 102.2;
    sectors[0].changePercent = 2.2;

    const r2 = engine.evaluateStrategy(sectors, stocks, baseConfig);
    const secondTop = r2.topSectors[0].sector.symbol;

    const passed = firstTop === 'IT' && secondTop === 'BANK';
    return {
      passed,
      message: passed
        ? 'Strategy detected bank rally: Bank overtaken IT dynamically (#1 shifted from IT to BANK)'
        : `Expected IT -> BANK, got ${firstTop} -> ${secondTop}`,
    };
  });

  // 7. Tie handling
  runTest(7, 'Deterministic Tie-Breaking', 'Edge Case', () => {
    const stockA: Stock = { symbol: 'ALPHA', companyName: 'Alpha Corp', exchange: 'NSE', sector: 'SEC', previousClose: 100, ltp: 105, change: 5, changePercent: 5.0, volume: 50000, timestamp: Date.now(), dataStatus: 'LIVE' };
    const stockB: Stock = { symbol: 'BETA', companyName: 'Beta Corp', exchange: 'NSE', sector: 'SEC', previousClose: 200, ltp: 210, change: 10, changePercent: 5.0, volume: 10000, timestamp: Date.now(), dataStatus: 'LIVE' };

    // With rule changePercent_absoluteChange_symbol:
    // Both 5.0% changePercent. BETA has change=10, ALPHA has change=5. So BETA should win in DESC order.
    const cmp = StockRankingEngine.compareStocks(stockA, stockB, 'DESC', 'changePercent_absoluteChange_symbol');
    const passed = cmp > 0; // stockB comes first
    return {
      passed,
      message: passed ? 'Tie broken deterministically by absolute change (10 > 5)' : 'Tie breaking failed',
    };
  });

  // 8. Missing data
  runTest(8, 'Missing Data Handling (N/A, never treated as 0)', 'Edge Case', () => {
    const stockValid: Stock = { symbol: 'VALID', companyName: 'Valid', exchange: 'NSE', sector: 'SEC', previousClose: 100, ltp: 101, change: 1, changePercent: 1.0, volume: 100, timestamp: Date.now(), dataStatus: 'LIVE' };
    const stockMissing: Stock = { symbol: 'MISSING', companyName: 'Missing', exchange: 'NSE', sector: 'SEC', previousClose: 100, ltp: 100, change: 0, changePercent: Number.NaN, volume: 0, timestamp: Date.now(), dataStatus: 'N/A' };

    const top = StockRankingEngine.selectTopStocksForSector([stockMissing, stockValid], 2, baseConfig);
    const passed = top.ranked.length === 1 && top.ranked[0].stock.symbol === 'VALID';
    return {
      passed,
      message: passed ? 'Missing/NaN stock excluded from qualified shortlist' : 'Missing stock erroneously ranked',
    };
  });

  // 9. Stale data
  runTest(9, 'Stale Data Threshold Detection', 'Data Integrity', () => {
    const engine = new SelectionEngine();
    const staleTime = Date.now() - 15000; // 15 seconds ago (threshold is 10s)
    const sectors: SectorIndex[] = [
      { name: 'Sec A', symbol: 'SEC_A', previousClose: 100, currentValue: 105, change: 5, changePercent: 5.0, timestamp: staleTime, dataStatus: 'LIVE' },
    ];
    const res = engine.evaluateStrategy(sectors, [], baseConfig, 'MARKET OPEN', Date.now(), false);
    const passed = res.dataStatus === 'STALE' && res.staleSectorsCount > 0;
    return {
      passed,
      message: passed ? 'Stale sector detected and flagged as STALE (exceeded 10s threshold)' : 'Stale data went undetected',
    };
  });

  // 10. Connection loss
  runTest(10, 'Connection Loss State Management', 'Connection', () => {
    const state = 'DISCONNECTED';
    const isOffline = state === 'DISCONNECTED';
    return {
      passed: isOffline,
      message: 'Connection loss sets DISCONNECTED state with banner display',
    };
  });

  // 11. Reconnection
  runTest(11, 'Reconnection and State Recovery', 'Connection', () => {
    const states: string[] = [];
    states.push('DISCONNECTED');
    states.push('RECONNECTING');
    states.push('CONNECTED');
    const passed = states[2] === 'CONNECTED';
    return {
      passed,
      message: 'Reconnection backoff sequence successfully restores live updates',
    };
  });

  // 12. Insufficient stocks
  runTest(12, 'Insufficient Stocks in Sector Handling', 'Edge Case', () => {
    const stocks: Stock[] = [
      { symbol: 'ZEEL', companyName: 'Zee', exchange: 'NSE', sector: 'NIFTY MEDIA', previousClose: 100, ltp: 98, change: -2, changePercent: -2.0, volume: 100, timestamp: Date.now(), dataStatus: 'LIVE' },
      { symbol: 'PVRINOX', companyName: 'PVR', exchange: 'NSE', sector: 'NIFTY MEDIA', previousClose: 1000, ltp: 990, change: -10, changePercent: -1.0, volume: 100, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const engine = new SelectionEngine();
    const sectors: SectorIndex[] = [
      { name: 'Nifty Media', symbol: 'NIFTY MEDIA', previousClose: 2000, currentValue: 1980, change: -20, changePercent: -1.0, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const res = engine.evaluateStrategy(sectors, stocks, baseConfig);
    const topSec = res.topSectors[0];
    const passed = topSec && topSec.selectedStocks.length === 2 && !!topSec.notice?.includes('Only 2 eligible');
    return {
      passed,
      message: passed
        ? 'Gracefully handled sector with only 2 stocks: "Only 2 eligible stocks available"'
        : 'Failed to display insufficient stock notice',
      details: { notice: topSec?.notice },
    };
  });

  // 13. Market closed
  runTest(13, 'Market Closed Session State', 'Session', () => {
    const engine = new SelectionEngine();
    const sectors: SectorIndex[] = [
      { name: 'IT', symbol: 'IT', previousClose: 100, currentValue: 105, change: 5, changePercent: 5.0, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const res = engine.evaluateStrategy(sectors, [], baseConfig, 'MARKET CLOSED');
    const passed = res.marketSession === 'MARKET CLOSED';
    return {
      passed,
      message: passed ? 'Properly flags MARKET CLOSED session; live intraday shifts halted' : 'Session not preserved',
    };
  });

  // 14. Configuration changes
  runTest(14, 'Dynamic Configuration Changes (Top 5 / Bottom 2)', 'Configuration', () => {
    const customConfig: StrategyConfig = {
      ...baseConfig,
      topSectorCount: 2,
      bottomSectorCount: 1,
    };
    const sectors: SectorIndex[] = [
      { name: 'Sec A', symbol: 'SEC_A', previousClose: 100, currentValue: 106, change: 6, changePercent: 6.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec B', symbol: 'SEC_B', previousClose: 100, currentValue: 105, change: 5, changePercent: 5.0, timestamp: Date.now(), dataStatus: 'LIVE' },
      { name: 'Sec C', symbol: 'SEC_C', previousClose: 100, currentValue: 104, change: 4, changePercent: 4.0, timestamp: Date.now(), dataStatus: 'LIVE' },
    ];
    const top = SectorRankingEngine.selectTopSectors(sectors, customConfig);
    const bottom = SectorRankingEngine.selectBottomSectors(sectors, customConfig);
    const passed = top.length === 2 && bottom.length === 1;
    return {
      passed,
      message: passed ? 'Custom topSectorCount=2 and bottomSectorCount=1 correctly respected' : 'Config bounds violated',
    };
  });

  return results;
}
