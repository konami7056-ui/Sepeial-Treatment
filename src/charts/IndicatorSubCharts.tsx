import React, { useState, useEffect, useRef } from 'react';
import { createChart, LineSeries, HistogramSeries, ColorType, LineData, HistogramData, IChartApi } from 'lightweight-charts';
import { IndicatorValues } from '../types/indicator';
import { Timeframe } from '../types/stock';
import { getBiasParamsForTimeframe } from '../indicators';

interface IndicatorSubChartsProps {
  indicators: IndicatorValues[];
  timeframe?: Timeframe;
  activeTab?: 'ALL' | 'RSI' | 'KD' | 'BIAS' | 'MACD';
  syncChartsRef?: React.MutableRefObject<Map<string, IChartApi>>;
}

interface HoverSubchartValues {
  date: string;
  rsi1: number | null;
  rsi2: number | null;
  kdK: number | null;
  kdD: number | null;
  bias: number | null;
  biasAvg1: number | null;
  biasAvg2: number | null;
  macdDif: number | null;
  macdDea: number | null;
  macdHist: number | null;
}

export const IndicatorSubCharts: React.FC<IndicatorSubChartsProps> = ({
  indicators,
  timeframe = '1D',
  activeTab = 'ALL',
  syncChartsRef
}) => {
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const kdContainerRef = useRef<HTMLDivElement>(null);
  const biasContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);

  const [hoverValues, setHoverValues] = useState<HoverSubchartValues | null>(null);
  const biasParams = getBiasParamsForTimeframe((timeframe || '1D') as Timeframe);

  useEffect(() => {
    if (!indicators || indicators.length === 0) return;

    // Filter and sort indicators by date
    const dateSet = new Set<string>();
    const sortedIndicators = [...indicators]
      .filter(i => i && i.date)
      .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
      .filter(i => {
        if (dateSet.has(i.date)) return false;
        dateSet.add(i.date);
        return true;
      });

    const indMap = new Map<string, IndicatorValues>();
    sortedIndicators.forEach(i => indMap.set(i.date, i));

    const charts: { key: string; chart: IChartApi }[] = [];

    const commonOptions = {
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
      rightPriceScale: {
        borderColor: '#2B2F36',
      },
      timeScale: {
        borderColor: '#2B2F36',
        timeVisible: true,
        secondsVisible: false,
      }
    };

    // Helper to build hover values object
    const buildHoverObj = (targetDate: string): HoverSubchartValues | null => {
      const ind = indMap.get(targetDate);
      if (!ind) return null;
      return {
        date: ind.date,
        rsi1: ind.rsi1,
        rsi2: ind.rsi2,
        kdK: ind.kdK,
        kdD: ind.kdD,
        bias: ind.bias,
        biasAvg1: ind.biasAvg1,
        biasAvg2: ind.biasAvg2,
        macdDif: ind.macdDif,
        macdDea: ind.macdDea,
        macdHist: ind.macdHist,
      };
    };

    const lastInd = sortedIndicators[sortedIndicators.length - 1];
    if (lastInd) {
      setHoverValues(buildHoverObj(lastInd.date));
    }

    // Helper to create chart
    const createSubChart = (key: string, container: HTMLDivElement | null, height: number = 160) => {
      if (!container) return null;
      container.innerHTML = '';
      const chart = createChart(container, {
        width: container.clientWidth || 800,
        height,
        ...commonOptions,
      });

      if (syncChartsRef) {
        syncChartsRef.current.set(key, chart);
      }
      charts.push({ key, chart });

      // Crosshair handler
      chart.subscribeCrosshairMove(param => {
        if (param.time && typeof param.time === 'string') {
          const hoverObj = buildHoverObj(param.time);
          if (hoverObj) {
            setHoverValues(hoverObj);
            return;
          }
        }
        if (lastInd) {
          setHoverValues(buildHoverObj(lastInd.date));
        }
      });

      return chart;
    };

    // 1. RSI Chart
    if ((activeTab === 'ALL' || activeTab === 'RSI') && rsiContainerRef.current) {
      const rsiChart = createSubChart('rsi', rsiContainerRef.current, activeTab === 'RSI' ? 220 : 160);
      if (rsiChart) {
        const rsi1Series = rsiChart.addSeries(LineSeries, { color: '#38bdf8', lineWidth: 1, title: '' });
        const rsi2Series = rsiChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: '' });

        const d1: any[] = sortedIndicators.map(i => (i.rsi1 !== null && i.rsi1 !== undefined ? { time: i.date as any, value: i.rsi1 } : { time: i.date as any }));
        const d2: any[] = sortedIndicators.map(i => (i.rsi2 !== null && i.rsi2 !== undefined ? { time: i.date as any, value: i.rsi2 } : { time: i.date as any }));

        rsi1Series.setData(d1);
        rsi2Series.setData(d2);
        rsiChart.timeScale().fitContent();
      }
    }

    // 2. KD Chart
    if ((activeTab === 'ALL' || activeTab === 'KD') && kdContainerRef.current) {
      const kdChart = createSubChart('kd', kdContainerRef.current, activeTab === 'KD' ? 220 : 160);
      if (kdChart) {
        const kSeries = kdChart.addSeries(LineSeries, { color: '#38bdf8', lineWidth: 1, title: '' });
        const dSeries = kdChart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 1, title: '' });

        const dK: any[] = sortedIndicators.map(i => (i.kdK !== null && i.kdK !== undefined ? { time: i.date as any, value: i.kdK } : { time: i.date as any }));
        const dD: any[] = sortedIndicators.map(i => (i.kdD !== null && i.kdD !== undefined ? { time: i.date as any, value: i.kdD } : { time: i.date as any }));

        kSeries.setData(dK);
        dSeries.setData(dD);
        kdChart.timeScale().fitContent();
      }
    }

    // 3. BIAS Chart (3 Lines)
    if ((activeTab === 'ALL' || activeTab === 'BIAS') && biasContainerRef.current) {
      const biasChart = createSubChart('bias', biasContainerRef.current, activeTab === 'BIAS' ? 220 : 160);
      if (biasChart) {
        const biasSeries = biasChart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 1, title: '' });
        const biasAvg1Series = biasChart.addSeries(LineSeries, { color: '#38bdf8', lineWidth: 1, title: '' });
        const biasAvg2Series = biasChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: '' });

        const dBias: any[] = sortedIndicators.map(i => (i.bias !== null && i.bias !== undefined ? { time: i.date as any, value: i.bias } : { time: i.date as any }));
        const dBiasAvg1: any[] = sortedIndicators.map(i => (i.biasAvg1 !== null && i.biasAvg1 !== undefined ? { time: i.date as any, value: i.biasAvg1 } : { time: i.date as any }));
        const dBiasAvg2: any[] = sortedIndicators.map(i => (i.biasAvg2 !== null && i.biasAvg2 !== undefined ? { time: i.date as any, value: i.biasAvg2 } : { time: i.date as any }));

        biasSeries.setData(dBias);
        biasAvg1Series.setData(dBiasAvg1);
        biasAvg2Series.setData(dBiasAvg2);
        biasChart.timeScale().fitContent();
      }
    }

    // 4. MACD Chart
    if ((activeTab === 'ALL' || activeTab === 'MACD') && macdContainerRef.current) {
      const macdChart = createSubChart('macd', macdContainerRef.current, activeTab === 'MACD' ? 220 : 160);
      if (macdChart) {
        const difSeries = macdChart.addSeries(LineSeries, { color: '#38bdf8', lineWidth: 1, title: '' });
        const deaSeries = macdChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: '' });
        const histSeries = macdChart.addSeries(HistogramSeries, { title: '' });

        const dDif: any[] = sortedIndicators.map(i => (i.macdDif !== null && i.macdDif !== undefined ? { time: i.date as any, value: i.macdDif } : { time: i.date as any }));
        const dDea: any[] = sortedIndicators.map(i => (i.macdDea !== null && i.macdDea !== undefined ? { time: i.date as any, value: i.macdDea } : { time: i.date as any }));
        const dHist: any[] = sortedIndicators.map(i => (i.macdHist !== null && i.macdHist !== undefined ? {
          time: i.date as any,
          value: i.macdHist,
          color: i.macdHist >= 0 ? 'rgba(248, 73, 96, 0.6)' : 'rgba(2, 192, 118, 0.6)'
        } : { time: i.date as any }));

        difSeries.setData(dDif);
        deaSeries.setData(dDea);
        histSeries.setData(dHist);
        macdChart.timeScale().fitContent();
      }
    }

    // Synchronize visible logical ranges among ALL registered charts
    let isSyncing = false;
    charts.forEach(({ key, chart }) => {
      chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (isSyncing || !range || !syncChartsRef) return;
        isSyncing = true;
        syncChartsRef.current.forEach((otherChart, otherKey) => {
          if (otherKey !== key && otherChart) {
            try {
              otherChart.timeScale().setVisibleLogicalRange(range);
            } catch {
              // ignore
            }
          }
        });
        isSyncing = false;
      });
    });

    // Also sync subcharts to main chart's current logical range on initial render if main exists
    if (syncChartsRef && syncChartsRef.current.has('main')) {
      const mainChart = syncChartsRef.current.get('main');
      if (mainChart) {
        try {
          const mainRange = mainChart.timeScale().getVisibleLogicalRange();
          if (mainRange) {
            charts.forEach(({ chart }) => {
              chart.timeScale().setVisibleLogicalRange(mainRange);
            });
          }
        } catch {
          // ignore
        }
      }
    }

    const handleResize = () => {
      charts.forEach(({ chart }) => {
        try {
          const parent = chart.chartElement().parentElement;
          if (parent) {
            chart.applyOptions({ width: parent.clientWidth });
          }
        } catch {
          // ignore
        }
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      charts.forEach(({ key, chart }) => {
        try {
          if (syncChartsRef) syncChartsRef.current.delete(key);
          chart.remove();
        } catch {
          // ignore
        }
      });
    };
  }, [indicators, activeTab, timeframe, syncChartsRef]);

  return (
    <div className="space-y-3 w-full font-mono">
      {/* 1. RSI Subchart */}
      {(activeTab === 'ALL' || activeTab === 'RSI') && (
        <div className="w-full bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2F36]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#EAECEF]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block"></span>
              <span>1. RSI 相對強弱指標 (17, 44)</span>
            </div>
          </div>
          
          <div className="relative w-full h-[160px]">
            {/* Top-Left Overlay Legend */}
            {hoverValues && (
              <div className="absolute top-1.5 left-2 z-10 pointer-events-none bg-[#0B0E11]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#2B2F36]/80 text-[11px] flex items-center space-x-3 text-[#EAECEF] shadow-md">
                <span className="text-[#848E9C] font-semibold">{hoverValues.date}</span>
                <span className="text-[#38bdf8] font-semibold">
                  RSI(17): {hoverValues.rsi1 !== null && hoverValues.rsi1 !== undefined ? hoverValues.rsi1.toFixed(2) : '-'}
                </span>
                <span className="text-[#f59e0b] font-semibold">
                  RSI(44): {hoverValues.rsi2 !== null && hoverValues.rsi2 !== undefined ? hoverValues.rsi2.toFixed(2) : '-'}
                </span>
              </div>
            )}
            <div ref={rsiContainerRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* 2. KD Subchart */}
      {(activeTab === 'ALL' || activeTab === 'KD') && (
        <div className="w-full bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2F36]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#EAECEF]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block"></span>
              <span>2. KD 隨機指標 (17, 3, 3)</span>
            </div>
          </div>

          <div className="relative w-full h-[160px]">
            {/* Top-Left Overlay Legend */}
            {hoverValues && (
              <div className="absolute top-1.5 left-2 z-10 pointer-events-none bg-[#0B0E11]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#2B2F36]/80 text-[11px] flex items-center space-x-3 text-[#EAECEF] shadow-md">
                <span className="text-[#848E9C] font-semibold">{hoverValues.date}</span>
                <span className="text-[#38bdf8] font-semibold">
                  K(17,3): {hoverValues.kdK !== null && hoverValues.kdK !== undefined ? hoverValues.kdK.toFixed(2) : '-'}
                </span>
                <span className="text-[#ec4899] font-semibold">
                  D(17,3): {hoverValues.kdD !== null && hoverValues.kdD !== undefined ? hoverValues.kdD.toFixed(2) : '-'}
                </span>
              </div>
            )}
            <div ref={kdContainerRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* 3. BIAS Subchart (3 Lines) */}
      {(activeTab === 'ALL' || activeTab === 'BIAS') && (
        <div className="w-full bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2F36]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#EAECEF]">
              <span className="w-2 h-2 rounded-full bg-[#a855f7] inline-block"></span>
              <span>3. BIAS 乖離率三線 ({timeframe}週期: {biasParams.maPeriod}, {biasParams.avg1Period}, {biasParams.avg2Period})</span>
            </div>
          </div>

          <div className="relative w-full h-[160px]">
            {/* Top-Left Overlay Legend */}
            {hoverValues && (
              <div className="absolute top-1.5 left-2 z-10 pointer-events-none bg-[#0B0E11]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#2B2F36]/80 text-[11px] flex items-center space-x-3 text-[#EAECEF] shadow-md">
                <span className="text-[#848E9C] font-semibold">{hoverValues.date}</span>
                <span className="text-[#a855f7] font-semibold">
                  BIAS({biasParams.maPeriod}): {hoverValues.bias !== null && hoverValues.bias !== undefined ? `${hoverValues.bias >= 0 ? '+' : ''}${hoverValues.bias.toFixed(2)}%` : '-'}
                </span>
                <span className="text-[#38bdf8] font-semibold">
                  Avg1({biasParams.avg1Period}): {hoverValues.biasAvg1 !== null && hoverValues.biasAvg1 !== undefined ? `${hoverValues.biasAvg1 >= 0 ? '+' : ''}${hoverValues.biasAvg1.toFixed(2)}%` : '-'}
                </span>
                <span className="text-[#f59e0b] font-semibold">
                  Avg2({biasParams.avg2Period}): {hoverValues.biasAvg2 !== null && hoverValues.biasAvg2 !== undefined ? `${hoverValues.biasAvg2 >= 0 ? '+' : ''}${hoverValues.biasAvg2.toFixed(2)}%` : '-'}
                </span>
              </div>
            )}
            <div ref={biasContainerRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* 4. MACD Subchart */}
      {(activeTab === 'ALL' || activeTab === 'MACD') && (
        <div className="w-full bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2F36]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#EAECEF]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block"></span>
              <span>4. MACD 指數平滑異同移動平均線 (17, 45, 17)</span>
            </div>
          </div>

          <div className="relative w-full h-[160px]">
            {/* Top-Left Overlay Legend */}
            {hoverValues && (
              <div className="absolute top-1.5 left-2 z-10 pointer-events-none bg-[#0B0E11]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#2B2F36]/80 text-[11px] flex items-center space-x-3 text-[#EAECEF] shadow-md">
                <span className="text-[#848E9C] font-semibold">{hoverValues.date}</span>
                <span className="text-[#38bdf8] font-semibold">
                  DIF: {hoverValues.macdDif !== null && hoverValues.macdDif !== undefined ? hoverValues.macdDif.toFixed(2) : '-'}
                </span>
                <span className="text-[#f59e0b] font-semibold">
                  DEA: {hoverValues.macdDea !== null && hoverValues.macdDea !== undefined ? hoverValues.macdDea.toFixed(2) : '-'}
                </span>
                <span className={(hoverValues.macdHist || 0) >= 0 ? 'text-[#F84960] font-semibold' : 'text-[#02C076] font-semibold'}>
                  MACD Hist: {hoverValues.macdHist !== null && hoverValues.macdHist !== undefined ? `${hoverValues.macdHist >= 0 ? '+' : ''}${hoverValues.macdHist.toFixed(2)}` : '-'}
                </span>
              </div>
            )}
            <div ref={macdContainerRef} className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
};
