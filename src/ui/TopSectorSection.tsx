import React from 'react';
import { SelectedSectorItem, SelectedStockItem } from '../domain/types.ts';
import { PerformanceCalculator } from '../domain/PerformanceCalculator.ts';
import { StockTable } from './StockTable.tsx';
import { TrendingUp, ArrowUpRight, AlertCircle } from 'lucide-react';

interface TopSectorSectionProps {
  topSectors: SelectedSectorItem[];
  onSelectStock: (item: SelectedStockItem) => void;
}

export const TopSectorSection: React.FC<TopSectorSectionProps> = ({
  topSectors,
  onSelectStock,
}) => {
  return (
    <section
      aria-labelledby="top-sectors-heading"
      className="bg-[#0F172A]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg flex flex-col"
    >
      {/* Section Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 id="top-sectors-heading" className="text-sm font-bold text-white tracking-wide uppercase">
              Top Performing Sectors
            </h2>
            <p className="text-[11px] text-slate-400">
              Highest session gainers on NSE &amp; top stocks within each sector
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded">
          Top {topSectors.length}
        </span>
      </div>

      {/* Sector Blocks */}
      <div className="p-4 space-y-4">
        {topSectors.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Evaluating sector indices...
          </div>
        ) : (
          topSectors.map((sectorItem) => {
            const { sector, rank, selectedStocks, notice } = sectorItem;
            const isPositive = sector.changePercent > 0;

            return (
              <div
                key={sector.symbol}
                className="bg-slate-950/50 border border-slate-800/90 rounded-lg p-3.5 hover:border-slate-700/80 transition-all"
              >
                {/* Sector Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                      #{rank}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-white font-mono">{sector.name}</span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">({sector.symbol})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-slate-400 hidden sm:block">
                      Prev: <span className="text-slate-300">₹{PerformanceCalculator.formatINR(sector.previousClose)}</span>
                    </div>
                    <div className="text-slate-400 hidden sm:block">
                      Current: <span className="text-white font-semibold">₹{PerformanceCalculator.formatINR(sector.currentValue)}</span>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 font-bold text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                      aria-label={`${sector.name} return ${PerformanceCalculator.formatPercent(sector.changePercent)}`}
                    >
                      <span>{PerformanceCalculator.formatPercent(sector.changePercent)}</span>
                      {isPositive && <ArrowUpRight className="w-4 h-4" aria-hidden="true" />}
                    </div>
                  </div>
                </div>

                {/* Insufficient Stock Notice if applicable */}
                {notice && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-sans text-amber-400/90 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 rounded">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{notice}</span>
                  </div>
                )}

                {/* Selected Stocks in Sector */}
                <div className="mt-3">
                  <StockTable
                    items={selectedStocks}
                    sectorSymbol={sector.symbol}
                    selectionSide="TOP"
                    onSelectStock={onSelectStock}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
