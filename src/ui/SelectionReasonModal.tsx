import React, { useEffect, useRef } from 'react';
import { SelectedStockItem } from '../domain/types.ts';
import { PerformanceCalculator } from '../domain/PerformanceCalculator.ts';
import { X, ArrowUpRight, ArrowDownRight, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SelectionReasonModalProps {
  item: SelectedStockItem | null;
  onClose: () => void;
}

export const SelectionReasonModal: React.FC<SelectionReasonModalProps> = ({ item, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (item) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [item, onClose]);

  if (!item) return null;

  const { stock, reason } = item;
  const isTopSide = reason.selectionSide === 'TOP';
  const isPositive = stock.changePercent > 0;
  const isNegative = stock.changePercent < 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                isTopSide
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-700/50 text-rose-400'
              }`}
            >
              {isTopSide ? (
                <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-title" className="text-xl font-bold tracking-tight text-white font-mono">
                  {stock.symbol}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-800 border border-slate-700 text-slate-300">
                  {stock.exchange}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-semibold font-mono ${
                    isTopSide
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/60'
                      : 'bg-rose-900/40 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  {isTopSide ? 'TOP PERFORMER' : 'BOTTOM PERFORMER'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{stock.companyName}</p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close selection explanation dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-sky-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why Selected Breakdown */}
        <div className="space-y-4 text-sm">
          <div>
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Strategy Selection Rationale
            </span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg">
              {reason.note}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Sector Name</span>
              <span className="text-sm font-semibold text-slate-200 mt-0.5 block truncate">
                {reason.sectorName}
              </span>
              <span className="text-xs font-mono text-slate-400 mt-1 block">
                Rank: <strong className="text-white">#{reason.sectorRank}</strong> of {reason.totalSectorsConsidered}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Sector Performance</span>
              <span
                className={`text-sm font-bold font-mono tabular-nums mt-0.5 block ${
                  reason.sectorPerformance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {PerformanceCalculator.formatPercent(reason.sectorPerformance)}{' '}
                {reason.sectorPerformance >= 0 ? '↑' : '↓'}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Baseline session close</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Stock Rank In Sector</span>
              <span className="text-base font-bold font-mono text-white mt-0.5 block">
                #{reason.stockRankInSector}{' '}
                <span className="text-xs font-normal text-slate-400">
                  of {reason.totalEligibleStocksInSector} eligible
                </span>
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {isTopSide ? 'Ranked by highest gain' : 'Ranked by steepest decline'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Stock Performance</span>
              <span
                className={`text-base font-bold font-mono tabular-nums mt-0.5 block ${
                  isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {PerformanceCalculator.formatPercent(stock.changePercent)}{' '}
                {isPositive ? '↑' : isNegative ? '↓' : '—'}
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-400 mt-1 block">
                LTP: ₹{PerformanceCalculator.formatINR(stock.ltp)}
              </span>
            </div>
          </div>

          {/* Baseline Calculation Transparency */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Baseline Return Calculation</span>
            </div>
            <div className="text-xs font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 overflow-x-auto">
              {reason.calculationFormula}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Prev. Close: ₹{PerformanceCalculator.formatINR(stock.previousClose)}</span>
              <span>Net Change: {PerformanceCalculator.formatINR(stock.change)}</span>
              <span>Volume: {stock.volume.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Compliance & Regulatory Neutrality Notice */}
          <div className="flex items-start gap-2 text-xs text-slate-400/90 bg-slate-900/40 p-2.5 rounded border border-slate-800/50">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Neutral Watchlist Disclaimer:</strong> Securities listed here are strictly identified by the quantitative session-performance algorithm. This is not an investment recommendation, buy/sell call, or return prediction.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-sky-400"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
