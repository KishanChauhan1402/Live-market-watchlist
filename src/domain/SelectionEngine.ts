import { PerformanceCalculator } from './PerformanceCalculator.ts';
import { SectorRankingEngine } from './SectorRankingEngine.ts';
import { StockRankingEngine } from './StockRankingEngine.ts';
import {
  DataStatus,
  MarketSession,
  SectorIndex,
  SelectedSectorItem,
  SelectedStockItem,
  Stock,
  StrategyConfig,
  StrategyExecutionResult,
} from './types.ts';

export class SelectionEngine {
  private previousTopSectorSymbols: string[] = [];
  private previousBottomSectorSymbols: string[] = [];
  private previousStockRanks: Map<string, number> = new Map();

  /**
   * Evaluates the complete watchlist strategy over current market state.
   */
  public evaluateStrategy(
    sectors: SectorIndex[],
    stocks: Stock[],
    config: StrategyConfig,
    marketSession: MarketSession = 'MARKET OPEN',
    currentTimestamp: number = Date.now(),
    isMockSource: boolean = false
  ): StrategyExecutionResult {
    const announcements: string[] = [];

    // 1. Audit Stale Status
    const staleThresholdMs = config.staleThresholdSeconds * 1000;
    let staleSectorsCount = 0;
    let staleStocksCount = 0;

    const auditedSectors = sectors.map((sec) => {
      const isStale = currentTimestamp - sec.timestamp > staleThresholdMs;
      if (isStale) staleSectorsCount++;

      let status: DataStatus = sec.dataStatus;
      if (isMockSource) {
        status = 'MOCK';
      } else if (isStale && status !== 'N/A') {
        status = 'STALE';
      }

      return {
        ...sec,
        dataStatus: status,
      };
    });

    const auditedStocks = stocks.map((stk) => {
      const isStale = currentTimestamp - stk.timestamp > staleThresholdMs;
      if (isStale) staleStocksCount++;

      let status: DataStatus = stk.dataStatus;
      if (isMockSource) {
        status = 'MOCK';
      } else if (stk.isHalted) {
        status = 'HALTED';
      } else if (isStale && status !== 'N/A') {
        status = 'STALE';
      }

      return {
        ...stk,
        dataStatus: status,
      };
    });

    // 2. Rank Sectors
    const allRankedSectors = SectorRankingEngine.rankAllSectors(auditedSectors, config);
    const topSectorRanks = SectorRankingEngine.selectTopSectors(auditedSectors, config);
    const bottomSectorRanks = SectorRankingEngine.selectBottomSectors(auditedSectors, config);

    // Track sector structural shifts for announcements
    const currentTopSymbols = topSectorRanks.map((s) => s.sector.symbol);
    if (this.previousTopSectorSymbols.length > 0) {
      topSectorRanks.forEach((item, idx) => {
        const prevIdx = this.previousTopSectorSymbols.indexOf(item.sector.symbol);
        if (prevIdx === -1) {
          announcements.push(
            `Sector ${item.sector.name} entered Top Sectors at rank #${idx + 1}`
          );
        } else if (prevIdx !== idx) {
          announcements.push(
            `Sector ${item.sector.name} moved from rank #${prevIdx + 1} to rank #${idx + 1}`
          );
        }
      });
    }
    this.previousTopSectorSymbols = currentTopSymbols;

    const currentBottomSymbols = bottomSectorRanks.map((s) => s.sector.symbol);
    if (this.previousBottomSectorSymbols.length > 0) {
      bottomSectorRanks.forEach((item, idx) => {
        const prevIdx = this.previousBottomSectorSymbols.indexOf(item.sector.symbol);
        if (prevIdx === -1) {
          announcements.push(
            `Sector ${item.sector.name} entered Bottom Sectors at rank #${idx + 1} lowest`
          );
        } else if (prevIdx !== idx) {
          announcements.push(
            `Sector ${item.sector.name} shifted to bottom rank #${idx + 1} lowest`
          );
        }
      });
    }
    this.previousBottomSectorSymbols = currentBottomSymbols;

    // 3. Process TOP SECTORS and their TOP STOCKS
    const topSectors: SelectedSectorItem[] = topSectorRanks.map((secRank) => {
      const sectorStocks = StockRankingEngine.getEligibleStocksForSector(
        auditedStocks,
        secRank.sector.symbol
      );

      const { ranked, availableCount } = StockRankingEngine.selectTopStocksForSector(
        sectorStocks,
        config.topStocksPerSector,
        config
      );

      let notice: string | undefined;
      if (availableCount < config.topStocksPerSector) {
        notice = `Only ${availableCount} eligible stock${availableCount === 1 ? '' : 's'} available in this sector.`;
      }

      const selectedStocks: SelectedStockItem[] = ranked.map((item) => {
        const prevRank = this.previousStockRanks.get(
          `TOP_${secRank.sector.symbol}_${item.stock.symbol}`
        );
        const rankDelta = prevRank !== undefined ? prevRank - item.rankInSector : 0;
        this.previousStockRanks.set(
          `TOP_${secRank.sector.symbol}_${item.stock.symbol}`,
          item.rankInSector
        );

        return {
          stock: item.stock,
          previousRank: prevRank,
          rankDelta,
          reason: {
            selectionSide: 'TOP',
            sectorSymbol: secRank.sector.symbol,
            sectorName: secRank.sector.name,
            sectorRank: secRank.rank,
            totalSectorsConsidered: auditedSectors.length,
            sectorPerformance: secRank.sector.changePercent,
            stockRankInSector: item.rankInSector,
            totalEligibleStocksInSector: availableCount,
            stockPerformance: item.stock.changePercent,
            previousClose: item.stock.previousClose,
            currentPrice: item.stock.ltp,
            absoluteChange: item.stock.change,
            calculationFormula: `((₹${item.stock.ltp} - ₹${item.stock.previousClose}) / ₹${item.stock.previousClose}) * 100 = ${PerformanceCalculator.formatPercent(item.stock.changePercent)}`,
            selectedAt: currentTimestamp,
            note: `Selected as Top #${item.rankInSector} performer in ${secRank.sector.name} (#${secRank.rank} overall sector).`,
          },
        };
      });

      return {
        sector: secRank.sector,
        rank: secRank.rank,
        selectedStocks,
        availableStockCount: availableCount,
        notice,
      };
    });

    // 4. Process BOTTOM SECTORS and their BOTTOM STOCKS
    const bottomSectors: SelectedSectorItem[] = bottomSectorRanks.map((secRank) => {
      const sectorStocks = StockRankingEngine.getEligibleStocksForSector(
        auditedStocks,
        secRank.sector.symbol
      );

      const { ranked, availableCount } = StockRankingEngine.selectBottomStocksForSector(
        sectorStocks,
        config.bottomStocksPerSector,
        config
      );

      let notice: string | undefined;
      if (availableCount < config.bottomStocksPerSector) {
        notice = `Only ${availableCount} eligible stock${availableCount === 1 ? '' : 's'} available in this sector.`;
      }

      const selectedStocks: SelectedStockItem[] = ranked.map((item) => {
        const prevRank = this.previousStockRanks.get(
          `BOTTOM_${secRank.sector.symbol}_${item.stock.symbol}`
        );
        const rankDelta = prevRank !== undefined ? prevRank - item.rankInSector : 0;
        this.previousStockRanks.set(
          `BOTTOM_${secRank.sector.symbol}_${item.stock.symbol}`,
          item.rankInSector
        );

        return {
          stock: item.stock,
          previousRank: prevRank,
          rankDelta,
          reason: {
            selectionSide: 'BOTTOM',
            sectorSymbol: secRank.sector.symbol,
            sectorName: secRank.sector.name,
            sectorRank: secRank.rank, // #1 lowest, #2 lowest, etc.
            totalSectorsConsidered: auditedSectors.length,
            sectorPerformance: secRank.sector.changePercent,
            stockRankInSector: item.rankInSector,
            totalEligibleStocksInSector: availableCount,
            stockPerformance: item.stock.changePercent,
            previousClose: item.stock.previousClose,
            currentPrice: item.stock.ltp,
            absoluteChange: item.stock.change,
            calculationFormula: `((₹${item.stock.ltp} - ₹${item.stock.previousClose}) / ₹${item.stock.previousClose}) * 100 = ${PerformanceCalculator.formatPercent(item.stock.changePercent)}`,
            selectedAt: currentTimestamp,
            note: `Selected as #${item.rankInSector} lowest performer in ${secRank.sector.name} (#${secRank.rank} lowest performing sector).`,
          },
        };
      });

      return {
        sector: secRank.sector,
        rank: secRank.rank,
        selectedStocks,
        availableStockCount: availableCount,
        notice,
      };
    });

    // 5. Determine Overall Data Status
    let overallDataStatus: DataStatus = 'LIVE';
    if (isMockSource) {
      overallDataStatus = 'MOCK';
    } else if (marketSession === 'DATA UNAVAILABLE') {
      overallDataStatus = 'N/A';
    } else if (staleSectorsCount > 0 || staleStocksCount > 0) {
      overallDataStatus = 'STALE';
    }

    return {
      timestamp: currentTimestamp,
      marketSession,
      dataStatus: overallDataStatus,
      topSectors,
      bottomSectors,
      allSectorsRanked: allRankedSectors.map((r) => r.sector),
      staleSectorsCount,
      staleStocksCount,
      announcementEvents: announcements,
    };
  }

  /**
   * Reset rank cache (e.g. on provider switch or config change)
   */
  public resetRankCache(): void {
    this.previousTopSectorSymbols = [];
    this.previousBottomSectorSymbols = [];
    this.previousStockRanks.clear();
  }
}
