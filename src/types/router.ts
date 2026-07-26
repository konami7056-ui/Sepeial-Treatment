import { SymbolInfo, OHLCV, DataQualityReport, Timeframe } from './stock';

export type ProviderStatus = 'healthy' | 'degraded' | 'rate_limited' | 'unavailable' | 'unauthorized';

export interface ProviderMetadata {
  id: string;
  name: string;
  supportedMarkets: string[];
  supportedExchanges: string[];
  supportedAssetTypes: string[];
  supportedTimeframes: Timeframe[];
  supportsHistoricalData: boolean;
  supportsRealtimeData: boolean;
  priority: number;
  enabled: boolean;
}

export interface ProviderAttempt {
  providerId: string;
  providerName: string;
  status: 'success' | 'failed' | 'rate_limited' | 'unavailable';
  responseTimeMs?: number;
  errorMessage?: string;
  timestamp: number;
}

export interface DataRequest {
  symbol: string;
  market?: string;
  exchange?: string;
  timeframe: Timeframe;
  startDate?: string;
  endDate?: string;
  adjusted?: boolean;
  preferredProvider?: string;
  autoRoute: boolean;
}

export interface RouterResult {
  symbolInfo: SymbolInfo;
  provider: ProviderMetadata;
  data: OHLCV[];
  dataQuality: DataQualityReport;
  fallbackUsed: boolean;
  providerAttempts: ProviderAttempt[];
}
