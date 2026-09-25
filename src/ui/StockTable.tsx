import React from 'react';
import { SelectedStockItem } from '../domain/types.ts';
import { PerformanceCalculator } from '../domain/PerformanceCalculator.ts';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';

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

  const isTop = selectionSide === 'TOP';

  return (
    <div className="w-full min-w-0">
      {/* Mobile card view — shown below md */}
      <div className="flex flex-col gap-2 md:hidden">
        {items.map((item) => {
          const { stock, reason } = item;
          const isPositive = stock.changePercent > 0;
          const isNegative = stock.changePercent < 0;
          const isHalted = stock.isHalted || stock.dataStatus === 'HALTED';

          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {/* Left: rank + symbol */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${
                    isTop
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  }`}
                >
                  #{reason.stockRankInSector}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-100 font-mono">{stock.symbol}</span>
                    {isHalted && (
                      <span className="text-[9px] px-1 py-0.5 rounded font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">
                        HALTED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    ₹{PerformanceCalculator.formatINR(stock.ltp)}
                  </span>
                </div>
              </div>

              {/* Right: change % + Why button */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold tabular-nums ${
                    isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {PerformanceCalculator.formatPercent(stock.changePercent)}
                  {isPositive && <ArrowUpRight className="w-3 h-3" aria-hidden="true" />}
                  {isNegative && <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
                </span>
                <button
                  onClick={() => onSelectStock(item)}
                  aria-label={`View selection reason for ${stock.symbol}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors"
                >
                  <HelpCircle className="w-3 h-3 text-sky-400 shrink-0" aria-hidden="true" />
                  Why?
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view — shown at md and above */}
      <div className="hidden md:block w-full min-w-0">
        <table
          className="w-full text-left text-xs border-collapse table-fixed"
          aria-label={`Selected stocks for ${sectorSymbol}`}
        >
          <colgroup>
            <col style={{ width: '44px' }} />
            <col style={{ width: '90px' }} />
            <col /> {/* Company — takes remaining space */}
            <col style={{ width: '80px' }} />
            <col style={{ width: '68px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '80px' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th scope="col" className="py-2 px-2 text-center">Rank</th>
              <th scope="col" className="py-2 px-2">Symbol</th>
              <th scope="col" className="py-2 px-2">Company</th>
              <th scope="col" className="py-2 px-2 text-right">LTP (₹)</th>
              <th scope="col" className="py-2 px-2 text-right">Chg</th>
              <th scope="col" className="py-2 px-2 text-right">Chg %</th>
              <th scope="col" className="py-2 px-2 text-center">Action</th>
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
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                        isTop
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      #{reason.stockRankInSector}
                    </span>
                  </td>

                  {/* Symbol */}
                  <td className="py-2.5 px-2 font-semibold text-slate-100">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="truncate">{stock.symbol}</span>
                      {isHalted && (
                        <span className="shrink-0 text-[9px] px-1 py-0.5 rounded font-sans font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">
                          HLT
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Company Name */}
                  <td className="py-2.5 px-2 font-sans text-slate-400 truncate max-w-0">
                    {stock.companyName}
                  </td>

                  {/* LTP */}
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-200">
                    {stock.dataStatus === 'N/A'
                      ? 'N/A'
                      : `₹${PerformanceCalculator.formatINR(stock.ltp)}`}
                  </td>

                  {/* Change */}
                  <td
                    className={`py-2.5 px-2 text-right tabular-nums ${
                      isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {stock.dataStatus === 'N/A'
                      ? 'N/A'
                      : `${isPositive ? '+' : ''}${PerformanceCalculator.formatINR(stock.change)}`}
                  </td>

                  {/* Change % with arrow */}
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {stock.dataStatus === 'N/A' ? (
                      <span className="text-slate-400">N/A</span>
                    ) : (
                      <span
                        className={`inline-flex items-center justify-end gap-0.5 font-bold ${
                          isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                        }`}
                        aria-label={`${stock.symbol} session change ${PerformanceCalculator.formatPercent(stock.changePercent)}`}
                      >
                        {PerformanceCalculator.formatPercent(stock.changePercent)}
                        {isPositive && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                        {isNegative && <ArrowDownRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                      </span>
                    )}
                  </td>

                  {/* Why Selected Button */}
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => onSelectStock(item)}
                      aria-label={`View selection reason for ${stock.symbol}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-sans font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors focus:ring-2 focus:ring-sky-400"
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
    </div>
  );
};
