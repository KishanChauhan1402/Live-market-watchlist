import React from 'react';
import { SelectedStockItem } from '../domain/types.ts';
import { PerformanceCalculator } from '../domain/PerformanceCalculator.ts';
import { ArrowUpRight, ArrowDownRight, HelpCircle, ShieldAlert } from 'lucide-react';

interface StockTableProps {
  items: SelectedStockItem[];
  sectorSymbol: string;
  selectionSide: 'TOP' | 'BOTTOM';
  onSelectStock: (item: SelectedStockItem) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  items,
  sectorSymbol,
  selectionSide,
  onSelectStock,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500 font-mono">
        No qualifying stocks currently meet criteria for this sector.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-left text-xs border-collapse"
        aria-label={`Selected stocks for ${sectorSymbol}`}
      >
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-medium">
            <th scope="col" className="py-2 px-3 w-12 text-center">Rank</th>
            <th scope="col" className="py-2 px-3">Symbol</th>
            <th scope="col" className="py-2 px-3 hidden sm:table-cell">Company</th>
            <th scope="col" className="py-2 px-3 text-right">LTP (₹)</th>
            <th scope="col" className="py-2 px-3 text-right">Change</th>
            <th scope="col" className="py-2 px-3 text-right">Change %</th>
            <th scope="col" className="py-2 px-3 text-right hidden md:table-cell">Volume</th>
            <th scope="col" className="py-2 px-3 text-center w-24">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {items.map((item) => {
            const { stock, reason } = item;
            const isPositive = stock.changePercent > 0;
            const isNegative = stock.changePercent < 0;
            const isHalted = stock.isHalted || stock.dataStatus === 'HALTED';

            return (
              <tr
                key={stock.symbol}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Rank */}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                      selectionSide === 'TOP'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    #{reason.stockRankInSector}
                  </span>
                </td>

                {/* Symbol */}
                <td className="py-2.5 px-3 font-semibold text-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span>{stock.symbol}</span>
                    {isHalted && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-sans font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">
                        HALTED
                      </span>
                    )}
                  </div>
                </td>

                {/* Company Name (Desktop) */}
                <td className="py-2.5 px-3 font-sans text-slate-400 hidden sm:table-cell max-w-[140px] lg:max-w-[200px] truncate">
                  {stock.companyName}
                </td>

                {/* LTP */}
                <td className="py-2.5 px-3 text-right font-medium tabular-nums text-slate-200">
                  {stock.dataStatus === 'N/A' ? (
                    'N/A'
                  ) : (
                    `₹${PerformanceCalculator.formatINR(stock.ltp)}`
                  )}
                </td>

                {/* Change */}
                <td
                  className={`py-2.5 px-3 text-right tabular-nums ${
                    isPositive
                      ? 'text-emerald-400'
                      : isNegative
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {stock.dataStatus === 'N/A'
                    ? 'N/A'
                    : `${isPositive ? '+' : ''}${PerformanceCalculator.formatINR(stock.change)}`}
                </td>

                {/* Change % with Directional Arrow */}
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {stock.dataStatus === 'N/A' ? (
                    <span className="text-slate-400">N/A</span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold ${
                        isPositive
                          ? 'text-emerald-400'
                          : isNegative
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                      aria-label={`${stock.symbol} session change ${PerformanceCalculator.formatPercent(stock.changePercent)}`}
                    >
                      {PerformanceCalculator.formatPercent(stock.changePercent)}
                      {isPositive && <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />}
                      {isNegative && <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />}
                    </span>
                  )}
                </td>

                {/* Volume */}
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-400 hidden md:table-cell">
                  {stock.volume > 0 ? stock.volume.toLocaleString('en-IN') : '—'}
                </td>

                {/* Why Selected Button */}
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => onSelectStock(item)}
                    aria-label={`View selection reason for ${stock.symbol}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors focus:ring-2 focus:ring-sky-400"
                  >
                    <HelpCircle className="w-3 h-3 text-sky-400" aria-hidden="true" />
                    <span>Why?</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
