import React, { useState } from 'react';
import { SymbolInfo, DataQualityReport } from '../types/stock';
import { BacktestResult } from '../types/backtest';
import { AIResearchReport } from '../types/ai';
import { QuantResearchAssistant } from '../ai/quantResearchAssistant';
import { Sparkles, RefreshCw, CheckCircle2, ShieldAlert, Cpu, Lightbulb, FileText } from 'lucide-react';

interface AIResearchPanelProps {
  symbolInfo: SymbolInfo | null;
  backtestResult: BacktestResult | null;
  dataQuality: DataQualityReport | null;
}

export const AIResearchPanel: React.FC<AIResearchPanelProps> = ({
  symbolInfo,
  backtestResult,
  dataQuality,
}) => {
  const [report, setReport] = useState<AIResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerateReport = async () => {
    if (!symbolInfo || !backtestResult || !dataQuality) return;

    setIsLoading(true);
    try {
      const generated = await QuantResearchAssistant.requestAnalysis({
        symbolInfo,
        backtestResult,
        dataQuality,
        customPrompt,
      });
      setReport(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!symbolInfo || !backtestResult) {
    return (
      <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-8 text-center text-[#848E9C]">
        <Sparkles className="w-10 h-10 text-[#38bdf8] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#EAECEF]">請先完成海龜策略回測以利 AI Quant 助手進行深度研究</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#2B2F36] pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#38bdf8]/10 text-[#38bdf8] rounded border border-[#38bdf8]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#EAECEF] flex items-center gap-2">
              AI Quant Research Assistant
              <span className="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] px-2 py-0.5 rounded font-mono">
                Gemini 3.6 Flash Server Engine
              </span>
            </h3>
            <p className="text-xs text-[#848E9C]">客觀分析回測績效、市場環境 (Regimes)、過度擬合 (Overfitting) 與策略最佳化</p>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold px-5 py-2.5 rounded text-xs transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50 shrink-0 font-mono"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-black" />}
          <span>{isLoading ? 'AI 分析生成中...' : 'GENERATE AI RESEARCH REPORT'}</span>
        </button>
      </div>

      {/* Custom Query Box */}
      <div className="bg-[#0B0E11] p-3.5 rounded border border-[#2B2F36] space-y-2 text-xs">
        <label className="block text-[#EAECEF] font-semibold font-mono uppercase">自訂 AI 研究提問 (Custom Research Prompt):</label>
        <input
          type="text"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="例如：這套策略在 2022 年大盤重挫期間表現如何？是否存在連續試錯風險？"
          className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-2 text-[#EAECEF] placeholder-[#848E9C] focus:outline-none focus:border-[#38bdf8] font-mono"
        />
      </div>

      {/* AI Report Output */}
      {report && (
        <div className="space-y-4 animate-fade-in">
          {/* Executive Summary */}
          <div className="bg-[#0B0E11] border border-[#2B2F36] rounded p-4 space-y-2">
            <div className="flex items-center space-x-2 text-[#38bdf8] font-bold text-xs font-mono uppercase">
              <FileText className="w-4 h-4" />
              <span>量化摘要 (Executive Summary)</span>
            </div>
            <p className="text-xs text-[#EAECEF] leading-relaxed font-normal">{report.summary}</p>
          </div>

          {/* Key Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0E11] p-4 rounded border border-[#38bdf8]/30 space-y-2">
              <div className="flex items-center space-x-2 text-[#38bdf8] font-bold font-mono uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>策略核心強項 (Core Strengths)</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-[#EAECEF] text-[11px]">
                {report.keyStrengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0B0E11] p-4 rounded border border-[#F84960]/30 space-y-2">
              <div className="flex items-center space-x-2 text-[#F84960] font-bold font-mono uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>潛在風險與弱點 (Risks & Weaknesses)</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-[#EAECEF] text-[11px]">
                {report.keyRisks?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Market Regimes Analysis */}
          <div className="bg-[#0B0E11] p-4 rounded border border-[#2B2F36] space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-[#38bdf8] font-bold border-b border-[#2B2F36] pb-2 font-mono uppercase">
              <Cpu className="w-4 h-4" />
              <span>市場環境分類表現分析 (Market Regime Performance)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-[#161A1E] p-2.5 rounded border border-[#2B2F36]">
                <span className="font-bold text-[#F84960] block mb-0.5 font-mono">多頭市場 (Bull Market):</span>
                <p className="text-[#EAECEF]">{report.regimeAnalysis?.bullMarketPerformance}</p>
              </div>
              <div className="bg-[#161A1E] p-2.5 rounded border border-[#2B2F36]">
                <span className="font-bold text-[#02C076] block mb-0.5 font-mono">空頭市場 (Bear Market):</span>
                <p className="text-[#EAECEF]">{report.regimeAnalysis?.bearMarketPerformance}</p>
              </div>
              <div className="bg-[#161A1E] p-2.5 rounded border border-[#2B2F36]">
                <span className="font-bold text-amber-400 block mb-0.5 font-mono">盤整市場 (Sideways Market):</span>
                <p className="text-[#EAECEF]">{report.regimeAnalysis?.sidewayMarketPerformance}</p>
              </div>
              <div className="bg-[#161A1E] p-2.5 rounded border border-[#2B2F36]">
                <span className="font-bold text-purple-400 block mb-0.5 font-mono">高波動市場 (High Volatility):</span>
                <p className="text-[#EAECEF]">{report.regimeAnalysis?.highVolatilityPerformance}</p>
              </div>
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-[#0B0E11] p-4 rounded border border-[#2B2F36] space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-[#38bdf8] font-bold font-mono uppercase">
              <Lightbulb className="w-4 h-4" />
              <span>AI 量化策略優化建議 (Optimization Recommendations)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#EAECEF] text-[11px]">
              {report.optimizationSuggestions?.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] text-[#848E9C] italic border-t border-[#2B2F36] pt-3 font-mono">
            {report.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
