import { Stock, StrategyConfig, TieBreakerRule } from './types.ts';

export interface StockRankItem {
  stock: Stock;
  rankInSector: number; // 1-based rank within this sector
  sortKey: number;
}

export class StockRankingEngine {
  /**
   * Deterministic comparator for stocks
   * order: 'DESC' (top performers) or 'ASC' (bottom performers)
   */
  public static compareStocks(
    a: Stock,
    b: Stock,
    order: 'DESC' | 'ASC',
    rule: TieBreakerRule = 'changePercent_absoluteChange_symbol'
  ): number {
    // Exclude or rank lower halted stocks or N/A stocks
    const aValid = !Number.isNaN(a.changePercent) && a.dataStatus !== 'N/A' && !a.isHalted;
    const bValid = !Number.isNaN(b.changePercent) && b.dataStatus !== 'N/A' && !b.isHalted;

    if (!aValid && !bValid) return a.symbol.localeCompare(b.symbol);
    if (!aValid) return 1;
    if (!bValid) return -1;

    // 1. Primary: changePercent
    if (a.changePercent !== b.changePercent) {
      return order === 'DESC'
        ? b.changePercent - a.changePercent
        : a.changePercent - b.changePercent;
    }

    // 2. Secondary tie-breaker
    if (rule === 'changePercent_volume_symbol') {
      if (a.volume !== b.volume) {
        return b.volume - a.volume; // higher volume wins tie
      }
    } else {
      // default: absolute change
      if (a.change !== b.change) {
        return order === 'DESC' ? b.change - a.change : a.change - b.change;
      }
    }

    // 3. Deterministic alphabetical fallback by symbol
    return a.symbol.localeCompare(b.symbol);
  }

  /**
   * Filter eligible NSE-listed stocks belonging to a specific sector.
   * Eligible stocks: exchange === 'NSE', sector matches, not halted (or handled with note).
   */
  public static getEligibleStocksForSector(
    allStocks: Stock[],
    sectorSymbol: string
  ): Stock[] {
    return allStocks.filter(
      (s) => s.exchange === 'NSE' && s.sector.toUpperCase() === sectorSymbol.toUpperCase()
    );
  }

  /**
   * Rank and select top stocks within a sector (changePercent DESC)
   */
  public static selectTopStocksForSector(
    stocks: Stock[],
    count: number,
    config: StrategyConfig
  ): { ranked: StockRankItem[]; availableCount: number } {
    const validStocks = stocks.filter(s => !s.isHalted && s.dataStatus !== 'N/A');
    const sorted = [...validStocks].sort((a, b) =>
      this.compareStocks(a, b, 'DESC', config.tieBreaker)
    );

    const ranked: StockRankItem[] = sorted.slice(0, count).map((stock, idx) => ({
      stock,
      rankInSector: idx + 1,
      sortKey: stock.changePercent,
    }));

    return {
      ranked,
      availableCount: validStocks.length,
    };
  }

  /**
   * Rank and select bottom stocks within a sector (changePercent ASC)
   */
  public static selectBottomStocksForSector(
    stocks: Stock[],
    count: number,
    config: StrategyConfig
  ): { ranked: StockRankItem[]; availableCount: number } {
    const validStocks = stocks.filter(s => !s.isHalted && s.dataStatus !== 'N/A');
    const sorted = [...validStocks].sort((a, b) =>
      this.compareStocks(a, b, 'ASC', config.tieBreaker)
    );

    const ranked: StockRankItem[] = sorted.slice(0, count).map((stock, idx) => ({
      stock,
      rankInSector: idx + 1, // #1 lowest, #2 lowest, etc.
      sortKey: stock.changePercent,
    }));

    return {
      ranked,
      availableCount: validStocks.length,
    };
  }
}
