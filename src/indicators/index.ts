import { OHLCV, Timeframe } from '../types/stock';
import { IndicatorConfig, IndicatorValues } from '../types/indicator';
import { calculateEMA } from './ema';
import { calculateRSI } from './rsi';
import { calculateKD } from './kd';
import { calculateBIAS, getBiasParamsForTimeframe } from './bias';
import { calculateMACD } from './macd';
import { calculateATR } from './atr';

export { getBiasParamsForTimeframe };

export const DEFAULT_INDICATOR_CONFIG: IndicatorConfig = {
  emaPeriods: [17, 45, 117, 189, 305, 494, 799, 1292],
  rsiPeriod1: 17,
  rsiPeriod2: 44,
  kdRsvPeriod: 17,
  kdKPeriod: 3,
  kdDPeriod: 3,
  biasMaPeriod: 117,
  biasAvg1Period: 17,
  biasAvg2Period: 45,
  macdFast: 17,
  macdSlow: 45,
  macdSignal: 17,
  atrPeriod: 20,
  adxPeriod: 14,
};

export function calculateAllIndicators(
  bars: OHLCV[],
  config: IndicatorConfig = DEFAULT_INDICATOR_CONFIG,
  timeframe?: Timeframe
): IndicatorValues[] {
  if (!bars || bars.length === 0) return [];

  // Override BIAS config if timeframe is provided
  let activeConfig = config;
  if (timeframe) {
    const biasParams = getBiasParamsForTimeframe(timeframe);
    activeConfig = {
      ...config,
      biasMaPeriod: biasParams.maPeriod,
      biasAvg1Period: biasParams.avg1Period,
      biasAvg2Period: biasParams.avg2Period,
    };
  }

  const closes = bars.map(b => b.close);
  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);

  // EMA calculations
  const emasMap: Record<number, (number | null)[]> = {};
  activeConfig.emaPeriods.forEach(p => {
    emasMap[p] = calculateEMA(closes, p);
  });

  // RSI calculations
  const rsi1 = calculateRSI(closes, activeConfig.rsiPeriod1);
  const rsi2 = calculateRSI(closes, activeConfig.rsiPeriod2);

  // KD calculations
  const { K: kdK, D: kdD } = calculateKD(
    highs,
    lows,
    closes,
    activeConfig.kdRsvPeriod,
    activeConfig.kdKPeriod,
    activeConfig.kdDPeriod
  );

  // BIAS calculations
  const { bias, biasAvg1, biasAvg2 } = calculateBIAS(
    closes,
    activeConfig.biasMaPeriod,
    activeConfig.biasAvg1Period,
    activeConfig.biasAvg2Period
  );

  // MACD calculations
  const { dif: macdDif, dea: macdDea, histogram: macdHist } = calculateMACD(
    closes,
    activeConfig.macdFast,
    activeConfig.macdSlow,
    activeConfig.macdSignal
  );

  // ATR calculations
  const atr = calculateATR(highs, lows, closes, activeConfig.atrPeriod);

  // Combine results
  return bars.map((bar, i) => {
    const emas: Record<number, number | null> = {};
    activeConfig.emaPeriods.forEach(p => {
      emas[p] = emasMap[p][i];
    });

    return {
      timestamp: bar.timestamp,
      date: bar.date,
      close: bar.close,
      emas,
      rsi1: rsi1[i],
      rsi2: rsi2[i],
      kdK: kdK[i],
      kdD: kdD[i],
      bias: bias[i],
      biasAvg1: biasAvg1[i],
      biasAvg2: biasAvg2[i],
      macdDif: macdDif[i],
      macdDea: macdDea[i],
      macdHist: macdHist[i],
      atr: atr[i],
      adx: null,
    };
  });
}
