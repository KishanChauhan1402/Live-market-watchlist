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
    <div className="w-full">
      <table
        className="w-full text-left text-xs border-collapse table-fixed"
        aria-label={`Selected stocks for ${sectorSymbol}`}
      >
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-medium">
            <th scope="col" className="py-2 px-1.5 sm:px-2 w-8 sm:w-10 text-center">#</th>
            <th scope="col" className="py-2 px-1.5 sm:px-2 w-28 sm:w-auto">Stock</th>
            <th scope="col" className="py-2 px-1.5 sm:px-2 text-right w-20 sm:w-24">LTP (₹)</th>
            <th scope="col" className="py-2 px-1.5 sm:px-2 text-right hidden sm:table-cell w-20">Change</th>
            <th scope="col" className="py-2 px-1.5 sm:px-2 text-right w-20 sm:w-24">Return</th>
            <th scope="col" className="py-2 px-1.5 sm:px-2 text-right hidden lg:table-cell w-24">Volume</th>
            <th scope="col" className="py-2 px-1 sm:px-2 text-center w-14 sm:w-16">Why?</th>
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
                <td className="py-2 px-1.5 sm:px-2 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded text-[11px] font-bold ${
                      selectionSide === 'TOP'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    #{reason.stockRankInSector}
                  </span>
                </td>

                {/* Symbol + Company */}
                <td className="py-2 px-1.5 sm:px-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-100 truncate">{stock.symbol}</span>
                      {isHalted && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-sans font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 shrink-0">
                          HALTED
                        </span>
                      )}
                    </div>
                    <span className="font-sans text-[10px] text-slate-400 truncate hidden sm:block">
                      {stock.companyName}
                    </span>
                  </div>
                </td>

                {/* LTP */}
                <td className="py-2 px-1.5 sm:px-2 text-right font-medium tabular-nums text-slate-200">
                  {stock.dataStatus === 'N/A' ? (
                    'N/A'
                  ) : (
                    `₹${PerformanceCalculator.formatINR(stock.ltp)}`
                  )}
                </td>

                {/* Change */}
                <td
                  className={`py-2 px-1.5 sm:px-2 text-right tabular-nums hidden sm:table-cell ${
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
                <td className="py-2 px-1.5 sm:px-2 text-right tabular-nums">
                  {stock.dataStatus === 'N/A' ? (
                    <span className="text-slate-400">N/A</span>
                  ) : (
                    <span
                      className={`inline-flex items-center justify-end gap-0.5 font-bold ${
                        isPositive
                          ? 'text-emerald-400'
                          : isNegative
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                      aria-label={`${stock.symbol} session change ${PerformanceCalculator.formatPercent(stock.changePercent)}`}
                    >
                      <span>{PerformanceCalculator.formatPercent(stock.changePercent)}</span>
                      {isPositive && <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />}
                      {isNegative && <ArrowDownRight className="w-3 h-3 shrink-0" aria-hidden="true" />}
                    </span>
                  )}
                </td>

                {/* Volume */}
                <td className="py-2 px-1.5 sm:px-2 text-right tabular-nums text-slate-400 hidden lg:table-cell truncate">
                  {stock.volume > 0 ? stock.volume.toLocaleString('en-IN') : '—'}
                </td>

                {/* Why Selected Button */}
                <td className="py-2 px-1 sm:px-2 text-center">
                  <button
                    onClick={() => onSelectStock(item)}
                    aria-label={`View selection reason for ${stock.symbol}`}
                    className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-0.5 rounded text-[10px] sm:text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors focus:ring-2 focus:ring-sky-400"
                    title="View why stock was selected"
                  >
                    <HelpCircle className="w-3 h-3 text-sky-400 sm:mr-1 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Why?</span>
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
