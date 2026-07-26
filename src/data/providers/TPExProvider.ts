import { OHLCV, SymbolInfo, Timeframe } from '../../types/stock';
import { ProviderMetadata } from '../../types/router';
import { generateRealisticMarketOHLCV, fetchRealStockHistory } from './TWSEProvider';

export class TPExProvider {
  static metadata: ProviderMetadata = {
    id: 'TPEx',
    name: 'TPEx 證券櫃檯買賣中心',
    supportedMarkets: ['TW'],
    supportedExchanges: ['TPEx'],
    supportedAssetTypes: ['equity', 'etf'],
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
