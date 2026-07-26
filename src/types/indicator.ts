export interface IndicatorConfig {
  // EMA Periods
  emaPeriods: number[]; // e.g. [17, 45, 117, 189, 305, 494, 799, 1292]
  // RSI
  rsiPeriod1: number;   // e.g. 17
  rsiPeriod2: number;   // e.g. 44
  // KD
  kdRsvPeriod: number;  // e.g. 17 for D/W/M, 7 for min
  kdKPeriod: number;    // e.g. 3
  kdDPeriod: number;    // e.g. 3
  // BIAS
  biasMaPeriod: number; // e.g. 20
  biasAvg1Period: number; // e.g. 6
  biasAvg2Period: number; // e.g. 12
  // MACD
  macdFast: number;     // e.g. 17
  macdSlow: number;     // e.g. 45
  macdSignal: number;   // e.g. 17
  // ATR
  atrPeriod: number;    // e.g. 20
  // ADX
  adxPeriod: number;    // e.g. 14
}

export interface IndicatorValues {
  timestamp: number;
  date: string;
  close: number;
  emas: Record<number, number | null>;
  rsi1: number | null;
  rsi2: number | null;
  kdK: number | null;
  kdD: number | null;
  bias: number | null;
  biasAvg1: number | null;
  biasAvg2: number | null;
  macdDif: number | null;
  macdDea: number | null;
  macdHist: number | null;
  atr: number | null;
  adx: number | null;
}
