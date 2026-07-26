import { calculateEMA } from './ema';

export function calculateMACD(
  closes: number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number
): { dif: (number | null)[]; dea: (number | null)[]; histogram: (number | null)[] } {
  const len = closes.length;
  const dif: (number | null)[] = new Array(len).fill(null);
  const dea: (number | null)[] = new Array(len).fill(null);
  const histogram: (number | null)[] = new Array(len).fill(null);

  if (len < slowPeriod) return { dif, dea, histogram };

  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  const difValues: number[] = [];
  const difIndices: number[] = [];

  for (let i = slowPeriod - 1; i < len; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      const val = emaFast[i]! - emaSlow[i]!;
      dif[i] = val;
      difValues.push(val);
      difIndices.push(i);
    }
  }

  if (difValues.length >= signalPeriod) {
    const deaFromDif = calculateEMA(difValues, signalPeriod);
    for (let k = 0; k < deaFromDif.length; k++) {
      const barIndex = difIndices[k];
      dea[barIndex] = deaFromDif[k];
      if (dif[barIndex] !== null && dea[barIndex] !== null) {
        histogram[barIndex] = (dif[barIndex]! - dea[barIndex]!) * 2;
      }
    }
  }

  return { dif, dea, histogram };
}
