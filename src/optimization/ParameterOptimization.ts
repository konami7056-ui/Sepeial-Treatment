import { OHLCV } from '../types/stock';
import { TurtleStrategyParams } from '../types/strategy';
import { BacktestConfig, BacktestResult, PerformanceMetrics } from '../types/backtest';
import { BacktestEngine } from '../backtest/BacktestEngine';

export interface OptimizationResult {
  params: TurtleStrategyParams;
  metrics: PerformanceMetrics;
}

export class ParameterOptimization {
  static gridSearchTurtle(
    symbol: string,
    bars: OHLCV[],
    config: BacktestConfig,
    breakoutOptions: number[] = [10, 20, 40, 55],
    exitOptions: number[] = [5, 10, 20],
    stopAtrOptions: number[] = [1.5, 2.0, 3.0]
  ): OptimizationResult[] {
    const results: OptimizationResult[] = [];

    for (const entryBreakoutDays of breakoutOptions) {
      for (const exitDays of exitOptions) {
        if (exitDays >= entryBreakoutDays) continue; // Exit channel must be shorter than entry channel
        for (const stopLossAtr of stopAtrOptions) {
          const params: TurtleStrategyParams = {
            system: entryBreakoutDays === 20 ? 1 : 2,
            entryBreakoutDays,
            exitDays,
            atrPeriod: 20,
            riskPercent: 1.0,
            stopLossAtr,
            pyramidAtr: 0.5,
            maxPyramidUnits: 4,
            allowShort: false,
          };

          const backtest = BacktestEngine.runTurtleBacktest(symbol, bars, params, config);
          results.push({
            params,
            metrics: backtest.metrics,
          });
        }
      }
    }

    // Sort by Sharpe Ratio descending
    return results.sort((a, b) => b.metrics.sharpeRatio - a.metrics.sharpeRatio);
  }
}
