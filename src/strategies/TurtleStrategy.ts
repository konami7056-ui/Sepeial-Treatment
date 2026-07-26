import { OHLCV } from '../types/stock';
import { TurtleStrategyParams } from '../types/strategy';
import { calculateATR } from '../indicators/atr';

export interface TurtleSignal {
  barIndex: number;
  date: string;
  type: 'BUY_BREAKOUT' | 'SELL_BREAKOUT' | 'EXIT_LONG' | 'EXIT_SHORT' | 'PYRAMID_BUY' | 'PYRAMID_SHORT' | 'NONE';
  price: number;
  atr: number;
  breakoutHigh?: number;
  breakoutLow?: number;
}

export function evaluateTurtleStrategy(
  bars: OHLCV[],
  params: TurtleStrategyParams
): { atrValues: (number | null)[]; signals: TurtleSignal[] } {
  const len = bars.length;
  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const closes = bars.map(b => b.close);

  const atrValues = calculateATR(highs, lows, closes, params.atrPeriod);
  const signals: TurtleSignal[] = [];

  const breakoutPeriod = params.entryBreakoutDays;
  const exitPeriod = params.exitDays;

  for (let i = Math.max(breakoutPeriod, params.atrPeriod); i < len; i++) {
    const atr = atrValues[i - 1] || atrValues[i] || 1;

    // Highest high of previous N bars (excluding current bar i)
    let highestHigh = highs[i - breakoutPeriod];
    for (let j = i - breakoutPeriod; j < i; j++) {
      if (highs[j] > highestHigh) highestHigh = highs[j];
    }

    // Lowest low of previous N bars (excluding current bar i)
    let lowestLow = lows[i - breakoutPeriod];
    for (let j = i - breakoutPeriod; j < i; j++) {
      if (lows[j] < lowestLow) lowestLow = lows[j];
    }

    // Exit channels
    let exitLow = lows[i - exitPeriod];
    for (let j = i - exitPeriod; j < i; j++) {
      if (lows[j] < exitLow) exitLow = lows[j];
    }

    let exitHigh = highs[i - exitPeriod];
    for (let j = i - exitPeriod; j < i; j++) {
      if (highs[j] > exitHigh) exitHigh = highs[j];
    }

    let type: TurtleSignal['type'] = 'NONE';

    if (bars[i].high > highestHigh) {
      type = 'BUY_BREAKOUT';
    } else if (params.allowShort && bars[i].low < lowestLow) {
      type = 'SELL_BREAKOUT';
    } else if (bars[i].low < exitLow) {
      type = 'EXIT_LONG';
    } else if (params.allowShort && bars[i].high > exitHigh) {
      type = 'EXIT_SHORT';
    }

    if (type !== 'NONE') {
      signals.push({
        barIndex: i,
        date: bars[i].date,
        type,
        price: bars[i].close,
        atr,
        breakoutHigh: highestHigh,
        breakoutLow: lowestLow,
      });
    }
  }

  return { atrValues, signals };
}
