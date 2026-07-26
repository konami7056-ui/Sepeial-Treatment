import { TradePosition } from '../types/backtest';

export interface MonteCarloSimulationResult {
  simulationsCount: number;
  initialCapital: number;
  medianFinalEquity: number;
  percentile5FinalEquity: number;
  percentile95FinalEquity: number;
  medianMaxDrawdown: number;
  worstMaxDrawdown: number;
  riskOfRuinPercent: number; // % of runs that lost > 50% capital
  probabilityOfProfitPercent: number;
  simulatedEquityCurves: number[][]; // Sample curves for rendering
}

export class MonteCarloEngine {
  static runSimulation(
    trades: TradePosition[],
    initialCapital: number = 1000000,
    iterations: number = 1000
  ): MonteCarloSimulationResult {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    if (closedTrades.length === 0) {
      return {
        simulationsCount: 0,
        initialCapital,
        medianFinalEquity: initialCapital,
        percentile5FinalEquity: initialCapital,
        percentile95FinalEquity: initialCapital,
        medianMaxDrawdown: 0,
        worstMaxDrawdown: 0,
        riskOfRuinPercent: 0,
        probabilityOfProfitPercent: 0,
        simulatedEquityCurves: [],
      };
    }

    const tradePnLs = closedTrades.map(t => t.pnl || 0);
    const finalEquities: number[] = [];
    const maxDrawdowns: number[] = [];
    const simulatedCurves: number[][] = [];

    let ruinCount = 0;
    let profitCount = 0;

    for (let i = 0; i < iterations; i++) {
      let currentEquity = initialCapital;
      let peak = initialCapital;
      let maxDD = 0;
      const curve: number[] = [initialCapital];

      // Random reshuffle trade sequence with replacement
      for (let j = 0; j < tradePnLs.length; j++) {
        const randomIndex = Math.floor(Math.random() * tradePnLs.length);
        const pnl = tradePnLs[randomIndex];
        currentEquity += pnl;

        if (currentEquity > peak) peak = currentEquity;
        const dd = peak > 0 ? ((peak - currentEquity) / peak) * 100 : 0;
        if (dd > maxDD) maxDD = dd;

        curve.push(Math.round(currentEquity));
      }

      if (currentEquity < initialCapital * 0.5) ruinCount++;
      if (currentEquity > initialCapital) profitCount++;

      finalEquities.push(currentEquity);
      maxDrawdowns.push(maxDD);

      if (i < 30) {
        simulatedCurves.push(curve);
      }
    }

    finalEquities.sort((a, b) => a - b);
    maxDrawdowns.sort((a, b) => a - b);

    const medianFinalEquity = finalEquities[Math.floor(iterations * 0.5)];
    const percentile5FinalEquity = finalEquities[Math.floor(iterations * 0.05)];
    const percentile95FinalEquity = finalEquities[Math.floor(iterations * 0.95)];

    const medianMaxDrawdown = maxDrawdowns[Math.floor(iterations * 0.5)];
    const worstMaxDrawdown = maxDrawdowns[maxDrawdowns.length - 1];

    return {
      simulationsCount: iterations,
      initialCapital,
      medianFinalEquity: Math.round(medianFinalEquity),
      percentile5FinalEquity: Math.round(percentile5FinalEquity),
      percentile95FinalEquity: Math.round(percentile95FinalEquity),
      medianMaxDrawdown: Math.round(medianMaxDrawdown * 10) / 10,
      worstMaxDrawdown: Math.round(worstMaxDrawdown * 10) / 10,
      riskOfRuinPercent: Math.round((ruinCount / iterations) * 100),
      probabilityOfProfitPercent: Math.round((profitCount / iterations) * 100),
      simulatedEquityCurves: simulatedCurves,
    };
  }
}
