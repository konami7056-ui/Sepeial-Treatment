export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number
): (number | null)[] {
  const len = closes.length;
  const atr: (number | null)[] = new Array(len).fill(null);

  if (len < period + 1) return atr;

  const tr: number[] = [highs[0] - lows[0]];

  for (let i = 1; i < len; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    tr.push(Math.max(tr1, tr2, tr3));
  }

  // Initial ATR = SMA of TR for initial period
  let trSum = 0;
  for (let i = 0; i < period; i++) {
    trSum += tr[i];
  }
  let prevATR = trSum / period;
  atr[period - 1] = prevATR;

  // Wilder's smoothing
  for (let i = period; i < len; i++) {
    const currentATR = (prevATR * (period - 1) + tr[i]) / period;
    atr[i] = currentATR;
    prevATR = currentATR;
  }

  return atr;
}
