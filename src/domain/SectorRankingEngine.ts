import { SectorIndex, StrategyConfig, TieBreakerRule } from './types.ts';

export interface SectorRankItem {
  sector: SectorIndex;
  rank: number; // 1-based
  sortKey: number;
}

export class SectorRankingEngine {
  /**
   * Deterministic comparator for sector ranking
   * order: 'DESC' (top performers) or 'ASC' (bottom performers)
   */
  public static compareSectors(
    a: SectorIndex,
    b: SectorIndex,
    order: 'DESC' | 'ASC',
    rule: TieBreakerRule = 'changePercent_absoluteChange_symbol'
  ): number {
    const aValid = !Number.isNaN(a.changePercent) && a.dataStatus !== 'N/A';
    const bValid = !Number.isNaN(b.changePercent) && b.dataStatus !== 'N/A';

    // Invalid sectors sink to the bottom in both orders
    if (!aValid && !bValid) return a.symbol.localeCompare(b.symbol);
    if (!aValid) return 1;
    if (!bValid) return -1;

    // Primary: changePercent
    if (a.changePercent !== b.changePercent) {
      return order === 'DESC'
        ? b.changePercent - a.changePercent
        : a.changePercent - b.changePercent;
    }

    // Tie breaker
    if (rule === 'changePercent_absoluteChange_symbol') {
      if (a.change !== b.change) {
        return order === 'DESC' ? b.change - a.change : a.change - b.change;
      }
    }

    // Final deterministic fallback: symbol alphabetical
    return a.symbol.localeCompare(b.symbol);
  }

  /**
   * Ranks all sectors by changePercent DESC
   */
  public static rankAllSectors(
    sectors: SectorIndex[],
    config: StrategyConfig
  ): SectorRankItem[] {
    const sorted = [...sectors].sort((a, b) =>
      this.compareSectors(a, b, 'DESC', config.tieBreaker)
    );

    return sorted.map((sector, idx) => ({
      sector,
      rank: idx + 1,
      sortKey: sector.changePercent,
    }));
  }

  /**
   * Selects Top N sectors (changePercent DESC)
   */
  public static selectTopSectors(
    sectors: SectorIndex[],
    config: StrategyConfig
  ): SectorRankItem[] {
    const allRanked = this.rankAllSectors(sectors, config);
    return allRanked.slice(0, Math.min(config.topSectorCount, allRanked.length));
  }

  /**
   * Selects Bottom N sectors (changePercent ASC)
   */
  public static selectBottomSectors(
    sectors: SectorIndex[],
    config: StrategyConfig
  ): SectorRankItem[] {
    const sortedAsc = [...sectors].sort((a, b) =>
      this.compareSectors(a, b, 'ASC', config.tieBreaker)
    );

    return sortedAsc
      .slice(0, Math.min(config.bottomSectorCount, sortedAsc.length))
      .map((sector, idx) => ({
        sector,
        rank: idx + 1, // rank #1 lowest, #2 lowest, #3 lowest
        sortKey: sector.changePercent,
      }));
  }
}
