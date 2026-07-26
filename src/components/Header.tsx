import React from 'react';
import { LineChart, Play, Cpu, ShieldCheck, PieChart, Activity, Sparkles, Upload, Layers, BarChart2, FileText } from 'lucide-react';

export type ActiveTabType =
  | 'CHART'
  | 'TURTLE'
  | 'ANALYTICS'
  | 'OPTIMIZATION'
  | 'TRADE_LOG'
  | 'AI_RESEARCH';

interface HeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenUpload }) => {
  const tabs: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'CHART', label: 'K線與指標圖表', icon: <LineChart className="w-4 h-4" /> },
    { id: 'TURTLE', label: '海龜交易策略', icon: <Play className="w-4 h-4" />, badge: 'Core' },
    { id: 'ANALYTICS', label: '歷史回測績效', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'OPTIMIZATION', label: '參數最佳化', icon: <Cpu className="w-4 h-4" /> },
    { id: 'TRADE_LOG', label: '實盤交易紀錄與庫存', icon: <FileText className="w-4 h-4" />, badge: 'New' },
    { id: 'AI_RESEARCH', label: 'AI 量化研究助手', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: 'AI' },
  ];

  return (
    <header className="bg-[#161A1E] border-b border-[#2B2F36] sticky top-0 z-40 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#38bdf8] rounded flex items-center justify-center text-black font-extrabold text-xl italic shadow-sm shrink-0">
            T
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-[#EAECEF] flex items-center gap-2">
              專業股票技術分析與海龜回測平台
              <span className="text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded border border-[#38bdf8]/20 font-mono font-medium">
                PRO QUANT v2.5
              </span>
            </h1>
            <p className="text-xs text-[#848E9C]">
              Market Data Router • 8x EMA • Turtle Strategy • Trade Log • AI Research
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#2B3139] hover:bg-[#323942] text-[#EAECEF] border border-[#2B2F36] text-xs font-medium transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>上傳歷史 K 線 (*.txt/*.csv/*.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto mt-3 border-t border-[#2B2F36] pt-2 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  tab.badge === 'AI' ? 'bg-amber-500/20 text-amber-300' : 'bg-[#2B3139] text-[#848E9C]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
