export function calculateKD(
  highs: number[],
  lows: number[],
  closes: number[],
  rsvPeriod: number,
  kPeriod: number,
  dPeriod: number
): { K: (number | null)[]; D: (number | null)[] } {
  const len = closes.length;
  const K: (number | null)[] = new Array(len).fill(null);
  const D: (number | null)[] = new Array(len).fill(null);

  if (len < rsvPeriod) return { K, D };

  let prevK = 50;
  let prevD = 50;

  for (let i = rsvPeriod - 1; i < len; i++) {
    let periodHigh = highs[i];
    let periodLow = lows[i];

    for (let j = i - rsvPeriod + 1; j <= i; j++) {
      if (highs[j] > periodHigh) periodHigh = highs[j];
      if (lows[j] < periodLow) periodLow = lows[j];
    }

    const range = periodHigh - periodLow;
    const rsv = range === 0 ? 50 : ((closes[i] - periodLow) / range) * 100;

    const currentK = (prevK * (kPeriod - 1) + rsv) / kPeriod;
    const currentD = (prevD * (dPeriod - 1) + currentK) / dPeriod;

    K[i] = currentK;
    D[i] = currentD;

    prevK = currentK;
    prevD = currentD;
  }

  return { K, D };
}
