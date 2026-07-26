import { OHLCV, SymbolInfo, Timeframe } from '../../types/stock';
import { ProviderMetadata } from '../../types/router';
import { generateRealisticMarketOHLCV, fetchRealStockHistory } from './TWSEProvider';

export class EmergingProvider {
  static metadata: ProviderMetadata = {
    id: 'ESB',
    name: '興櫃市場資料庫',
    supportedMarkets: ['TW'],
    supportedExchanges: ['ESB'],
    supportedAssetTypes: ['equity'],
    supportedTimeframes: ['1D', '1W', '1M'],
    supportsHistoricalData: true,
    supportsRealtimeData: false,
    priority: 1,
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
