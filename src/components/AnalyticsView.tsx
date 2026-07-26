import React, { useState } from 'react';
import { BacktestResult } from '../types/backtest';
import { EquityCurveChart } from '../charts/EquityCurveChart';
import { TrendingUp, TrendingDown, Award, Calendar, DollarSign, Activity, AlertCircle, List } from 'lucide-react';

interface AnalyticsViewProps {
  result: BacktestResult | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ result }) => {
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  if (!result || result.trades.length === 0) {
    return (
      <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-8 text-center text-[#848E9C]">
        <AlertCircle className="w-10 h-10 text-[#848E9C] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#EAECEF]">尚未進行海龜策略回測或回測期間無產生交易訊號</p>
        <p className="text-xs text-[#848E9C] mt-1 font-mono">請切換至【海龜交易策略】分頁點擊【RUN TURTLE BACKTEST】</p>
      </div>
    );
  }

  const { metrics, trades, equityCurve, config } = result;

  const filteredTrades = trades.filter(t => {
    if (filter === 'WIN') return (t.pnl || 0) > 0;
    if (filter === 'LOSS') return (t.pnl || 0) <= 0;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3.5 shadow-sm">
          <span className="text-[10px] text-[#848E9C] font-mono uppercase block mb-1">累積總報酬率 Total Return</span>
          <div className={`text-xl font-extrabold font-mono ${metrics.totalReturn >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'}`}>
            {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(2)}%
          </div>
          <span className="text-[10px] text-[#848E9C] mt-0.5 block font-mono">淨利: ${metrics.netProfit.toLocaleString()}</span>
        </div>

        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3.5 shadow-sm">
          <span className="text-[10px] text-[#848E9C] font-mono uppercase block mb-1">年化報酬率 CAGR</span>
          <div className={`text-xl font-extrabold font-mono ${metrics.cagr >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'}`}>
            {metrics.cagr >= 0 ? '+' : ''}{metrics.cagr.toFixed(2)}%
          </div>
          <span className="text-[10px] text-[#848E9C] mt-0.5 block font-mono">複合年均成長率</span>
        </div>

        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3.5 shadow-sm">
          <span className="text-[10px] text-[#848E9C] font-mono uppercase block mb-1">最大歷史回撤 Max DD</span>
          <div className="text-xl font-extrabold font-mono text-[#F84960]">
            {metrics.maxDrawdown.toFixed(2)}%
          </div>
          <span className="text-[10px] text-[#848E9C] mt-0.5 block font-mono">Calmar: {metrics.calmarRatio.toFixed(2)}</span>
        </div>

        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3.5 shadow-sm">
          <span className="text-[10px] text-[#848E9C] font-mono uppercase block mb-1">夏普比率 Sharpe Ratio</span>
          <div className="text-xl font-extrabold font-mono text-[#EAECEF]">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <span className="text-[10px] text-[#848E9C] mt-0.5 block font-mono">Sortino: {metrics.sortinoRatio.toFixed(2)}</span>
        </div>

        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3.5 shadow-sm">
          <span className="text-[10px] text-[#848E9C] font-mono uppercase block mb-1">勝率 / 獲利因子</span>
          <div className="text-xl font-extrabold font-mono text-[#38bdf8]">
            {metrics.winRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#848E9C] mt-0.5 block font-mono">Profit Factor: {metrics.profitFactor.toFixed(2)}</span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
        <div>
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">總交易次數</span>
          <span className="font-bold font-mono text-[#EAECEF]">{metrics.tradeCount} 筆</span>
        </div>
        <div>
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">勝 / 敗 筆數</span>
          <span className="font-bold font-mono text-[#EAECEF]">{metrics.winningTrades} 勝 / {metrics.losingTrades} 敗</span>
        </div>
        <div>
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">平均勝敗比 (Win/Loss)</span>
          <span className="font-bold font-mono text-[#38bdf8]">{metrics.winLossRatio.toFixed(2)} 倍</span>
        </div>
        <div>
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">平均每筆 R 回報</span>
          <span className="font-bold font-mono text-[#38bdf8]">+{metrics.averageR.toFixed(2)} R</span>
        </div>
        <div>
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">平均持倉天數</span>
          <span className="font-bold font-mono text-[#EAECEF]">{metrics.averageHoldingDays.toFixed(1)} 天</span>
        </div>
        <div>
          <span className="text-[#848E9C] text-[10px] block font-mono uppercase">已支付總交易成本</span>
          <span className="font-bold font-mono text-[#848E9C]">${metrics.totalFeesPaid.toLocaleString()}</span>
        </div>
      </div>

      {/* Equity Chart */}
      <EquityCurveChart equityCurve={equityCurve} initialCapital={config.initialCapital} />

      {/* Trade Execution Log Table */}
      <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#2B2F36] pb-2">
          <div className="flex items-center space-x-2">
            <List className="w-4 h-4 text-[#38bdf8]" />
            <h4 className="text-xs font-bold text-[#EAECEF] font-mono uppercase">詳細交易紀錄與部位明細 (Trade Execution Log)</h4>
          </div>

          <div className="flex items-center space-x-1 bg-[#0B0E11] p-1 rounded border border-[#2B2F36] text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-0.5 rounded font-mono text-xs cursor-pointer transition ${filter === 'ALL' ? 'bg-[#38bdf8] text-black font-bold' : 'text-[#848E9C]'}`}
            >
              全部 ({trades.length})
            </button>
            <button
              onClick={() => setFilter('WIN')}
              className={`px-2.5 py-0.5 rounded font-mono text-xs cursor-pointer transition ${filter === 'WIN' ? 'bg-[#F84960] text-black font-bold' : 'text-[#848E9C]'}`}
            >
              獲利 ({metrics.winningTrades})
            </button>
            <button
              onClick={() => setFilter('LOSS')}
              className={`px-2.5 py-0.5 rounded font-mono text-xs cursor-pointer transition ${filter === 'LOSS' ? 'bg-[#02C076] text-black font-bold' : 'text-[#848E9C]'}`}
            >
              虧損 ({metrics.losingTrades})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px] scrollbar-thin">
          <table className="w-full text-left text-xs text-[#EAECEF]">
            <thead className="bg-[#0B0E11] text-[#848E9C] text-[10px] uppercase font-mono sticky top-0 border-b border-[#2B2F36]">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">方向</th>
                <th className="p-2">進場日期</th>
                <th className="p-2">進場均價</th>
                <th className="p-2">加碼次數</th>
                <th className="p-2">出場日期</th>
                <th className="p-2">出場價格</th>
                <th className="p-2">股數</th>
                <th className="p-2">淨損益 ($)</th>
                <th className="p-2">報酬率 (%)</th>
                <th className="p-2">R 倍數</th>
                <th className="p-2">天數</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2329] font-mono text-[11px]">
              {filteredTrades.map((t, idx) => {
                const isWin = (t.pnl || 0) > 0;
                return (
                  <tr key={t.id} className="hover:bg-[#2B3139]/50 transition">
                    <td className="p-2 font-bold text-[#848E9C]">{idx + 1}</td>
                    <td className="p-2 font-bold text-[#38bdf8]">{t.direction}</td>
                    <td className="p-2 text-[#EAECEF]">{t.entryDate}</td>
                    <td className="p-2 text-[#EAECEF]">${t.entryPrice.toFixed(2)}</td>
                    <td className="p-2 text-amber-400 font-bold">{t.units} Units</td>
                    <td className="p-2 text-[#EAECEF]">{t.exitDate || '持倉中'}</td>
                    <td className="p-2 text-[#EAECEF]">${t.exitPrice?.toFixed(2) || '-'}</td>
                    <td className="p-2 text-[#848E9C]">{t.shares.toLocaleString()}</td>
                    <td className={`p-2 font-bold ${isWin ? 'text-[#F84960]' : 'text-[#02C076]'}`}>
                      {isWin ? '+' : ''}${t.pnl?.toLocaleString() || 0}
                    </td>
                    <td className={`p-2 font-bold ${isWin ? 'text-[#F84960]' : 'text-[#02C076]'}`}>
                      {isWin ? '+' : ''}{t.pnlPercent?.toFixed(2)}%
                    </td>
                    <td className={`p-2 font-bold ${(t.rReturn || 0) >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'}`}>
                      {t.rReturn ? `${t.rReturn > 0 ? '+' : ''}${t.rReturn.toFixed(2)}R` : '-'}
                    </td>
                    <td className="p-2 text-[#848E9C]">{t.holdingDays} 天</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
