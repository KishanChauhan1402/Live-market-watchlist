import React from 'react';
import { MarketSession } from '../domain/types.ts';
import { MockMarketDataProvider } from '../data/MockMarketDataProvider.ts';
import {
  Sparkles,
  ArrowUpDown,
  Zap,
  TrendingDown,
  Pause,
  Play,
  WifiOff,
  ShieldAlert,
  X,
} from 'lucide-react';

interface SimulationToolbarProps {
  mockProvider: MockMarketDataProvider | null;
  marketSession: MarketSession;
  onSetMarketSession: (session: MarketSession) => void;
  onClose: () => void;
}

export const SimulationToolbar: React.FC<SimulationToolbarProps> = ({
  mockProvider,
  marketSession,
  onSetMarketSession,
  onClose,
}) => {
  if (!mockProvider) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 p-4 text-xs text-slate-400">
        Demo simulation controls are only active when connected to the Mock Simulator provider.
      </div>
    );
  }

  const [tickInterval, setTickInterval] = React.useState<number>(mockProvider.getTickFrequency());
  const isPaused = tickInterval <= 0;

  const handleTogglePause = () => {
    if (isPaused) {
      mockProvider.setTickFrequency(1500);
      setTickInterval(1500);
    } else {
      mockProvider.setTickFrequency(0);
      setTickInterval(0);
    }
  };

  const handleChangeSpeed = (ms: number) => {
    mockProvider.setTickFrequency(ms);
    setTickInterval(ms);
  };

  return (
    <div className="bg-[#0B111D] border-b border-amber-900/40 px-4 py-3 text-xs w-full">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Top row: title + close */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0 p-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-amber-300 tracking-wide uppercase font-mono">
                Demo Simulation Lab
              </span>
              <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">
                Simulate market events &amp; ranking shifts
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close demo lab"
            className="shrink-0 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom row: all controls, wrap naturally */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => mockProvider.triggerRankSwapITAndBank()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Demonstrates dynamic sector ranking shift: Bank jumps above IT"
          >
            <ArrowUpDown className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Swap Bank &amp; IT</span>
          </button>

          <button
            onClick={() => mockProvider.triggerStockRally('WIPRO', 5.8)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Demonstrates stock ranking shift: WIPRO jumps into top 3 shortlist"
          >
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Rally WIPRO</span>
          </button>

          <button
            onClick={() => mockProvider.triggerStockPlunge('DLF', -7.2)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Demonstrates stock ranking shift: DLF plunges deeper in Realty"
          >
            <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Plunge DLF</span>
          </button>

          <button
            onClick={() => mockProvider.toggleStockHalt('INFY')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Demonstrates handling of trading halt on a stock"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Halt INFY</span>
          </button>

          <button
            onClick={() => mockProvider.simulateConnectionLossAndRecovery(4000)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Demonstrates automatic reconnection with backoff on connection loss"
          >
            <WifiOff className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Disconnect</span>
          </button>

          {/* Divider */}
          <span className="hidden sm:inline text-slate-700" aria-hidden="true">|</span>

          {/* Pause / Resume */}
          <button
            onClick={handleTogglePause}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
              isPaused
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 shrink-0" /> : <Pause className="w-3 h-3 shrink-0" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Speed Pills */}
          <div className="flex items-center border border-slate-800 rounded bg-slate-900 overflow-hidden font-mono text-[11px]">
            <button
              onClick={() => handleChangeSpeed(800)}
              className={`px-2 py-0.5 ${tickInterval === 800 ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              0.8s
            </button>
            <button
              onClick={() => handleChangeSpeed(1500)}
              className={`px-2 py-0.5 ${tickInterval === 1500 ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              1.5s
            </button>
            <button
              onClick={() => handleChangeSpeed(3000)}
              className={`px-2 py-0.5 ${tickInterval === 3000 ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              3s
            </button>
          </div>

          {/* Market Session Selector */}
          <select
            value={marketSession}
            onChange={(e) => onSetMarketSession(e.target.value as MarketSession)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-400"
            aria-label="Set Simulated Market Session"
          >
            <option value="MARKET OPEN">Market Open</option>
            <option value="PRE-MARKET">Pre-Market</option>
            <option value="MARKET CLOSED">Market Closed</option>
            <option value="POST-MARKET">Post-Market</option>
            <option value="DATA UNAVAILABLE">Unavailable</option>
          </select>
        </div>
      </div>
    </div>
  );
};
