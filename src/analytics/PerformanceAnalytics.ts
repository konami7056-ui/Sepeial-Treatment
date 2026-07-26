import { TradePosition, EquityPoint, PerformanceMetrics } from '../types/backtest';

export class PerformanceAnalytics {
  static calculateMetrics(
    initialCapital: number,
    equityCurve: EquityPoint[],
    trades: TradePosition[]
  ): PerformanceMetrics {
    if (!equityCurve || equityCurve.length === 0) {
      return this.emptyMetrics();
    }

    const finalEquity = equityCurve[equityCurve.length - 1].equity;
    const netProfit = finalEquity - initialCapital;
    const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;

    // Calculate CAGR
    const startDate = new Date(equityCurve[0].date);
    const endDate = new Date(equityCurve[equityCurve.length - 1].date);
    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const totalYears = totalDays / 365.25;

    const cagr = totalYears > 0 ? (Math.pow(finalEquity / initialCapital, 1 / totalYears) - 1) * 100 : totalReturn;
    const annualReturn = cagr;

    // Max Drawdown
    let maxDrawdown = 0;
    equityCurve.forEach(pt => {
      if (pt.drawdownPercent < maxDrawdown) {
        maxDrawdown = pt.drawdownPercent;
      }
    });

    // Daily Returns for Sharpe & Sortino Ratios
    const dailyReturns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1].equity;
      const curr = equityCurve[i].equity;
      if (prev > 0) {
        dailyReturns.push((curr - prev) / prev);
      }
    }

    const meanReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
    const variance = dailyReturns.length > 0
      ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / dailyReturns.length
      : 0;
    const stdDev = Math.sqrt(variance);

    // Downside standard deviation for Sortino
    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideVariance = downsideReturns.length > 0
      ? downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length
      : 0.0001;
    const downsideStdDev = Math.sqrt(downsideVariance);

    const riskFreeRateAnnual = 0.015; // 1.5% Risk Free Rate
    const riskFreeRateDaily = riskFreeRateAnnual / 252;

    const sharpeRatio = stdDev > 0 ? ((meanReturn - riskFreeRateDaily) / stdDev) * Math.sqrt(252) : 0;
    const sortinoRatio = downsideStdDev > 0 ? ((meanReturn - riskFreeRateDaily) / downsideStdDev) * Math.sqrt(252) : 0;
    const calmarRatio = Math.abs(maxDrawdown) > 0 ? cagr / Math.abs(maxDrawdown) : 0;

    // Trade stats
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const tradeCount = closedTrades.length;
    const winningTradesList = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTradesList = closedTrades.filter(t => (t.pnl || 0) <= 0);

    const winningTrades = winningTradesList.length;
    const losingTrades = losingTradesList.length;
    const winRate = tradeCount > 0 ? (winningTrades / tradeCount) * 100 : 0;

    const grossProfit = winningTradesList.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losingTradesList.reduce((sum, t) => sum + (t.pnl || 0), 0));

    const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
    const winLossRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin;

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
    const expectancy = tradeCount > 0 ? (netProfit / tradeCount) : 0;

    const rValues = closedTrades.map(t => t.rReturn || 0);
    const averageR = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0;

    const totalHoldingDays = closedTrades.reduce((sum, t) => sum + (t.holdingDays || 0), 0);
    const averageHoldingDays = tradeCount > 0 ? totalHoldingDays / tradeCount : 0;

    // Consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    closedTrades.forEach(t => {
      if ((t.pnl || 0) > 0) {
        currentWins++;
        currentLosses = 0;
        if (currentWins > maxConsecutiveWins) maxConsecutiveWins = currentWins;
      } else {
        currentLosses++;
        currentWins = 0;
        if (currentLosses > maxConsecutiveLosses) maxConsecutiveLosses = currentLosses;
      }
    });

    const totalFeesPaid = closedTrades.reduce((sum, t) => {
      const entryFees = t.entryOrders.reduce((eSum, o) => eSum + o.cost, 0);
      const exitFee = t.exitOrder ? t.exitOrder.cost : 0;
      return sum + entryFees + exitFee;
    }, 0);

    return {
      totalReturn,
      cagr,
      annualReturn,
      maxDrawdown,
      maxDrawdownDurationDays: 0,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      winRate,
      tradeCount,
      winningTrades,
      losingTrades,
      averageWin,
      averageLoss,
      winLossRatio,
      profitFactor,
      expectancy,
      averageR,
      averageHoldingDays,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      netProfit,
      totalFeesPaid
    };
  }

  static emptyMetrics(): PerformanceMetrics {
    return {
      totalReturn: 0,
      cagr: 0,
      annualReturn: 0,
      maxDrawdown: 0,
      maxDrawdownDurationDays: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      winRate: 0,
      tradeCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0,
      winLossRatio: 0,
      profitFactor: 0,
      expectancy: 0,
      averageR: 0,
      averageHoldingDays: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      netProfit: 0,
      totalFeesPaid: 0
    };
  }
}
