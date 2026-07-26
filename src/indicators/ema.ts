export function calculateEMA(prices: number[], period: number): (number | null)[] {
  if (prices.length < period) {
    return new Array(prices.length).fill(null);
  }

  const result: (number | null)[] = new Array(prices.length).fill(null);
  const k = 2 / (period + 1);

  // Initial SMA for first period
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEMA = sum / period;
  result[period - 1] = prevEMA;

  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - prevEMA) * k + prevEMA;
    result[i] = currentEMA;
    prevEMA = currentEMA;
  }

  return result;
}
