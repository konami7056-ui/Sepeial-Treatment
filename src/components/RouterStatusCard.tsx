import React from 'react';
import { RouterResult } from '../types/router';
import { CheckCircle2, AlertTriangle, ShieldCheck, Database, Layers } from 'lucide-react';

interface RouterStatusCardProps {
  routerResult: RouterResult | null;
}

export const RouterStatusCard: React.FC<RouterStatusCardProps> = ({ routerResult }) => {
  if (!routerResult) return null;

  const { symbolInfo, provider, dataQuality, fallbackUsed, providerAttempts } = routerResult;

  const scoreColor =
    dataQuality.score >= 85
      ? 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30'
      : dataQuality.score >= 70
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-[#F84960] bg-[#F84960]/10 border-[#F84960]/30';

  return (
    <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#2B2F36] pb-3 mb-3">
        {/* Symbol Info */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#38bdf8]/10 p-2 rounded border border-[#38bdf8]/30 text-[#38bdf8] font-mono text-base font-bold">
            {symbolInfo.symbol}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#EAECEF]">{symbolInfo.name}</h2>
              <span className="text-xs bg-[#0B0E11] text-[#EAECEF] px-2 py-0.5 rounded font-mono font-medium border border-[#2B2F36]">
                {symbolInfo.exchangeNameZh} ({symbolInfo.exchange})
              </span>
              <span className="text-xs bg-[#0B0E11] text-[#38bdf8] px-1.5 py-0.5 rounded font-mono font-semibold border border-[#2B2F36]">
                {symbolInfo.currency}
              </span>
            </div>
            <p className="text-xs text-[#848E9C] mt-0.5 flex items-center gap-1.5 font-mono">
              <span>Canonical: <code className="text-[#EAECEF]">{symbolInfo.canonicalSymbol}</code></span>
              <span>•</span>
              <span>類別: {symbolInfo.assetType.toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Quality Score & Provider Status */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] text-[#848E9C] font-mono uppercase">資料品質評分 (Quality)</div>
            <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-bold font-mono border mt-0.5 ${scoreColor}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{dataQuality.score} / 100</span>
            </div>
          </div>

          <div className="text-right border-l border-[#2B2F36] pl-4">
            <div className="text-[10px] text-[#848E9C] font-mono uppercase flex items-center justify-end gap-1">
              <Database className="w-3 h-3 text-[#38bdf8]" />
              <span>Data Provider</span>
            </div>
            <div className="text-xs font-semibold text-[#EAECEF] mt-0.5 flex items-center justify-end gap-1 font-mono">
              <span>{provider.name}</span>
              {fallbackUsed ? (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">
                  備援 (Fallback)
                </span>
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#0B0E11] p-2.5 rounded border border-[#2B2F36]">
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">歷史 K 線總筆數</span>
          <span className="text-[#EAECEF] font-bold font-mono text-sm">{dataQuality.totalBars.toLocaleString()} 根</span>
        </div>
        <div className="bg-[#0B0E11] p-2.5 rounded border border-[#2B2F36]">
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">資料時間區間 Range</span>
          <span className="text-[#EAECEF] font-mono text-xs">{dataQuality.startDate} ~ {dataQuality.endDate}</span>
        </div>
        <div className="bg-[#0B0E11] p-2.5 rounded border border-[#2B2F36]">
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">回測數據可信度</span>
          <span className={`font-semibold font-mono text-xs ${dataQuality.isReliableForBacktest ? 'text-[#38bdf8]' : 'text-amber-400'}`}>
            {dataQuality.isReliableForBacktest ? '適合正式回測 ✓' : '建議補充資料 ⚠'}
          </span>
        </div>
        <div className="bg-[#0B0E11] p-2.5 rounded border border-[#2B2F36]">
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">Router 路由歷程</span>
          <span className="text-[#EAECEF] flex items-center gap-1 font-mono text-xs">
            <Layers className="w-3 h-3 text-[#38bdf8]" />
            <span>{providerAttempts.length} 次嘗試 ({providerAttempts[providerAttempts.length - 1]?.responseTimeMs}ms)</span>
          </span>
        </div>
      </div>

      {/* Quality Warnings if any */}
      {dataQuality.warnings && dataQuality.warnings.length > 0 && (
        <div className="mt-2.5 bg-amber-500/10 border border-amber-500/20 rounded p-2.5 flex items-start space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-semibold block font-mono">資料品質提示:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/80">
              {dataQuality.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
