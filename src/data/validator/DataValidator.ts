import { OHLCV, DataQualityReport } from '../../types/stock';

export class DataValidator {
  static validate(bars: OHLCV[]): { cleanBars: OHLCV[]; report: DataQualityReport } {
    if (!bars || bars.length === 0) {
      return {
        cleanBars: [],
        report: {
          score: 0,
          totalBars: 0,
          startDate: '',
          endDate: '',
          missingValuesCount: 0,
          duplicateDatesCount: 0,
          invalidHighLowCount: 0,
          invalidOpenCloseCount: 0,
          dataGapsCount: 0,
          warnings: ['無任何 K 線資料'],
          isReliableForBacktest: false,
        },
      };
    }

    let missingValuesCount = 0;
    let duplicateDatesCount = 0;
    let invalidHighLowCount = 0;
    let invalidOpenCloseCount = 0;
    let dataGapsCount = 0;
    const warnings: string[] = [];

    const dateMap = new Set<string>();
    const validBars: OHLCV[] = [];

    // Sort by timestamp / date ascending
    const sorted = [...bars].sort((a, b) => {
      const ta = a.timestamp || new Date(a.date).getTime();
      const tb = b.timestamp || new Date(b.date).getTime();
      return ta - tb;
    });

    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];

      // Missing values check
      if (
        b.open == null ||
        b.high == null ||
        b.low == null ||
        b.close == null ||
        isNaN(b.open) ||
        isNaN(b.high) ||
        isNaN(b.low) ||
        isNaN(b.close)
      ) {
        missingValuesCount++;
        continue;
      }

      // Duplicate date check
      if (dateMap.has(b.date)) {
        duplicateDatesCount++;
        continue; // Skip duplicates
      }
      dateMap.add(b.date);

      // High / Low validity
      if (b.high < b.low) {
        invalidHighLowCount++;
        // Fix inverted High / Low
        const fixedHigh = Math.max(b.high, b.low);
        const fixedLow = Math.min(b.high, b.low);
        b.high = fixedHigh;
        b.low = fixedLow;
      }

      // Open / Close range boundary check
      if (b.open > b.high || b.open < b.low || b.close > b.high || b.close < b.low) {
        invalidOpenCloseCount++;
        b.high = Math.max(b.high, b.open, b.close);
        b.low = Math.min(b.low, b.open, b.close);
      }

      validBars.push(b);
    }

    // Check data gap threshold (e.g. gap > 7 calendar days in daily series)
    for (let i = 1; i < validBars.length; i++) {
      const prev = new Date(validBars[i - 1].date).getTime();
      const curr = new Date(validBars[i].date).getTime();
      const diffDays = (curr - prev) / (1000 * 3600 * 24);
      if (diffDays > 10) {
        dataGapsCount++;
      }
    }

    if (duplicateDatesCount > 0) warnings.push(`已過濾 ${duplicateDatesCount} 筆重複日期的 K 線`);
    if (invalidHighLowCount > 0) warnings.push(`修正 ${invalidHighLowCount} 筆最高價小於最低價之異常資料`);
    if (invalidOpenCloseCount > 0) warnings.push(`修正 ${invalidOpenCloseCount} 筆開高低收邊界異常資料`);
    if (dataGapsCount > 0) warnings.push(`檢測到 ${dataGapsCount} 處潛在長日期跳空 gap`);

    // Calculate quality score (out of 100)
    let score = 100;
    score -= missingValuesCount * 2;
    score -= duplicateDatesCount * 1;
    score -= invalidHighLowCount * 3;
    score -= invalidOpenCloseCount * 2;
    score -= Math.min(20, dataGapsCount * 2);
    score = Math.max(0, Math.min(100, Math.round(score)));

    const isReliableForBacktest = score >= 70 && validBars.length >= 30;

    return {
      cleanBars: validBars,
      report: {
        score,
        totalBars: validBars.length,
        startDate: validBars.length > 0 ? validBars[0].date : '',
        endDate: validBars.length > 0 ? validBars[validBars.length - 1].date : '',
        missingValuesCount,
        duplicateDatesCount,
        invalidHighLowCount,
        invalidOpenCloseCount,
        dataGapsCount,
        warnings,
        isReliableForBacktest,
      },
    };
  }
}
