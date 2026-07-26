import React, { useState, useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  IChartApi,
  ColorType,
  CandlestickData,
  LineData,
  HistogramData
} from 'lightweight-charts';
import { OHLCV } from '../types/stock';
import { IndicatorValues } from '../types/indicator';
import { TradePosition } from '../types/backtest';

export const EMA_PALETTE = [
  '#38bdf8', // EMA1: Light Blue
  '#fbbf24', // EMA2: Amber
  '#a855f7', // EMA3: Purple
  '#ec4899', // EMA4: Pink
  '#f97316', // EMA5: Orange
  '#10b981', // EMA6: Emerald
  '#f43f5e', // EMA7: Rose
  '#6366f1', // EMA8: Indigo
];

interface KLineChartProps {
  bars: OHLCV[];
  indicators?: IndicatorValues[];
  trades?: TradePosition[];
  showEMAs?: boolean;
  emaPeriods?: number[];
  syncChartsRef?: React.MutableRefObject<Map<string, IChartApi>>;
}

interface HoverLegendData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  emas: { period: number; value: number | null; color: string }[];
}

export const KLineChart: React.FC<KLineChartProps> = ({
  bars,
  indicators = [],
  trades = [],
  showEMAs = true,
  emaPeriods = [17, 45, 117, 189, 305, 494, 799, 1292],
  syncChartsRef
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [showTradeMarkers, setShowTradeMarkers] = useState<boolean>(false);
  const [hoverLegend, setHoverLegend] = useState<HoverLegendData | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !bars || bars.length === 0) return;

    // Clean up DOM and previous instance
    chartContainerRef.current.innerHTML = '';
    if (chartRef.current) {
      try {
        if (syncChartsRef) syncChartsRef.current.delete('main');
        chartRef.current.remove();
      } catch {
        // ignore
      }
      chartRef.current = null;
    }

    try {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth || 800,
        height: 480,
        layout: {
          background: { type: ColorType.Solid, color: '#0B0E11' },
          textColor: '#848E9C',
        },
        grid: {
          vertLines: { color: '#1E2329' },
          horzLines: { color: '#1E2329' },
        },
        crosshair: {
          mode: 0,
        },
        timeScale: {
          borderColor: '#2B2F36',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#2B2F36',
        },
      });

      chartRef.current = chart;
      if (syncChartsRef) {
        syncChartsRef.current.set('main', chart);
      }

      // Ensure bars are sorted strictly ascending by date & no duplicates
      const barDateSet = new Set<string>();
      const validSortedBars = [...bars]
        .filter(b => b && b.date && !isNaN(b.close))
        .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
        .filter(b => {
          if (barDateSet.has(b.date)) return false;
          barDateSet.add(b.date);
          return true;
        });

      // Quick index lookup for indicators and bars
      const barMap = new Map<string, OHLCV>();
      validSortedBars.forEach((b, idx) => {
        barMap.set(b.date, b);
      });

      const indMap = new Map<string, IndicatorValues>();
      indicators.forEach(ind => {
        if (ind && ind.date) indMap.set(ind.date, ind);
      });

      // Candlestick Series (Title set to empty string so no canvas text overlays line)
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#F84960',
        downColor: '#02C076',
        borderVisible: false,
        wickUpColor: '#F84960',
        wickDownColor: '#02C076',
        title: '',
      });

      const candleData: CandlestickData[] = validSortedBars.map(b => ({
        time: b.date as any,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }));

      candlestickSeries.setData(candleData);

      // Volume Series
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        title: '',
      });

      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData: HistogramData[] = validSortedBars.map(b => ({
        time: b.date as any,
        value: b.volume,
        color: b.close >= b.open ? 'rgba(248, 73, 96, 0.4)' : 'rgba(2, 192, 118, 0.4)',
      }));

      volumeSeries.setData(volumeData);

      // 8 EMA Overlays (Title empty so no text covers line curves)
      const currentEmaPeriods = emaPeriods && emaPeriods.length > 0 ? emaPeriods : [17, 45, 117, 189, 305, 494, 799, 1292];
      if (showEMAs && indicators && indicators.length > 0) {
        currentEmaPeriods.forEach((period, idx) => {
          const color = EMA_PALETTE[idx % EMA_PALETTE.length];
          const lineSeries = chart.addSeries(LineSeries, {
            color,
            lineWidth: 1,
            title: '', // empty to avoid overlay text on lines
          });

          const indDateSet = new Set<string>();
          const lineData: LineData[] = indicators
            .filter(ind => ind && ind.date && ind.emas && ind.emas[period] !== null && ind.emas[period] !== undefined)
            .filter(ind => barDateSet.has(ind.date))
            .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
            .filter(ind => {
              if (indDateSet.has(ind.date)) return false;
              indDateSet.add(ind.date);
              return true;
            })
            .map(ind => ({
              time: ind.date as any,
              value: ind.emas[period]!,
            }));

          if (lineData.length > 0) {
            lineSeries.setData(lineData);
          }
        });
      }

      // Trade Signal Markers
      if (showTradeMarkers && trades && trades.length > 0) {
        const rawMarkers: any[] = [];
        trades.forEach(t => {
          if (t.entryDate && barDateSet.has(t.entryDate)) {
            rawMarkers.push({
              time: t.entryDate,
              position: 'belowBar',
              color: '#3b82f6',
              shape: 'arrowUp',
              text: `買進 (${t.units}U @ $${t.entryPrice})`,
            });
          }
          if (t.exitDate && t.exitPrice && barDateSet.has(t.exitDate)) {
            const isWin = (t.pnl || 0) > 0;
            rawMarkers.push({
              time: t.exitDate,
              position: 'aboveBar',
              color: isWin ? '#ef4444' : '#22c55e',
              shape: 'arrowDown',
              text: `賣出 ($${t.exitPrice} | ${isWin ? '+' : ''}${t.pnlPercent?.toFixed(1)}%)`,
            });
          }
        });

        rawMarkers.sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

        if (rawMarkers.length > 0) {
          createSeriesMarkers(candlestickSeries, rawMarkers);
        }
      }

      // Helper to build legend data object for a bar date
      const buildLegendData = (targetDate: string): HoverLegendData | null => {
        const bar = barMap.get(targetDate);
        if (!bar) return null;

        const prevIdx = validSortedBars.findIndex(b => b.date === targetDate) - 1;
        const prevClose = prevIdx >= 0 ? validSortedBars[prevIdx].close : bar.open;
        const change = bar.close - prevClose;
        const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

        const ind = indMap.get(targetDate);
        const emasList = currentEmaPeriods.map((p, idx) => ({
          period: p,
          value: ind && ind.emas && ind.emas[p] !== undefined ? ind.emas[p] : null,
          color: EMA_PALETTE[idx % EMA_PALETTE.length],
        }));

        return {
          date: bar.date,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
          change,
          changePercent,
          emas: emasList,
        };
      };

      // Set initial legend to latest bar
      const lastBar = validSortedBars[validSortedBars.length - 1];
      if (lastBar) {
        setHoverLegend(buildLegendData(lastBar.date));
      }

      // Crosshair hover listener
      chart.subscribeCrosshairMove(param => {
        if (param.time && typeof param.time === 'string') {
          const hoverData = buildLegendData(param.time);
          if (hoverData) {
            setHoverLegend(hoverData);
            return;
          }
        }
        // If mouse left chart, revert to latest bar
        if (lastBar) {
          setHoverLegend(buildLegendData(lastBar.date));
        }
      });

      // Synchronize visible logical range across all charts
      let isSyncing = false;
      chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (isSyncing || !range || !syncChartsRef) return;
        isSyncing = true;
        syncChartsRef.current.forEach((otherChart, key) => {
          if (key !== 'main' && otherChart) {
            try {
              otherChart.timeScale().setVisibleLogicalRange(range);
            } catch {
              // ignore
            }
          }
        });
        isSyncing = false;
      });

      // Fit content
      chart.timeScale().fitContent();

      // Resize Observer
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          try {
            chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
          } catch {
            // ignore
          }
        }
      };

      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (chartRef.current) {
          try {
            if (syncChartsRef) syncChartsRef.current.delete('main');
            chartRef.current.remove();
          } catch {
            // ignore
          }
          chartRef.current = null;
        }
      };
    } catch (err) {
      console.error('KLineChart initialization error:', err);
    }
  }, [bars, indicators, trades, showEMAs, emaPeriods, showTradeMarkers, syncChartsRef]);

  return (
    <div className="w-full bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm relative flex flex-col">
      {/* Chart Top Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#2B2F36]">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#EAECEF] font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F84960] inline-block"></span>
          <span>K 線圖表 (QUANT TERMINAL MODE)</span>
          <span className="text-[#848E9C] font-normal">| {bars.length} 根 K 棒</span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          {/* Trade Signals Toggle Switch */}
          <button
            onClick={() => setShowTradeMarkers(prev => !prev)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 border ${
              showTradeMarkers
                ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/60 shadow-sm font-semibold'
                : 'bg-[#2B2F36]/60 text-[#848E9C] border-[#2B2F36] hover:text-[#EAECEF] hover:bg-[#2B3139]'
            }`}
            title="點擊開關 K 線圖上的買進/賣出標示"
          >
            <span className={`w-2 h-2 rounded-full ${showTradeMarkers ? 'bg-[#3b82f6] animate-pulse' : 'bg-gray-500'}`} />
            <span>買賣訊號標示: {showTradeMarkers ? '已顯示' : '已關閉'}</span>
          </button>
        </div>
      </div>

      {/* Main Chart Container with Top-Left Legend Overlay */}
      <div className="relative w-full h-[480px]">
        {/* TOP-LEFT CORNER NUMERICAL VALUES OVERLAY */}
        {hoverLegend && (
          <div className="absolute top-2 left-3 z-10 pointer-events-none max-w-[90%] bg-[#0B0E11]/90 backdrop-blur-md px-3 py-2 rounded-md border border-[#2B2F36]/80 text-[11px] font-mono space-y-1 shadow-lg text-[#EAECEF]">
            {/* Row 1: OHLCV Values */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[#848E9C] font-semibold">{hoverLegend.date}</span>
              <span>開: <strong className="text-[#EAECEF]">{hoverLegend.open}</strong></span>
              <span>高: <strong className="text-[#F84960]">{hoverLegend.high}</strong></span>
              <span>低: <strong className="text-[#02C076]">{hoverLegend.low}</strong></span>
              <span>收: <strong className="text-[#EAECEF]">{hoverLegend.close}</strong></span>
              <span className={hoverLegend.change >= 0 ? 'text-[#F84960] font-bold' : 'text-[#02C076] font-bold'}>
                {hoverLegend.change >= 0 ? '+' : ''}{hoverLegend.change.toFixed(2)} ({hoverLegend.changePercent >= 0 ? '+' : ''}{hoverLegend.changePercent.toFixed(2)}%)
              </span>
              <span className="text-[#848E9C]">量: {hoverLegend.volume.toLocaleString()}</span>
            </div>

            {/* Row 2: 8 EMA Values ordered in sequence */}
            {showEMAs && hoverLegend.emas && hoverLegend.emas.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 border-t border-[#2B2F36]/50 text-[10.5px]">
                {hoverLegend.emas.map((ema, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: ema.color }} />
                    <span style={{ color: ema.color }} className="font-semibold">
                      EMA({ema.period}):
                    </span>
                    <span className="text-[#EAECEF]">
                      {ema.value !== null && ema.value !== undefined ? ema.value.toFixed(2) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
