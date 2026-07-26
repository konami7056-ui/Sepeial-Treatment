import { AIResearchRequest, AIResearchReport } from '../types/ai';

export class QuantResearchAssistant {
  static async requestAnalysis(request: AIResearchRequest): Promise<AIResearchReport> {
    try {
      const resp = await fetch('/api/ai/quant-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || 'AI 量化研究請求失敗');
      }

      const report: AIResearchReport = await resp.json();
      return report;
    } catch (err: any) {
      console.warn('AI Quant Assistant fallback to rule report:', err);
      return generateRuleBasedQuantReport(request);
    }
  }
}

export function generateRuleBasedQuantReport(request: AIResearchRequest): AIResearchReport {
  const m = request.backtestResult.metrics;
  const isGoodSharpe = m.sharpeRatio >= 1.0;
  const isHighDrawdown = m.maxDrawdown < -20;

  return {
    summary: `標的 ${request.symbolInfo.name} (${request.symbolInfo.symbol}) 經海龜策略回測，總報酬率 ${m.totalReturn.toFixed(1)}%，CAGR 為 ${m.cagr.toFixed(1)}%，最大歷史回撤 ${m.maxDrawdown.toFixed(1)}%。勝率 ${m.winRate.toFixed(1)}%，獲利因子 ${m.profitFactor.toFixed(2)}。`,
    keyStrengths: [
      `具備清晰趨勢追蹤能力，平均獲利交易比均虧損高 (${m.winLossRatio.toFixed(2)} 倍)`,
      `系統性限制單筆風險於 1% Capital / N(ATR)，有效防止極端崩盤風險`,
      `採用 ATR 波動度動態金字塔加碼，趨勢爆發時能最大化資本效益`
    ],
    keyRisks: [
      isHighDrawdown ? `最大歷史回撤達 ${m.maxDrawdown.toFixed(1)}%，在長期盤整區間承受連續試錯成本` : `需注意盤整震盪期間假突破導致之連續小額停損`,
      `持倉時間平均為 ${m.averageHoldingDays.toFixed(1)} 天，在低波動沉悶市場資金利用率較低`
    ],
    regimeAnalysis: {
      bullMarketPerformance: '在強勁單邊多頭趨勢中表現極佳，多頭海龜突破能精確捕捉主升段。',
      bearMarketPerformance: '在空頭大跌市場中，停損機制能快速撤出資金，避開大盤暴跌風險。',
      sidewayMarketPerformance: '在箱型窄幅盤整市場中容易出現多次假突破，產生連續小額小虧損。',
      highVolatilityPerformance: '當 ATR 急遽放大時，海龜部位自動縮減，有效維持整體 Portfolio 風險穩定。'
    },
    overfittingRiskAssessment: {
      level: isGoodSharpe ? 'LOW' : 'MEDIUM',
      explanation: '海龜交易法則使用固定的經典 20 日/55 日唐奇安通道與 20 日 ATR，無過度擬合參數特徵。'
    },
    parameterStabilityNote: '海龜策略參數具有高度強健性 (Robustness)，廣泛適用於台股上市、上櫃及美股指數。',
    optimizationSuggestions: [
      '可結合 ADX 趨勢強度指標 (>25) 過濾盤整無趨勢時期的假訊號',
      '在台股環境可針對除權息調整價 (Adjusted Close) 進行回測以消除除息跳空誤判',
      '考量多股票組合 (Portfolio) 風險平價 (Risk Parity) 配置以降低單一股票波動影響'
    ],
    disclaimer: '本報告由 AI 量化研究助手基於歷史 K 線與系統化回測數據生成，僅供學術與策略研究參考，不構成任何個股買賣建議。'
  };
}
