import React, { useState } from 'react';
import { OHLCV } from '../types/stock';
import { BacktestConfig } from '../types/backtest';
import { ParameterOptimization, OptimizationResult } from '../optimization/ParameterOptimization';
import { Cpu, Play, Award, Zap } from 'lucide-react';

interface OptimizationViewProps {
  symbol: string;
  bars: OHLCV[];
  config: BacktestConfig;
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({ symbol, bars, config }) => {
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunOptimization = () => {
    setIsRunning(true);
    setTimeout(() => {
      const optResults = ParameterOptimization.gridSearchTurtle(
        symbol,
        bars,
        config,
        [10, 15, 20, 30, 40, 55], // Entry breakouts
        [5, 10, 15, 20],         // Exits
        [1.5, 2.0, 2.5, 3.0]     // Stop ATRs
      );
      setResults(optResults);
      setIsRunning(false);
    }, 100);
  };

  return (
    <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2B2F36] pb-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#38bdf8]/10 text-[#38bdf8] rounded border border-[#38bdf8]/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#EAECEF]">網格搜尋參數最佳化 Engine (Grid Search Optimization)</h3>
            <p className="text-xs text-[#848E9C]">同時評估夏普比率 (Sharpe)、CAGR、Max Drawdown、Profit Factor 多維度指標</p>
          </div>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={isRunning}
          className="bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold px-5 py-2 rounded text-xs transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50 font-mono shrink-0"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{isRunning ? '執行網格計算中...' : 'START GRID SEARCH'}</span>
        </button>
      </div>

      {results.length === 0 ? (
        <div className="p-8 text-center text-[#848E9C] text-xs bg-[#0B0E11] rounded border border-[#2B2F36]">
          <Zap className="w-8 h-8 text-[#38bdf8]/50 mx-auto mb-2" />
          <p className="font-semibold text-[#EAECEF]">點擊【START GRID SEARCH】以對 {symbol} 進行海龜參數空間探索</p>
          <p className="text-[11px] text-[#848E9C] mt-1 font-mono">將自動測試 70+ 組通道長度與 ATR 停損組合</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#EAECEF] font-mono">最佳化結果 (共 {results.length} 組參數組合，依 Sharpe Ratio 排序):</span>
            <span className="text-[11px] text-[#38bdf8] font-mono">Top 1 推薦: System {results[0].params.system} ({results[0].params.entryBreakoutDays}d / {results[0].params.exitDays}d, Stop {results[0].params.stopLossAtr} ATR)</span>
          </div>

          <div className="overflow-x-auto max-h-[420px] scrollbar-thin rounded border border-[#2B2F36]">
            <table className="w-full text-left text-xs text-[#EAECEF]">
              <thead className="bg-[#0B0E11] text-[#848E9C] text-[10px] uppercase font-mono sticky top-0 border-b border-[#2B2F36]">
                <tr>
                  <th className="p-2.5">排名</th>
                  <th className="p-2.5">進場通道</th>
                  <th className="p-2.5">出場通道</th>
                  <th className="p-2.5">停損 ATR</th>
                  <th className="p-2.5">CAGR %</th>
                  <th className="p-2.5">Sharpe</th>
                  <th className="p-2.5">Sortino</th>
                  <th className="p-2.5">Max DD %</th>
                  <th className="p-2.5">勝率 %</th>
                  <th className="p-2.5">Profit Factor</th>
                  <th className="p-2.5">交易筆數</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329] font-mono text-[11px]">
                {results.map((r, idx) => (
                  <tr key={idx} className={idx === 0 ? 'bg-[#38bdf8]/10 font-bold text-[#38bdf8]' : 'hover:bg-[#2B3139]/50 transition'}>
                    <td className="p-2.5">
                      {idx === 0 ? <Award className="w-4 h-4 text-amber-400 inline mr-1" /> : `#${idx + 1}`}
                    </td>
                    <td className="p-2.5 text-[#38bdf8] font-bold">{r.params.entryBreakoutDays} 日</td>
                    <td className="p-2.5 text-[#EAECEF]">{r.params.exitDays} 日</td>
                    <td className="p-2.5 text-amber-400">{r.params.stopLossAtr} ATR</td>
                    <td className={`p-2.5 font-bold ${r.metrics.cagr >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'}`}>+{r.metrics.cagr.toFixed(2)}%</td>
                    <td className="p-2.5 text-[#38bdf8] font-bold">{r.metrics.sharpeRatio.toFixed(2)}</td>
                    <td className="p-2.5 text-[#EAECEF]">{r.metrics.sortinoRatio.toFixed(2)}</td>
                    <td className="p-2.5 text-[#F84960]">{r.metrics.maxDrawdown.toFixed(2)}%</td>
                    <td className="p-2.5 text-[#EAECEF]">{r.metrics.winRate.toFixed(1)}%</td>
                    <td className="p-2.5 text-[#38bdf8]">{r.metrics.profitFactor.toFixed(2)}</td>
                    <td className="p-2.5 text-[#848E9C]">{r.metrics.tradeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
