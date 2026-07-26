import { OHLCV, SymbolInfo, Timeframe } from '../../types/stock';
import { ProviderMetadata } from '../../types/router';

export class CustomProvider {
  static metadata: ProviderMetadata = {
    id: 'Custom',
    name: '自訂上傳檔案 (TXT / CSV / XLSX)',
    supportedMarkets: ['TW', 'US', 'CRYPTO', 'INDEX', 'UNKNOWN'],
    supportedExchanges: ['TWSE', 'TPEx', 'ESB', 'NASDAQ', 'NYSE', 'AMEX', 'UNKNOWN'],
    supportedAssetTypes: ['equity', 'etf', 'index', 'crypto'],
    supportedTimeframes: ['1m', '5m', '10m', '15m', '20m', '30m', '45m', '60m', '90m', '1D', '1W', '1M'],
    supportsHistoricalData: true,
    supportsRealtimeData: false,
    priority: 0,
    enabled: true,
  };

  private static uploadedDataMap = new Map<string, { symbolInfo: SymbolInfo; data: OHLCV[] }>();

  static setCustomData(symbolInfo: SymbolInfo, data: OHLCV[]) {
    this.uploadedDataMap.set(symbolInfo.symbol.toUpperCase(), { symbolInfo, data });
    this.uploadedDataMap.set(symbolInfo.canonicalSymbol.toUpperCase(), { symbolInfo, data });
  }

  static getCustomData(symbol: string): { symbolInfo: SymbolInfo; data: OHLCV[] } | null {
    return this.uploadedDataMap.get(symbol.toUpperCase()) || null;
  }
}
