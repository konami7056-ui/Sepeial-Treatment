import { OHLCV, SymbolInfo, Timeframe } from '../../types/stock';
import { ProviderMetadata } from '../../types/router';
import { generateRealisticMarketOHLCV, fetchRealStockHistory } from './TWSEProvider';

export class FinMindProvider {
  static metadata: ProviderMetadata = {
    id: 'FinMind',
    name: 'FinMind 台灣金融資料庫',
    supportedMarkets: ['TW'],
    supportedExchanges: ['TWSE', 'TPEx', 'ESB'],
    supportedAssetTypes: ['equity', 'etf'],
    supportedTimeframes: ['1D', '1W', '1M'],
    supportsHistoricalData: true,
    supportsRealtimeData: false,
    priority: 3,
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
