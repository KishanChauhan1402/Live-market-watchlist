/**
 * Real-Time NSE Stock Market Watchlist Portal
 * 
 * Continuous Strategy Engine for Top 3 and Bottom 3 NSE Sectors and Stocks.
 * @license Apache-2.0
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  ConnectionState,
  MarketSession,
  SelectedStockItem,
  StrategyConfig,
  StrategyExecutionResult,
} from './domain/types.ts';
import {
  DEFAULT_STRATEGY_CONFIG,
  MarketDataService,
} from './services/MarketDataService.ts';
import { MockMarketDataProvider } from './data/MockMarketDataProvider.ts';
import { HttpMarketDataProvider } from './data/HttpMarketDataProvider.ts';
import { Header } from './ui/Header.tsx';
import { TopSectorSection } from './ui/TopSectorSection.tsx';
import { BottomSectorSection } from './ui/BottomSectorSection.tsx';
import { SelectionReasonModal } from './ui/SelectionReasonModal.tsx';
import { StrategyConfigModal } from './ui/StrategyConfigModal.tsx';
import { EngineTestModal } from './ui/EngineTestModal.tsx';
import { SimulationToolbar } from './ui/SimulationToolbar.tsx';
import { SectorOverviewTicker } from './ui/SectorOverviewTicker.tsx';
import { ScreenReaderAnnouncer } from './ui/ScreenReaderAnnouncer.tsx';
import {
  AlertTriangle,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [strategyResult, setStrategyResult] = useState<StrategyExecutionResult | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [config, setConfig] = useState<StrategyConfig>(DEFAULT_STRATEGY_CONFIG);
  const [activeProviderId, setActiveProviderId] = useState<string>('nse-mock-provider');
  const [selectedStockForModal, setSelectedStockForModal] = useState<SelectedStockItem | null>(null);

  // Modals & Panels
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(true);

  // Responsive View Toggle on mobile/tablet ('split' | 'top' | 'bottom')
  const [activeViewTab, setActiveViewTab] = useState<'split' | 'top' | 'bottom'>('split');

  // Service Reference
  const serviceRef = useRef<MarketDataService | null>(null);
  const mockProviderRef = useRef<MockMarketDataProvider | null>(null);

  // Initialize Data Pipeline
  useEffect(() => {
    const mockProvider = new MockMarketDataProvider();
    mockProviderRef.current = mockProvider;

    const service = new MarketDataService(mockProvider, DEFAULT_STRATEGY_CONFIG);
    serviceRef.current = service;

    service.subscribeStrategy((result) => {
      setStrategyResult(result);
    });

    service.subscribeConnection((state) => {
      setConnectionState(state);
    });

    service.initialize();

    return () => {
      service.destroy();
    };
  }, []);

  // Handle Strategy Config & Provider Switch
  const handleSaveConfig = async (newConfig: StrategyConfig, providerId: string) => {
    setConfig(newConfig);
    if (!serviceRef.current) return;

    serviceRef.current.updateConfig(newConfig);

    if (providerId !== activeProviderId) {
      setActiveProviderId(providerId);
      if (providerId === 'nse-mock-provider') {
        const mock = new MockMarketDataProvider();
        mockProviderRef.current = mock;
        await serviceRef.current.switchProvider(mock);
      } else {
        mockProviderRef.current = null;
        const liveProvider = new HttpMarketDataProvider({
          apiBaseUrl: '/api/market',
          wsOrSseUrl: '/api/market/stream',
        });
        await serviceRef.current.switchProvider(liveProvider);
      }
    }
  };

  const handleManualReconnect = () => {
    if (mockProviderRef.current) {
      mockProviderRef.current.connect();
    } else if (serviceRef.current) {
      serviceRef.current.getProvider().connect();
    }
  };

  const handleSetMarketSession = (session: MarketSession) => {
    if (serviceRef.current) {
      serviceRef.current.setMarketSession(session);
    }
  };

  const isMock = activeProviderId === 'nse-mock-provider';
  const dataStatus = strategyResult?.dataStatus || (isMock ? 'MOCK' : 'LIVE');
  const marketSession = strategyResult?.marketSession || 'MARKET OPEN';
  const lastUpdated = strategyResult?.timestamp || Date.now();

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/20">
      {/* Screen Reader Live Region for meaningful ranking shifts */}
      <ScreenReaderAnnouncer announcements={strategyResult?.announcementEvents || []} />

      {/* Top Header */}
      <Header
        dataStatus={dataStatus}
        connectionState={connectionState}
        marketSession={marketSession}
        lastUpdatedTimestamp={lastUpdated}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenTests={() => setIsTestModalOpen(true)}
        onOpenSimulation={() => setIsSimulationOpen((prev) => !prev)}
        onManualReconnect={handleManualReconnect}
      />

      {/* Demo Simulation Toolbar */}
      {isSimulationOpen && (
        <SimulationToolbar
          mockProvider={mockProviderRef.current}
          marketSession={marketSession}
          onSetMarketSession={handleSetMarketSession}
          onClose={() => setIsSimulationOpen(false)}
        />
      )}

      {/* Real-time Sector Overview Ticker */}
      <SectorOverviewTicker sectors={strategyResult?.allSectorsRanked || []} />

      {/* Notice Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-3 space-y-2">
        {/* Mock Data Warning Banner (Mandatory Requirement 2 & 28) */}
        {isMock && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs"
            role="status"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>
                <strong>DEMO / MOCK DATA MODE:</strong> This session uses synthetic market ticks for strategy validation. Ticks and simulated ranking changes do not reflect real-time live trading. Never make trading decisions using simulated data.
              </span>
            </div>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-xs font-semibold text-amber-300 underline hover:text-amber-100 shrink-0"
            >
              Switch Provider
            </button>
          </div>
        )}

        {/* Stale Data Warning Banner (Req 21) */}
        {dataStatus === 'STALE' && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>⚠ STALE DATA WARNING:</strong> Data has not refreshed within {config.staleThresholdSeconds} seconds. Intraday rankings may be delayed.
            </span>
          </div>
        )}

        {/* Market Closed Banner (Req 23) */}
        {marketSession === 'MARKET CLOSED' && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-mono"
            role="status"
          >
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>MARKET CLOSED:</strong> Intraday real-time rankings are frozen at session close. Live updates will resume during market trading hours (09:15 - 15:30 IST).
            </span>
          </div>
        )}
      </div>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-5">
        {/* Mobile / Tablet Segmented View Switcher */}
        <div className="lg:hidden flex items-center justify-between pb-4">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setActiveViewTab('split')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeViewTab === 'split' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Sectors
            </button>
            <button
              onClick={() => setActiveViewTab('top')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeViewTab === 'top' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Side ({config.topSectorCount})
            </button>
            <button
              onClick={() => setActiveViewTab('bottom')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeViewTab === 'bottom' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bottom Side ({config.bottomSectorCount})
            </button>
          </div>
        </div>

        {/* Dashboard Grid (Desktop: Side-by-side Top Performers vs Bottom Performers) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Top Performers Column */}
          {(activeViewTab === 'split' || activeViewTab === 'top') && (
            <TopSectorSection
              topSectors={strategyResult?.topSectors || []}
              onSelectStock={(item) => setSelectedStockForModal(item)}
            />
          )}

          {/* Bottom Performers Column */}
          {(activeViewTab === 'split' || activeViewTab === 'bottom') && (
            <BottomSectorSection
              bottomSectors={strategyResult?.bottomSectors || []}
              onSelectStock={(item) => setSelectedStockForModal(item)}
            />
          )}
        </div>
      </main>

      {/* Strategy Transparency Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B111D] py-4 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span>NSE Strategy Rule: </span>
            <span className="text-slate-300 font-medium">
              Top {config.topSectorCount} Sectors (change% DESC) + Bottom {config.bottomSectorCount} Sectors (change% ASC).
            </span>
            <span className="hidden md:inline ml-2 text-slate-400">
              Deterministic tie-breaker: {config.tieBreaker.replace(/_/g, ' ')}.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Baseline: Previous Trading Session Close</span>
            <span aria-hidden="true">·</span>
            <span>Non-advisory watchlist portal</span>
          </div>
        </div>
      </footer>

      {/* Why Selected Detail Modal */}
      <SelectionReasonModal
        item={selectedStockForModal}
        onClose={() => setSelectedStockForModal(null)}
      />

      {/* Strategy Configuration Modal */}
      <StrategyConfigModal
        config={config}
        isOpen={isConfigModalOpen}
        activeProviderId={activeProviderId}
        onSave={handleSaveConfig}
        onClose={() => setIsConfigModalOpen(false)}
      />

      {/* Engine Unit Tests Verification Modal */}
      <EngineTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
