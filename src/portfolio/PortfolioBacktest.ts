import { OHLCV } from '../types/stock';
import { TurtleStrategyParams } from '../types/strategy';
import { BacktestConfig, BacktestResult, PerformanceMetrics } from '../types/backtest';
import { BacktestEngine } from '../backtest/BacktestEngine';
import { PerformanceAnalytics } from '../analytics/PerformanceAnalytics';

export interface PortfolioItem {
  symbol: string;
  weight: number; // e.g. 0.20 (20%)
  bars: OHLCV[];
  backtestResult?: BacktestResult;
}

export class PortfolioBacktest {
  static runPortfolio(
    items: PortfolioItem[],
    strategyParams: TurtleStrategyParams,
    config: BacktestConfig
  ): { combinedEquityCurve: { date: string; equity: number; drawdownPercent: number }[]; metrics: PerformanceMetrics; itemResults: Map<string, BacktestResult> } {
    const itemResults = new Map<string, BacktestResult>();

    items.forEach(item => {
      const allocatedCapital = config.initialCapital * item.weight;
      const subConfig = { ...config, initialCapital: allocatedCapital };
      const res = BacktestEngine.runTurtleBacktest(item.symbol, item.bars, strategyParams, subConfig);
      itemResults.set(item.symbol, res);
    });

    // Merge equity curves by date
    const dateMap = new Map<string, number>();
    itemResults.forEach((res) => {
      res.equityCurve.forEach(pt => {
        const existing = dateMap.get(pt.date) || 0;
        dateMap.set(pt.date, existing + pt.equity);
      });
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    let peak = config.initialCapital;
    const combinedEquityCurve = sortedDates.map(date => {
      const equity = dateMap.get(date) || config.initialCapital;
      if (equity > peak) peak = equity;
      const drawdownPercent = peak > 0 ? ((equity - peak) / peak) * 100 : 0;
      return { date, equity: Math.round(equity), drawdownPercent };
    });

    // Combine all trades
    const allTrades = Array.from(itemResults.values()).flatMap(r => r.trades);
    const metrics = PerformanceAnalytics.calculateMetrics(config.initialCapital, combinedEquityCurve as any, allTrades);

    return {
      combinedEquityCurve,
      metrics,
      itemResults
    };
  }
}
