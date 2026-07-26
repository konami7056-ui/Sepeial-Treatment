import { OHLCV, Timeframe } from '../../types/stock';

export class DataResampler {
  static resample(bars: OHLCV[], targetTimeframe: Timeframe): OHLCV[] {
    if (!bars || bars.length === 0 || targetTimeframe === '1D') {
      return bars;
    }

    if (targetTimeframe === '1W') {
      return this.resampleToWeekly(bars);
    }

    if (targetTimeframe === '1M') {
      return this.resampleToMonthly(bars);
    }

    // Minutely resampling
    return bars;
  }

  private static resampleToWeekly(bars: OHLCV[]): OHLCV[] {
    const weeklyMap = new Map<string, OHLCV[]>();

    bars.forEach(b => {
      const d = new Date(b.date);
      // Group by Year and ISO Week
      const year = d.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const key = `${year}-W${weekNum}`;

      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, []);
      }
      weeklyMap.get(key)!.push(b);
    });

    const resampled: OHLCV[] = [];
    weeklyMap.forEach(group => {
      if (group.length === 0) return;
      const open = group[0].open;
      const close = group[group.length - 1].close;
      const high = Math.max(...group.map(g => g.high));
      const low = Math.min(...group.map(g => g.low));
      const volume = group.reduce((acc, g) => acc + g.volume, 0);
      const date = group[group.length - 1].date;

      resampled.push({
        timestamp: group[group.length - 1].timestamp,
        date,
        open,
        high,
        low,
        close,
        volume
      });
    });

    return resampled;
  }

  private static resampleToMonthly(bars: OHLCV[]): OHLCV[] {
    const monthlyMap = new Map<string, OHLCV[]>();

    bars.forEach(b => {
      const key = b.date.slice(0, 7); // YYYY-MM
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, []);
      }
      monthlyMap.get(key)!.push(b);
    });

    const resampled: OHLCV[] = [];
    monthlyMap.forEach(group => {
      if (group.length === 0) return;
      const open = group[0].open;
      const close = group[group.length - 1].close;
      const high = Math.max(...group.map(g => g.high));
      const low = Math.min(...group.map(g => g.low));
      const volume = group.reduce((acc, g) => acc + g.volume, 0);
      const date = group[group.length - 1].date;

      resampled.push({
        timestamp: group[group.length - 1].timestamp,
        date,
        open,
        high,
        low,
        close,
        volume
      });
    });

    return resampled;
  }
}
