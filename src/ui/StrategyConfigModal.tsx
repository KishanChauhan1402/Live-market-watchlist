import React, { useState } from 'react';
import { StrategyConfig, TieBreakerRule } from '../domain/types.ts';
import { Sliders, X, Check, RotateCcw, ShieldCheck } from 'lucide-react';

interface StrategyConfigModalProps {
  config: StrategyConfig;
  isOpen: boolean;
  activeProviderId: string;
  onSave: (newConfig: StrategyConfig, providerId: string) => void;
  onClose: () => void;
}

export const StrategyConfigModal: React.FC<StrategyConfigModalProps> = ({
  config,
  isOpen,
  activeProviderId,
  onSave,
  onClose,
}) => {
  const [topSectorCount, setTopSectorCount] = useState(config.topSectorCount);
  const [bottomSectorCount, setBottomSectorCount] = useState(config.bottomSectorCount);
  const [topStocksPerSector, setTopStocksPerSector] = useState(config.topStocksPerSector);
  const [bottomStocksPerSector, setBottomStocksPerSector] = useState(config.bottomStocksPerSector);
  const [staleThresholdSeconds, setStaleThresholdSeconds] = useState(config.staleThresholdSeconds);
  const [tieBreaker, setTieBreaker] = useState<TieBreakerRule>(config.tieBreaker);
  const [selectedProviderId, setSelectedProviderId] = useState(activeProviderId);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setTopSectorCount(3);
    setBottomSectorCount(3);
    setTopStocksPerSector(3);
    setBottomStocksPerSector(3);
    setStaleThresholdSeconds(10);
    setTieBreaker('changePercent_absoluteChange_symbol');
  };

  const handleApply = () => {
    onSave(
      {
        ...config,
        topSectorCount: Number(topSectorCount),
        bottomSectorCount: Number(bottomSectorCount),
        topStocksPerSector: Number(topStocksPerSector),
        bottomStocksPerSector: Number(bottomStocksPerSector),
        staleThresholdSeconds: Number(staleThresholdSeconds),
        tieBreaker,
      },
      selectedProviderId
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-title"
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400">
              <Sliders className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="config-title" className="text-base font-bold text-white font-mono">
                Strategy Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Adjust strategy universe bounds, ranking quotas, and tie-breakers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close configuration settings"
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs font-mono">
          {/* Provider Selection */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-white block">
              Market Data Provider Source
            </label>
            <div className="space-y-1.5 font-sans">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="providerSource"
                  value="nse-mock-provider"
                  checked={selectedProviderId === 'nse-mock-provider'}
                  onChange={() => setSelectedProviderId('nse-mock-provider')}
                  className="accent-sky-500"
                />
                <span>
                  <strong>Demo Mock Simulator:</strong> Generates real-time price ticks for demonstration and testing. Labels UI as <span className="text-amber-400 font-mono text-xs">DEMO / MOCK DATA</span>.
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="providerSource"
                  value="nse-licensed-provider"
                  checked={selectedProviderId === 'nse-licensed-provider'}
                  onChange={() => setSelectedProviderId('nse-licensed-provider')}
                  className="accent-sky-500"
                />
                <span>
                  <strong>Licensed NSE Feed Gateway:</strong> Connects to licensed streaming feed via SSE/REST. Labels UI as <span className="text-emerald-400 font-mono text-xs">● LIVE</span>.
                </span>
              </label>
            </div>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="topSectorCount" className="block text-slate-300 font-medium mb-1">
                Top Sectors Count (N)
              </label>
              <input
                id="topSectorCount"
                type="number"
                min="1"
                max="6"
                value={topSectorCount}
                onChange={(e) => setTopSectorCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label htmlFor="bottomSectorCount" className="block text-slate-300 font-medium mb-1">
                Bottom Sectors Count (N)
              </label>
              <input
                id="bottomSectorCount"
                type="number"
                min="1"
                max="6"
                value={bottomSectorCount}
                onChange={(e) => setBottomSectorCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label htmlFor="topStocksPerSector" className="block text-slate-300 font-medium mb-1">
                Top Stocks Per Sector
              </label>
              <input
                id="topStocksPerSector"
                type="number"
                min="1"
                max="6"
                value={topStocksPerSector}
                onChange={(e) => setTopStocksPerSector(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label htmlFor="bottomStocksPerSector" className="block text-slate-300 font-medium mb-1">
                Bottom Stocks Per Sector
              </label>
              <input
                id="bottomStocksPerSector"
                type="number"
                min="1"
                max="6"
                value={bottomStocksPerSector}
                onChange={(e) => setBottomStocksPerSector(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Stale Threshold */}
          <div>
            <label htmlFor="staleThreshold" className="block text-slate-300 font-medium mb-1">
              Stale Data Detection Threshold (Seconds)
            </label>
            <input
              id="staleThreshold"
              type="number"
              min="3"
              max="60"
              value={staleThresholdSeconds}
              onChange={(e) => setStaleThresholdSeconds(Math.max(3, parseInt(e.target.value) || 10))}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:ring-1 focus:ring-sky-400"
            />
            <span className="text-[11px] text-slate-400 font-sans block mt-1">
              If security or sector receives no tick within this window, it is marked as ⚠ STALE DATA.
            </span>
          </div>

          {/* Tie Breaker */}
          <div>
            <label htmlFor="tieBreakerSelect" className="block text-slate-300 font-medium mb-1">
              Deterministic Tie-Breaker Rule
            </label>
            <select
              id="tieBreakerSelect"
              value={tieBreaker}
              onChange={(e) => setTieBreaker(e.target.value as TieBreakerRule)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:ring-1 focus:ring-sky-400"
            >
              <option value="changePercent_absoluteChange_symbol">
                1. % Change → 2. Absolute ₹ Change → 3. Symbol (Alphabetical)
              </option>
              <option value="changePercent_volume_symbol">
                1. % Change → 2. Trading Volume → 3. Symbol (Alphabetical)
              </option>
              <option value="symbol_alpha">
                1. % Change → 2. Symbol (Alphabetical)
              </option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors focus:ring-2 focus:ring-sky-400"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Strategy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
