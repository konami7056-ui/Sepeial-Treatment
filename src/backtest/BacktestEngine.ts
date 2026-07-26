import { OHLCV } from '../types/stock';
import { TurtleStrategyParams } from '../types/strategy';
import { BacktestConfig, BacktestResult, TradePosition, EquityPoint, PerformanceMetrics, TradeOrder } from '../types/backtest';
import { evaluateTurtleStrategy } from '../strategies/TurtleStrategy';
import { PerformanceAnalytics } from '../analytics/PerformanceAnalytics';

export class BacktestEngine {
  static runTurtleBacktest(
    symbol: string,
    bars: OHLCV[],
    strategyParams: TurtleStrategyParams,
    config: BacktestConfig
  ): BacktestResult {
    if (!bars || bars.length < 30) {
      return this.emptyResult(symbol, config, bars);
    }

    const { atrValues } = evaluateTurtleStrategy(bars, strategyParams);
    const trades: TradePosition[] = [];
    const equityCurve: EquityPoint[] = [];

    let cash = config.initialCapital;
    let openPosition: TradePosition | null = null;
    let pendingSignal: 'BUY' | 'SELL' | 'EXIT' | 'NONE' = 'NONE';
    let pendingSignalDate = '';

    const breakoutDays = strategyParams.entryBreakoutDays;
    const exitDays = strategyParams.exitDays;

    for (let i = 20; i < bars.length; i++) {
      const currentBar = bars[i];
      const prevBar = bars[i - 1];
      const atr = atrValues[i - 1] || atrValues[i] || 1;

      // Calculate Donchian Breakout Levels based on previous bars
      let highestHigh = bars[i - breakoutDays].high;
      let lowestLow = bars[i - breakoutDays].low;
      for (let j = i - breakoutDays; j < i; j++) {
        if (bars[j].high > highestHigh) highestHigh = bars[j].high;
        if (bars[j].low < lowestLow) lowestLow = bars[j].low;
      }

      let exitLow = bars[i - exitDays].low;
      let exitHigh = bars[i - exitDays].high;
      for (let j = i - exitDays; j < i; j++) {
        if (bars[j].low < exitLow) exitLow = bars[j].low;
        if (bars[j].high > exitHigh) exitHigh = bars[j].high;
      }

      // Execution price logic: NEXT_OPEN vs CURRENT_CLOSE
      const execPrice = config.executionTiming === 'NEXT_OPEN' ? currentBar.open : currentBar.close;

      // 1. Process Pending Order generated from previous bar signal
      if (pendingSignal !== 'NONE') {
        if (pendingSignal === 'BUY' && !openPosition) {
          // Calculate Turtle Position Unit Size: Dollar Volatility = 1% of Capital / ATR
          const riskAmount = cash * (strategyParams.riskPercent / 100);
          const rawShares = Math.floor(riskAmount / atr);
          const shares = Math.max(100, Math.floor(rawShares / 100) * 100); // 1,000 share lot standard in TW, or 100 lot
          const buyPrice = execPrice + (config.slippageTicks * 0.05);

          const cost = this.calculateTransactionCost('BUY', buyPrice, shares, config);

          if (cash >= (buyPrice * shares + cost)) {
            const stopLossPrice = buyPrice - (strategyParams.stopLossAtr * atr);
            const entryOrder: TradeOrder = {
              id: `order-${i}-1`,
              symbol,
              direction: 'LONG',
              action: 'BUY',
              date: currentBar.date,
              timestamp: currentBar.timestamp,
              price: buyPrice,
              shares,
              atrAtTrade: atr,
              reason: `${breakoutDays}日海龜突破進場`,
              cost
            };

            openPosition = {
              id: `pos-${trades.length + 1}`,
              symbol,
              direction: 'LONG',
              entryDate: currentBar.date,
              entryPrice: buyPrice,
              shares,
              units: 1,
              stopLossPrice,
              entryOrders: [entryOrder],
              status: 'OPEN'
            };

            cash -= (buyPrice * shares + cost);
          }
        } else if (pendingSignal === 'EXIT' && openPosition) {
          const sellPrice = Math.max(0.1, execPrice - (config.slippageTicks * 0.05));
          const cost = this.calculateTransactionCost('SELL', sellPrice, openPosition.shares, config);

          const exitOrder: TradeOrder = {
            id: `order-exit-${i}`,
            symbol,
            direction: openPosition.direction,
            action: 'SELL',
            date: currentBar.date,
            timestamp: currentBar.timestamp,
            price: sellPrice,
            shares: openPosition.shares,
            atrAtTrade: atr,
            reason: `${exitDays}日海龜通道反向出場`,
            cost
          };

          const totalCost = openPosition.entryOrders.reduce((sum, o) => sum + o.cost, 0) + cost;
          const grossPnl = (sellPrice - openPosition.entryPrice) * openPosition.shares;
          const netPnl = grossPnl - totalCost;

          const initialRisk = strategyParams.stopLossAtr * atr * openPosition.shares;
          const rReturn = initialRisk > 0 ? netPnl / initialRisk : 0;

          const entryTime = new Date(openPosition.entryDate).getTime();
          const exitTime = new Date(currentBar.date).getTime();
          const holdingDays = Math.max(1, Math.round((exitTime - entryTime) / (1000 * 3600 * 24)));

          openPosition.exitDate = currentBar.date;
          openPosition.exitPrice = sellPrice;
          openPosition.exitOrder = exitOrder;
          openPosition.pnl = netPnl;
          openPosition.pnlPercent = (netPnl / (openPosition.entryPrice * openPosition.shares)) * 100;
          openPosition.holdingDays = holdingDays;
          openPosition.rReturn = rReturn;
          openPosition.status = 'CLOSED';

          trades.push(openPosition);
          cash += (sellPrice * openPosition.shares - cost);
          openPosition = null;
        }

        pendingSignal = 'NONE';
      }

      // 2. Check Intra-day / Current Bar Stop-Loss for Open Position
      if (openPosition) {
        if (openPosition.direction === 'LONG' && currentBar.low <= openPosition.stopLossPrice) {
          // Hard stop loss triggered
          const stopPrice = Math.min(openPosition.stopLossPrice, currentBar.open);
          const cost = this.calculateTransactionCost('SELL', stopPrice, openPosition.shares, config);

          const exitOrder: TradeOrder = {
            id: `order-stop-${i}`,
            symbol,
            direction: 'LONG',
            action: 'SELL',
            date: currentBar.date,
            timestamp: currentBar.timestamp,
            price: stopPrice,
            shares: openPosition.shares,
            atrAtTrade: atr,
            reason: `海龜 ${strategyParams.stopLossAtr} ATR 停損離場`,
            cost
          };

          const totalCost = openPosition.entryOrders.reduce((sum, o) => sum + o.cost, 0) + cost;
          const netPnl = (stopPrice - openPosition.entryPrice) * openPosition.shares - totalCost;
          const initialRisk = strategyParams.stopLossAtr * atr * openPosition.shares;

          openPosition.exitDate = currentBar.date;
          openPosition.exitPrice = stopPrice;
          openPosition.exitOrder = exitOrder;
          openPosition.pnl = netPnl;
          openPosition.pnlPercent = (netPnl / (openPosition.entryPrice * openPosition.shares)) * 100;
          openPosition.holdingDays = Math.max(1, Math.round((currentBar.timestamp - new Date(openPosition.entryDate).getTime()) / (1000 * 3600 * 24)));
          openPosition.rReturn = initialRisk > 0 ? netPnl / initialRisk : -1;
          openPosition.status = 'CLOSED';

          trades.push(openPosition);
          cash += (stopPrice * openPosition.shares - cost);
          openPosition = null;
        }
      }

      // 3. Pyramiding Logic (Add positions every 0.5 ATR up to max units)
      if (openPosition && openPosition.units < strategyParams.maxPyramidUnits) {
        const lastEntryPrice = openPosition.entryOrders[openPosition.entryOrders.length - 1].price;
        const pyramidPriceTarget = lastEntryPrice + (strategyParams.pyramidAtr * atr);

        if (currentBar.high >= pyramidPriceTarget) {
          const addShares = openPosition.entryOrders[0].shares; // Same unit size
          const buyPrice = Math.max(pyramidPriceTarget, currentBar.open);
          const cost = this.calculateTransactionCost('BUY', buyPrice, addShares, config);

          if (cash >= (buyPrice * addShares + cost)) {
            const addOrder: TradeOrder = {
              id: `order-pyr-${i}-${openPosition.units + 1}`,
              symbol,
              direction: 'LONG',
              action: 'PYRAMID_BUY',
              date: currentBar.date,
              timestamp: currentBar.timestamp,
              price: buyPrice,
              shares: addShares,
              atrAtTrade: atr,
              reason: `海龜金字塔加碼 (${openPosition.units + 1}/${strategyParams.maxPyramidUnits})`,
              cost
            };

            cash -= (buyPrice * addShares + cost);
            openPosition.shares += addShares;
            openPosition.units += 1;
            // Adjust stop loss for all units to 2 ATR below latest entry price
            openPosition.stopLossPrice = buyPrice - (strategyParams.stopLossAtr * atr);
            openPosition.entryOrders.push(addOrder);
          }
        }
      }

      // 4. Generate New Signals for Next Bar Execution
      if (!openPosition && currentBar.close > highestHigh) {
        pendingSignal = 'BUY';
        pendingSignalDate = currentBar.date;
      } else if (openPosition && currentBar.close < exitLow) {
        pendingSignal = 'EXIT';
        pendingSignalDate = currentBar.date;
      }

      // Calculate Daily Portfolio Equity
      const currentPositionValue = openPosition ? openPosition.shares * currentBar.close : 0;
      const totalEquity = cash + currentPositionValue;

      equityCurve.push({
        date: currentBar.date,
        timestamp: currentBar.timestamp,
        equity: Math.round(totalEquity),
        cash: Math.round(cash),
        drawdown: 0,
        drawdownPercent: 0
      });
    }

    // Calculate Highwater mark and drawdown curve
    let peak = config.initialCapital;
    equityCurve.forEach(pt => {
      if (pt.equity > peak) peak = pt.equity;
      pt.drawdown = pt.equity - peak;
      pt.drawdownPercent = peak > 0 ? ((pt.equity - peak) / peak) * 100 : 0;
    });

    const metrics = PerformanceAnalytics.calculateMetrics(config.initialCapital, equityCurve, trades);

    return {
      symbol,
      config,
      metrics,
      trades,
      equityCurve,
      ohlcv: bars
    };
  }

  private static calculateTransactionCost(
    action: 'BUY' | 'SELL',
    price: number,
    shares: number,
    config: BacktestConfig
  ): number {
    const tradeValue = price * shares;
    // Taiwan commission: 0.1425% * discount
    let commission = tradeValue * config.commissionRate * config.commissionDiscount;
    commission = Math.max(config.minCommission, commission);

    // Taiwan tax: 0.3% on sell only
    let tax = 0;
    if (action === 'SELL') {
      tax = tradeValue * config.taxRate;
    }

    return commission + tax;
  }

  private static emptyResult(symbol: string, config: BacktestConfig, ohlcv: OHLCV[]): BacktestResult {
    return {
      symbol,
      config,
      metrics: PerformanceAnalytics.emptyMetrics(),
      trades: [],
      equityCurve: [],
      ohlcv
    };
  }
}
