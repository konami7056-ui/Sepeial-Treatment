import React, { useEffect, useRef } from 'react';
import { createChart, AreaSeries, LineSeries, ColorType, LineData } from 'lightweight-charts';
import { EquityPoint } from '../types/backtest';

interface EquityCurveChartProps {
  equityCurve: EquityPoint[];
  initialCapital: number;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ equityCurve, initialCapital }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !equityCurve || equityCurve.length === 0) return;

    containerRef.current.innerHTML = '';

    try {
      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth || 800,
        height: 320,
        layout: {
          background: { type: ColorType.Solid, color: '#0B0E11' },
          textColor: '#848E9C',
        },
        grid: {
          vertLines: { color: '#1E2329' },
          horzLines: { color: '#1E2329' },
        },
        rightPriceScale: {
          borderColor: '#2B2F36',
        },
        timeScale: {
          borderColor: '#2B2F36',
        },
      });

      // Filter and sort equityPoints by date
      const dateSet = new Set<string>();
      const sortedCurve = [...equityCurve]
        .filter(pt => pt && pt.date)
        .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
        .filter(pt => {
          if (dateSet.has(pt.date)) return false;
          dateSet.add(pt.date);
          return true;
        });

      if (sortedCurve.length > 0) {
        // Equity Line
        const equitySeries = chart.addSeries(AreaSeries, {
          topColor: 'rgba(2, 192, 118, 0.4)',
          bottomColor: 'rgba(2, 192, 118, 0.0)',
          lineColor: '#02C076',
          lineWidth: 2,
          title: '淨值 (Equity)',
        });

        const equityData: LineData[] = sortedCurve.map(pt => ({
          time: pt.date as any,
          value: pt.equity,
        }));

        equitySeries.setData(equityData);

        // Initial Capital Line
        const baselineSeries = chart.addSeries(LineSeries, {
          color: '#64748b',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          title: '初始本金',
        });

        const baseData: LineData[] = sortedCurve.map(pt => ({
          time: pt.date as any,
          value: initialCapital,
        }));

        baselineSeries.setData(baseData);

        chart.timeScale().fitContent();
      }

      const handleResize = () => {
        if (containerRef.current) {
          try {
            chart.applyOptions({ width: containerRef.current.clientWidth });
          } catch {
            // ignore
          }
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        try {
          chart.remove();
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.error('EquityCurveChart render error:', err);
    }
  }, [equityCurve, initialCapital]);

  return (
    <div className="w-full bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2F36]">
        <span className="text-sm font-semibold text-[#EAECEF] font-mono">資金淨值成長曲線 (Portfolio Equity Curve)</span>
      </div>
      <div ref={containerRef} className="w-full h-[320px]" />
    </div>
  );
};
