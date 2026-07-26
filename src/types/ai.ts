import { BacktestResult, PerformanceMetrics } from './backtest';
import { SymbolInfo, DataQualityReport } from './stock';

export interface AIResearchReport {
  summary: string;
  keyStrengths: string[];
  keyRisks: string[];
  regimeAnalysis: {
    bullMarketPerformance: string;
    bearMarketPerformance: string;
    sidewayMarketPerformance: string;
    highVolatilityPerformance: string;
  };
  overfittingRiskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    explanation: string;
  };
  parameterStabilityNote: string;
  optimizationSuggestions: string[];
  disclaimer: string;
}

export interface AIResearchRequest {
  symbolInfo: SymbolInfo;
  backtestResult: BacktestResult;
  dataQuality: DataQualityReport;
  customPrompt?: string;
}
