import React from 'react';
import { SectorIndex } from '../domain/types.ts';
import { PerformanceCalculator } from '../domain/PerformanceCalculator.ts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SectorOverviewTickerProps {
  sectors: SectorIndex[];
  onSelectSector?: (symbol: string) => void;
}

export const SectorOverviewTicker: React.FC<SectorOverviewTickerProps> = ({
  sectors,
  onSelectSector,
}) => {
  if (sectors.length === 0) return null;

  return (
    <div
      className="bg-[#0B111D]/80 border-b border-slate-800/80 px-4 py-2 text-xs font-mono w-full"
      aria-label="All NSE Sector Indices Summary"
    >
      <div className="max-w-7xl mx-auto">
        {/* Label row */}
        <span className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          NSE Sector Board
        </span>

        {/* Pills — wrap naturally, no horizontal scroll */}
        <div className="flex flex-wrap items-center gap-1.5">
          {sectors.map((sec) => {
            const isPositive = sec.changePercent > 0;
            const isNegative = sec.changePercent < 0;

            return (
              <button
                key={sec.symbol}
                onClick={() => onSelectSector?.(sec.symbol)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors text-slate-300"
                title={`${sec.name}: ${PerformanceCalculator.formatPercent(sec.changePercent)}`}
              >
                <span className="text-slate-400 text-[10px]">{sec.name.replace('Nifty ', '')}</span>
                <span
                  className={`font-bold tabular-nums inline-flex items-center text-[10px] ${
                    isPositive
                      ? 'text-emerald-400'
                      : isNegative
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {PerformanceCalculator.formatPercent(sec.changePercent)}
                  {isPositive && <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" aria-hidden="true" />}
                  {isNegative && <ArrowDownRight className="w-2.5 h-2.5 ml-0.5" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
