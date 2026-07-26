import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IChartApi } from 'lightweight-charts';
import { Header, ActiveTabType } from './components/Header';
import { SymbolSearch } from './components/SymbolSearch';
import { PresetStocksBar } from './components/PresetStocksBar';
import { RouterStatusCard } from './components/RouterStatusCard';
import { FileUploadModal } from './components/FileUploadModal';
import { EMASettings } from './components/EMASettings';
import { KLineChart } from './charts/KLineChart';
import { IndicatorSubCharts } from './charts/IndicatorSubCharts';
import { TurtleStrategyPanel } from './components/TurtleStrategyPanel';
import { AnalyticsView } from './components/AnalyticsView';
import { OptimizationView } from './components/OptimizationView';
import { TradeLogView } from './components/TradeLogView';
import { AIResearchPanel } from './components/AIResearchPanel';

import { MarketDataRouter } from './data/router/MarketDataRouter';
import { DataResampler } from './data/resampler/DataResampler';
import { calculateAllIndicators, DEFAULT_INDICATOR_CONFIG } from './indicators';
import { BacktestEngine } from './backtest/BacktestEngine';

import { Timeframe, OHLCV } from './types/stock';
import { RouterResult } from './types/router';
import { IndicatorValues, IndicatorConfig } from './types/indicator';
import { TurtleStrategyParams } from './types/strategy';
import { BacktestConfig, BacktestResult } from './types/backtest';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('CHART');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Router & Market State
  const [currentSymbol, setCurrentSymbol] = useState('2330');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [routerResult, setRouterResult] = useState<RouterResult | null>(null);
  const [activeSubchartTab, setActiveSubchartTab] = useState<'ALL' | 'RSI' | 'KD' | 'BIAS' | 'MACD'>('ALL');

  // Chart Synchronization Ref
  const syncChartsRef = useRef<Map<string, IChartApi>>(new Map());

  // Indicator Config State (Customizable 8 EMAs)
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig>({
    ...DEFAULT_INDICATOR_CONFIG,
    emaPeriods: [17, 45, 117, 189, 305, 494, 799, 1292],
  });

  // Indicators State
  const [indicators, setIndicators] = useState<IndicatorValues[]>([]);

  // Turtle Backtest State
  const [turtleParams, setTurtleParams] = useState<TurtleStrategyParams>({
    system: 1,
    entryBreakoutDays: 20,
    exitDays: 10,
    atrPeriod: 20,
    riskPercent: 1.0,
    stopLossAtr: 2.0,
    pyramidAtr: 0.5,
    maxPyramidUnits: 4,
    allowShort: false,
  });

  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig>({
    initialCapital: 1000000,
    commissionRate: 0.001425,
    commissionDiscount: 0.6, // 6折
    taxRate: 0.003,          // 0.3%
    slippageTicks: 1,
    minCommission: 20,
    executionTiming: 'NEXT_OPEN',
  });

  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  // Primary Data Loading & Routing Function
  const loadMarketData = useCallback(
    async (symbol: string, tf: Timeframe = timeframe, providerId: string = 'AUTO') => {
      setIsLoading(true);
      try {
        const result = await MarketDataRouter.routeAndFetch({
          symbol,
          timeframe: tf,
          autoRoute: providerId === 'AUTO',
          preferredProvider: providerId,
        });

        // Resample bars if needed
        const resampledBars = DataResampler.resample(result.data, tf);
        const finalResult = { ...result, data: resampledBars };

        setRouterResult(finalResult);
        setCurrentSymbol(symbol);

        // Calculate Indicators with timeframe BIAS parameters & current EMA config
        const computedIndicators = calculateAllIndicators(resampledBars, indicatorConfig, tf);
        setIndicators(computedIndicators);

        // Run default Turtle Backtest automatically
        const btRes = BacktestEngine.runTurtleBacktest(
          finalResult.symbolInfo.symbol,
          resampledBars,
          turtleParams,
          backtestConfig
        );
        setBacktestResult(btRes);
      } catch (err) {
        console.error('Market data loading error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [timeframe, turtleParams, backtestConfig, indicatorConfig]
  );

  // Update EMA Periods
  const handleEmaPeriodsChange = (newPeriods: number[]) => {
    const updatedConfig = { ...indicatorConfig, emaPeriods: newPeriods };
    setIndicatorConfig(updatedConfig);
    if (routerResult && routerResult.data) {
      const computed = calculateAllIndicators(routerResult.data, updatedConfig, timeframe);
      setIndicators(computed);
    }
  };

  // Initial Load on Mount
  useEffect(() => {
    loadMarketData('2330', '1D', 'AUTO');
  }, []);

  // Run Manual Backtest Trigger
  const handleRunBacktest = () => {
    if (!routerResult || routerResult.data.length === 0) return;
    const btRes = BacktestEngine.runTurtleBacktest(
      routerResult.symbolInfo.symbol,
      routerResult.data,
      turtleParams,
      backtestConfig
    );
    setBacktestResult(btRes);
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] flex flex-col font-sans antialiased selection:bg-[#02C076] selection:text-black">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl w-full mx-auto px-4 py-4 space-y-4 flex-1">
        {/* Search Bar & Preset Chips */}
        <div className="space-y-2">
          <SymbolSearch
            onSearch={(sym, tf, prov) => loadMarketData(sym, tf, prov)}
            isLoading={isLoading}
            currentTimeframe={timeframe}
            onTimeframeChange={tf => setTimeframe(tf)}
            currentProvider={routerResult?.provider.id || 'AUTO'}
          />
          <PresetStocksBar onSelectPreset={sym => loadMarketData(sym, timeframe, 'AUTO')} />
        </div>

        {/* Market Data Router Status Banner */}
        <RouterStatusCard routerResult={routerResult} />

        {/* Tab View Content */}
        {activeTab === 'CHART' && (
          <div className="space-y-4">
            {/* 8 EMA Customization Settings Panel */}
            <EMASettings
              emaPeriods={indicatorConfig.emaPeriods}
              onChangeEmaPeriods={handleEmaPeriodsChange}
            />

            {/* Main K-Line Chart */}
            <KLineChart
              bars={routerResult?.data || []}
              indicators={indicators}
              trades={backtestResult?.trades || []}
              showEMAs={true}
              emaPeriods={indicatorConfig.emaPeriods}
              syncChartsRef={syncChartsRef}
            />

            {/* Subchart Selector & Panel */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 bg-[#161A1E] border border-[#2B2F36] p-1.5 rounded-lg w-fit">
                <button
                  onClick={() => setActiveSubchartTab('ALL')}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    activeSubchartTab === 'ALL'
                      ? 'bg-[#02C076] text-black shadow-sm font-semibold'
                      : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]'
                  }`}
                >
                  全部 4 副圖 (同時對應K線)
                </button>
                {(['RSI', 'KD', 'BIAS', 'MACD'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubchartTab(tab)}
                    className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      activeSubchartTab === tab
                        ? 'bg-[#02C076] text-black shadow-sm font-semibold'
                        : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]'
                    }`}
                  >
                    {tab === 'BIAS' ? 'BIAS 三線' : `${tab} 單獨`}
                  </button>
                ))}
              </div>

              <IndicatorSubCharts
                indicators={indicators}
                timeframe={timeframe}
                activeTab={activeSubchartTab}
                syncChartsRef={syncChartsRef}
              />
            </div>
          </div>
        )}

        {activeTab === 'TURTLE' && (
          <TurtleStrategyPanel
            params={turtleParams}
            onParamsChange={setTurtleParams}
            config={backtestConfig}
            onConfigChange={setBacktestConfig}
            onRunBacktest={handleRunBacktest}
            isBacktesting={isLoading}
          />
        )}

        {activeTab === 'ANALYTICS' && <AnalyticsView result={backtestResult} />}

        {activeTab === 'OPTIMIZATION' && (
          <OptimizationView
            symbol={routerResult?.symbolInfo.symbol || '2330'}
            bars={routerResult?.data || []}
            config={backtestConfig}
          />
        )}

        {activeTab === 'TRADE_LOG' && <TradeLogView />}

        {activeTab === 'AI_RESEARCH' && (
          <AIResearchPanel
            symbolInfo={routerResult?.symbolInfo || null}
            backtestResult={backtestResult}
            dataQuality={routerResult?.dataQuality || null}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-[#2B2F36] bg-[#161A1E] flex items-center px-4 justify-between text-[11px] text-[#848E9C] shrink-0 font-mono mt-auto">
        <div className="flex items-center gap-4">
          <span>MARKET: <span className="text-[#02C076] font-semibold">OPEN</span></span>
          <span className="hidden sm:inline">TURTLE-QUANT ENGINE v4.2</span>
        </div>
        <div className="flex items-center gap-4">
          <span>© 2026 PRECISION QUANT SYSTEMS</span>
          <span className="text-[#02C076] hidden md:inline">SYSTEM ONLINE</span>
        </div>
      </footer>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileParsed={sym => loadMarketData(sym, timeframe, 'Custom')}
      />
    </div>
  );
}
