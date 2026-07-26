import { Timeframe } from '../types/stock';

export function getBiasParamsForTimeframe(tf: Timeframe): { maPeriod: number; avg1Period: number; avg2Period: number } {
  switch (tf) {
    case '1M':
      return { maPeriod: 45, avg1Period: 17, avg2Period: 45 };
    case '1W':
      return { maPeriod: 45, avg1Period: 17, avg2Period: 45 };
    case '1D':
      return { maPeriod: 117, avg1Period: 17, avg2Period: 45 };
    case '90m':
      return { maPeriod: 45, avg1Period: 17, avg2Period: 45 };
    case '60m':
      return { maPeriod: 45, avg1Period: 17, avg2Period: 45 };
    case '45m':
      return { maPeriod: 45, avg1Period: 17, avg2Period: 45 };
    case '30m':
      return { maPeriod: 117, avg1Period: 17, avg2Period: 45 };
    case '20m':
      return { maPeriod: 189, avg1Period: 17, avg2Period: 45 };
    case '15m':
      return { maPeriod: 189, avg1Period: 17, avg2Period: 45 };
    case '10m':
      return { maPeriod: 305, avg1Period: 17, avg2Period: 45 };
    case '5m':
      return { maPeriod: 494, avg1Period: 17, avg2Period: 45 };
    case '1m':
      return { maPeriod: 799, avg1Period: 17, avg2Period: 45 };
    default:
      return { maPeriod: 117, avg1Period: 17, avg2Period: 45 };
  }
}

export function calculateBIAS(
  closes: number[],
  maPeriod: number,
  avg1Period: number,
  avg2Period: number
): { bias: (number | null)[]; biasAvg1: (number | null)[]; biasAvg2: (number | null)[] } {
  const len = closes.length;
  const bias: (number | null)[] = new Array(len).fill(null);
  const biasAvg1: (number | null)[] = new Array(len).fill(null);
  const biasAvg2: (number | null)[] = new Array(len).fill(null);

  if (len < maPeriod) return { bias, biasAvg1, biasAvg2 };

  const validBiasValues: number[] = [];

  for (let i = maPeriod - 1; i < len; i++) {
    let sum = 0;
    for (let j = i - maPeriod + 1; j <= i; j++) {
      sum += closes[j];
    }
    const ma = sum / maPeriod;
    const b = ma === 0 ? 0 : ((closes[i] - ma) / ma) * 100;
    bias[i] = b;
    validBiasValues.push(b);
  }

  // Calculate averages of BIAS
  for (let i = maPeriod - 1 + avg1Period - 1; i < len; i++) {
    let sum = 0;
    for (let j = i - avg1Period + 1; j <= i; j++) {
      if (bias[j] !== null) sum += bias[j]!;
    }
    biasAvg1[i] = sum / avg1Period;
  }

  for (let i = maPeriod - 1 + avg2Period - 1; i < len; i++) {
    let sum = 0;
    for (let j = i - avg2Period + 1; j <= i; j++) {
      if (bias[j] !== null) sum += bias[j]!;
    }
    biasAvg2[i] = sum / avg2Period;
  }

  return { bias, biasAvg1, biasAvg2 };
}
