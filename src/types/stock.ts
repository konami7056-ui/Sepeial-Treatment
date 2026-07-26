export type MarketType = 'TW' | 'US' | 'CRYPTO' | 'INDEX' | 'UNKNOWN';
export type ExchangeType = 'TWSE' | 'TPEx' | 'ESB' | 'NASDAQ' | 'NYSE' | 'AMEX' | 'CRYPTO' | 'UNKNOWN';
export type AssetType = 'equity' | 'etf' | 'fund' | 'index' | 'crypto';
export type SymbolStatus = 'active' | 'delisted' | 'suspended' | 'unknown';

export interface SymbolInfo {
  symbol: string;         // e.g. "2330" or "AAPL"
  canonicalSymbol: string;// e.g. "2330.TW" or "AAPL"
  name: string;           // e.g. "台積電" or "Apple Inc."
  market: MarketType;
  exchange: ExchangeType;
  exchangeNameZh: string; // e.g. "台灣上市", "台灣上櫃", "興櫃", "美股"
  currency: string;       // e.g. "TWD", "USD"
  assetType: AssetType;
  status: SymbolStatus;
  sector?: string;
}

export interface OHLCV {
  timestamp: number;     // Epoch timestamp in milliseconds or seconds
  date: string;          // Format YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface DataQualityReport {
  score: number;             // 0 - 100
  totalBars: number;
  startDate: string;
  endDate: string;
  missingValuesCount: number;
  duplicateDatesCount: number;
  invalidHighLowCount: number;
  invalidOpenCloseCount: number;
  dataGapsCount: number;
  warnings: string[];
  isReliableForBacktest: boolean;
}

export type Timeframe = '1m' | '5m' | '10m' | '15m' | '20m' | '30m' | '45m' | '60m' | '90m' | '1D' | '1W' | '1M';
