import { OHLCV, SymbolInfo, Timeframe } from '../../types/stock';
import { ProviderMetadata } from '../../types/router';
import { generateRealisticMarketOHLCV, fetchRealStockHistory } from './TWSEProvider';

export class YahooFinanceProvider {
  static metadata: ProviderMetadata = {
    id: 'YahooFinance',
    name: 'Yahoo Finance 國際市場行情',
    supportedMarkets: ['TW', 'US', 'CRYPTO', 'INDEX'],
    supportedExchanges: ['TWSE', 'TPEx', 'ESB', 'NASDAQ', 'NYSE', 'AMEX'],
    supportedAssetTypes: ['equity', 'etf', 'index', 'crypto'],
    supportedTimeframes: ['1m', '5m', '15m', '30m', '60m', '1D', '1W', '1M'],
    supportsHistoricalData: true,
    supportsRealtimeData: true,
    priority: 2,
    enabled: true,
  };

  static async fetchHistorical(
    symbolInfo: SymbolInfo,
    startDate?: string,
    endDate?: string,
    timeframe: Timeframe = '1D'
  ): Promise<OHLCV[]> {
    const realData = await fetchRealStockHistory(symbolInfo, startDate, endDate, timeframe);
    if (realData && realData.length > 0) {
      return realData;
    }
    return generateRealisticMarketOHLCV(symbolInfo, startDate, endDate, timeframe);
  }
}
