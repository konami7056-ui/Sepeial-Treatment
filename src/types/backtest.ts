import { OHLCV } from './stock';

export type PositionDirection = 'LONG' | 'SHORT';

export interface TradeOrder {
  id: string;
  symbol: string;
  direction: PositionDirection;
  action: 'BUY' | 'SELL' | 'SHORT' | 'COVER' | 'PYRAMID_BUY' | 'PYRAMID_SHORT';
  date: string;
  timestamp: number;
  price: number;
  shares: number;
  atrAtTrade: number;
  reason: string;
  cost: number;        // Total commission + slippage + tax
}

export interface TradePosition {
  id: string;
  symbol: string;
  direction: PositionDirection;
  entryDate: string;
  entryPrice: number;
  exitDate?: string;
  exitPrice?: number;
  shares: number;
  units: number;       // Number of pyramid units
  stopLossPrice: number;
  pnl?: number;
  pnlPercent?: number;
  holdingDays?: number;
  rReturn?: number;    // PnL in terms of initial Risk R
  entryOrders: TradeOrder[];
  exitOrder?: TradeOrder;
  status: 'OPEN' | 'CLOSED';
}

export interface EquityPoint {
  date: string;
  timestamp: number;
  equity: number;
  cash: number;
  drawdown: number;
  drawdownPercent: number;
  benchmarkEquity?: number;
}

export interface BacktestConfig {
  initialCapital: number;    // e.g. 1,000,000
  commissionRate: number;    // TW standard: 0.001425 (0.1425%)
  commissionDiscount: number;// Discount on commission, e.g. 0.6 (6折)
  taxRate: number;           // TW stock tax: 0.003 (0.3% on sell)
  slippageTicks: number;     // e.g. 1 tick slippage
  minCommission: number;     // e.g. 20 NTD
  executionTiming: 'NEXT_OPEN' | 'CURRENT_CLOSE'; // Default NEXT_OPEN to avoid look-ahead bias
}

export interface PerformanceMetrics {
  totalReturn: number;        // Percentage, e.g. 85.4%
  cagr: number;               // Compound Annual Growth Rate %
  annualReturn: number;
  maxDrawdown: number;        // Percentage, e.g. -18.2%
  maxDrawdownDurationDays: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  winRate: number;            // Percentage, e.g. 48.5%
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  winLossRatio: number;       // Avg Win / Avg Loss
  profitFactor: number;       // Gross Profit / Gross Loss
  expectancy: number;         // Expected return per trade ($)
  averageR: number;           // Average R multiple
  averageHoldingDays: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  netProfit: number;
  totalFeesPaid: number;
}

export interface BacktestResult {
  symbol: string;
  config: BacktestConfig;
  metrics: PerformanceMetrics;
  trades: TradePosition[];
  equityCurve: EquityPoint[];
  ohlcv: OHLCV[];
}
