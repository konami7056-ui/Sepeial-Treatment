import { OHLCV } from '../types/stock';
import { TurtleStrategyParams } from '../types/strategy';
import { BacktestConfig, PerformanceMetrics } from '../types/backtest';
import { BacktestEngine } from '../backtest/BacktestEngine';
import { ParameterOptimization } from '../optimization/ParameterOptimization';

export interface WalkForwardWindow {
  windowIndex: number;
  inSampleStartDate: string;
  inSampleEndDate: string;
  outOfSampleStartDate: string;
  outOfSampleEndDate: string;
  bestParamsInSample: TurtleStrategyParams;
  inSampleMetrics: PerformanceMetrics;
  outOfSampleMetrics: PerformanceMetrics;
}

export class WalkForwardEngine {
  static runWalkForward(
    symbol: string,
    bars: OHLCV[],
    config: BacktestConfig,
    inSampleBarsCount: number = 500,  // ~2 Years
    outOfSampleBarsCount: number = 250 // ~1 Year
  ): { windows: WalkForwardWindow[]; combinedOutOfSampleEquity: number } {
    if (!bars || bars.length < (inSampleBarsCount + outOfSampleBarsCount)) {
      return { windows: [], combinedOutOfSampleEquity: 0 };
    }

    const windows: WalkForwardWindow[] = [];
    let stepIndex = 0;
    let windowIdx = 1;

    while (stepIndex + inSampleBarsCount + outOfSampleBarsCount <= bars.length) {
      const isBars = bars.slice(stepIndex, stepIndex + inSampleBarsCount);
      const oosBars = bars.slice(stepIndex + inSampleBarsCount, stepIndex + inSampleBarsCount + outOfSampleBarsCount);

      // Run optimization on In-Sample
      const optResults = ParameterOptimization.gridSearchTurtle(symbol, isBars, config);
      const bestParams: TurtleStrategyParams = optResults.length > 0 ? optResults[0].params : {
        system: 1, entryBreakoutDays: 20, exitDays: 10, atrPeriod: 20, riskPercent: 1.0, stopLossAtr: 2.0, pyramidAtr: 0.5, maxPyramidUnits: 4, allowShort: false
      };

      const isBacktest = BacktestEngine.runTurtleBacktest(symbol, isBars, bestParams, config);
      const oosBacktest = BacktestEngine.runTurtleBacktest(symbol, oosBars, bestParams, config);

      windows.push({
        windowIndex: windowIdx++,
        inSampleStartDate: isBars[0].date,
        inSampleEndDate: isBars[isBars.length - 1].date,
        outOfSampleStartDate: oosBars[0].date,
        outOfSampleEndDate: oosBars[oosBars.length - 1].date,
        bestParamsInSample: bestParams,
        inSampleMetrics: isBacktest.metrics,
        outOfSampleMetrics: oosBacktest.metrics
      });

      stepIndex += outOfSampleBarsCount;
    }

    return { windows, combinedOutOfSampleEquity: 0 };
  }
}
