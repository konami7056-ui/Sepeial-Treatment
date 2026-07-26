export type SignalType = 'BUY' | 'SELL' | 'SHORT' | 'COVER' | 'NONE';

export interface StrategyRule {
  id: string;
  indicatorA: string; // e.g. "EMA17", "RSI17", "Close", "MACD_DIF"
  operator: '>' | '<' | '>=' | '<=' | '=' | 'CROSS_ABOVE' | 'CROSS_BELOW';
  indicatorB: string | number; // e.g. "EMA45", 50, "MACD_DEA", 0
}

export interface RuleGroup {
  logic: 'AND' | 'OR';
  rules: StrategyRule[];
}

export interface CustomStrategyConfig {
  name: string;
  buyRules: RuleGroup[];
  sellRules: RuleGroup[];
  shortRules?: RuleGroup[];
  coverRules?: RuleGroup[];
}

export interface TurtleStrategyParams {
  system: 1 | 2;         // System 1 = 20 breakout / 10 exit; System 2 = 55 breakout / 20 exit
  entryBreakoutDays: number; // 20 or 55
  exitDays: number;         // 10 or 20
  atrPeriod: number;        // 20
  riskPercent: number;      // 1.0 = 1%
  stopLossAtr: number;      // 2.0 = 2 ATR
  pyramidAtr: number;       // 0.5 = 0.5 ATR
  maxPyramidUnits: number;  // 4
  allowShort: boolean;
}
