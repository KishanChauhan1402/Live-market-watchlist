import React, { useState, useEffect } from 'react';
import {
  ConnectionState,
  DataStatus,
  MarketSession,
} from '../domain/types.ts';
import {
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  dataStatus: DataStatus;
  connectionState: ConnectionState;
  marketSession: MarketSession;
  lastUpdatedTimestamp: number;
  onOpenConfig: () => void;
  onOpenTests: () => void;
  onOpenSimulation: () => void;
  onManualReconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataStatus,
  connectionState,
  marketSession,
  lastUpdatedTimestamp,
  onOpenConfig,
  onOpenTests,
  onOpenSimulation,
  onManualReconnect,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLastUpdated = (ts: number) => {
    if (!ts) return 'Waiting...';
    return new Date(ts).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Status Indicator Badge Rendering
  const renderStatusBadge = () => {
    if (connectionState === 'DISCONNECTED') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800"
          role="status"
          aria-label="Market Data Status: Connection Lost"
        >
          <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>× CONNECTION LOST</span>
        </span>
      );
    }

    if (connectionState === 'RECONNECTING') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse"
          role="status"
          aria-label="Market Data Status: Reconnecting"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          <span>RECONNECTING...</span>
        </span>
      );
    }

    if (dataStatus === 'STALE') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800"
          role="status"
          aria-label="Market Data Status: Stale Data Warning"
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>⚠ STALE DATA</span>
        </span>
      );
    }

    if (dataStatus === 'MOCK') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-900/40 text-amber-300 border border-amber-700/60"
          role="status"
          aria-label="Market Data Status: Demo Mock Data Active"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          <span>DEMO / MOCK DATA</span>
        </span>
      );
    }

    if (dataStatus === 'DELAYED') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800"
          role="status"
          aria-label="Market Data Status: Delayed Feed"
        >
          <span>◐ DELAYED</span>
        </span>
      );
    }

    // LIVE (only when genuine real market source is active and connected)
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700"
        role="status"
        aria-label="Market Data Status: Live Feed"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        <span>● LIVE</span>
      </span>
    );
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0B111D] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Brand & Market Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-sky-400">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                  NSE MARKET WATCH
                </h1>
                {renderStatusBadge()}
                {/* Market Session indicator */}
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-slate-800 border border-slate-700 text-slate-300">
                  {marketSession}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>Real-Time Sector &amp; Stock Strategy Engine</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Baseline: Prev Session Close</span>
              </div>
            </div>
          </div>

          {/* Telemetry & Controls */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 text-xs font-mono">
            {/* Timestamp & Clock */}
            <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="tabular-nums">{currentTimeStr}</span>
              </div>
              <span className="text-slate-700" aria-hidden="true">|</span>
              <div className="text-[11px] text-slate-400">
                Tick: <span className="text-slate-200 tabular-nums">{formatLastUpdated(lastUpdatedTimestamp)}</span>
              </div>
            </div>

            {/* Connection indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-xs">
              {connectionState === 'CONNECTED' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400">Connected</span>
                </>
              ) : connectionState === 'RECONNECTING' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" aria-hidden="true" />
                  <span className="text-amber-400">Reconnecting</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                  <span className="text-rose-400">Offline</span>
                </>
              )}
            </div>

            {/* Actions: Demo Controls, Strategy Config, Unit Tests */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSimulation}
                aria-label="Open Demo Simulation Tools"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 transition-colors focus:ring-2 focus:ring-amber-400"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Demo Lab</span>
              </button>

              <button
                onClick={onOpenTests}
                aria-label="View Strategy Engine Verification and Unit Tests"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors focus:ring-2 focus:ring-sky-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Verify Tests</span>
              </button>

              <button
                onClick={onOpenConfig}
                aria-label="Open Strategy Configuration Settings"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors focus:ring-2 focus:ring-sky-400"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                <span className="hidden sm:inline">Strategy Config</span>
              </button>

              {connectionState === 'DISCONNECTED' && (
                <button
                  onClick={onManualReconnect}
                  aria-label="Reconnect to market feed"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-rose-700 hover:bg-rose-600 transition-colors"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
