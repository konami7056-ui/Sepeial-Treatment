import React from 'react';
import { TurtleStrategyParams } from '../types/strategy';
import { BacktestConfig } from '../types/backtest';
import { Play, Settings2, DollarSign, Percent, Shield, ArrowUpRight } from 'lucide-react';

interface TurtleStrategyPanelProps {
  params: TurtleStrategyParams;
  onParamsChange: (params: TurtleStrategyParams) => void;
  config: BacktestConfig;
  onConfigChange: (config: BacktestConfig) => void;
  onRunBacktest: () => void;
  isBacktesting: boolean;
}

export const TurtleStrategyPanel: React.FC<TurtleStrategyPanelProps> = ({
  params,
  onParamsChange,
  config,
  onConfigChange,
  onRunBacktest,
  isBacktesting,
}) => {
  const applyPresetSystem = (system: 1 | 2) => {
    if (system === 1) {
      onParamsChange({ ...params, system: 1, entryBreakoutDays: 20, exitDays: 10 });
    } else {
      onParamsChange({ ...params, system: 2, entryBreakoutDays: 55, exitDays: 20 });
    }
  };

  return (
    <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2B2F36] pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#38bdf8]/10 text-[#38bdf8] rounded border border-[#38bdf8]/20">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EAECEF]">經典海龜交易策略參數設定 (Turtle Trading Strategy)</h3>
            <p className="text-xs text-[#848E9C]">Richard Dennis & William Eckhardt 完整唐奇安通道與 ATR 部位位階控制</p>
          </div>
        </div>

        <button
          onClick={onRunBacktest}
          disabled={isBacktesting}
          className="bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold px-5 py-2 rounded text-xs transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50 shrink-0 font-mono"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{isBacktesting ? '執行回測中...' : 'RUN TURTLE BACKTEST'}</span>
        </button>
      </div>

      {/* Preset System Buttons */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold text-[#848E9C] font-mono uppercase">經典系統預設:</span>
        <button
          onClick={() => applyPresetSystem(1)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border font-mono ${
            params.entryBreakoutDays === 20
              ? 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40'
              : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36] hover:bg-[#2B3139]'
          }`}
        >
          System 1 (20日突破 / 10日出場)
        </button>
        <button
          onClick={() => applyPresetSystem(2)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border font-mono ${
            params.entryBreakoutDays === 55
              ? 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40'
              : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36] hover:bg-[#2B3139]'
          }`}
        >
          System 2 (55日突破 / 20日出場)
        </button>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Entry & Exit Channel */}
        <div className="bg-[#0B0E11] p-3.5 rounded border border-[#2B2F36] space-y-3">
          <div className="flex items-center space-x-2 text-[#38bdf8] font-bold border-b border-[#2B2F36] pb-1.5 font-mono">
            <ArrowUpRight className="w-4 h-4" />
            <span>唐奇安通道 (Donchian Channels)</span>
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">進場突破日數 (Breakout Days)</label>
            <input
              type="number"
              value={params.entryBreakoutDays}
              onChange={e => onParamsChange({ ...params, entryBreakoutDays: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] font-mono focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">反向出場通道日數 (Exit Days)</label>
            <input
              type="number"
              value={params.exitDays}
              onChange={e => onParamsChange({ ...params, exitDays: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] font-mono focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
        </div>

        {/* Risk & Pyramiding */}
        <div className="bg-[#0B0E11] p-3.5 rounded border border-[#2B2F36] space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold border-b border-[#2B2F36] pb-1.5 font-mono">
            <Percent className="w-4 h-4" />
            <span>部位限制與 ATR 波動度</span>
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">單筆暴險額 (Risk % of Capital / N)</label>
            <input
              type="number"
              step="0.1"
              value={params.riskPercent}
              onChange={e => onParamsChange({ ...params, riskPercent: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] font-mono focus:outline-none focus:border-[#38bdf8]"
            />
            <span className="text-[10px] text-[#848E9C] mt-0.5 block font-mono">標準海龜法則預設為 1.0%</span>
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">停損邊界 (Stop Loss ATR)</label>
            <input
              type="number"
              step="0.1"
              value={params.stopLossAtr}
              onChange={e => onParamsChange({ ...params, stopLossAtr: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] font-mono focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">金字塔加碼間距 (Pyramid ATR)</label>
            <input
              type="number"
              step="0.1"
              value={params.pyramidAtr}
              onChange={e => onParamsChange({ ...params, pyramidAtr: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] font-mono focus:outline-none focus:border-[#38bdf8]"
            />
          </div>
        </div>

        {/* Capital & Fees */}
        <div className="bg-[#0B0E11] p-3.5 rounded border border-[#2B2F36] space-y-3">
          <div className="flex items-center space-x-2 text-[#38bdf8] font-bold border-b border-[#2B2F36] pb-1.5 font-mono">
            <DollarSign className="w-4 h-4" />
            <span>資金與真實交易成本模型</span>
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">初始資金 (Initial Capital NTD)</label>
            <input
              type="number"
              step="100000"
              value={config.initialCapital}
              onChange={e => onConfigChange({ ...config, initialCapital: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] font-mono focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">手續費折扣 (Commission Discount)</label>
            <select
              value={config.commissionDiscount}
              onChange={e => onConfigChange({ ...config, commissionDiscount: Number(e.target.value) })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#EAECEF] focus:outline-none focus:border-[#38bdf8] font-mono cursor-pointer"
            >
              <option value="1.0">原價 10折 (0.1425%)</option>
              <option value="0.6">6 折 (台股常見電子下單)</option>
              <option value="0.28">2.8 折 (大戶特惠折扣)</option>
              <option value="0.0">免手續費 (美股零手續費)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#848E9C] mb-1 font-mono text-[11px]">防作弊交易時點 (Execution Timing)</label>
            <select
              value={config.executionTiming}
              onChange={e => onConfigChange({ ...config, executionTiming: e.target.value as any })}
              className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-1.5 text-[#38bdf8] focus:outline-none focus:border-[#38bdf8] font-mono font-semibold cursor-pointer"
            >
              <option value="NEXT_OPEN">次日開盤價成交 (Next Open, 無 Look-Ahead Bias)</option>
              <option value="CURRENT_CLOSE">當日收盤價成交 (Market-on-Close)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
