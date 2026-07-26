import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  BarChart3,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Tag,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export interface ManualTrade {
  id: string;
  symbol: string;
  symbolName?: string;
  buyDate: string;
  sellDate?: string | null;
  buyPrice: number;
  sellPrice?: number | null;
  lots: number; // 單位：張 (1張=1000股) 或 股數
  unitType: 'LOTS' | 'SHARES'; // 'LOTS' (張) or 'SHARES' (股)
  status: 'OPEN' | 'CLOSED';
  currentPrice?: number | null; // 庫存未實現計算參考價
  customFeeRate?: number; // 手續費率 (%) 預設 0.0855% (0.1425% * 6折)
  customTaxRate?: number; // 證交稅率 (%) 預設 0.3%
  notes?: string;
}

const STORAGE_KEY = 'QUANT_TERMINAL_MANUAL_TRADES_V1';

// Initial Mock Demo Trades for smooth preview
const INITIAL_DEMO_TRADES: ManualTrade[] = [
  {
    id: 't-1',
    symbol: '2330',
    symbolName: '台積電',
    buyDate: '2026-01-10',
    sellDate: '2026-03-15',
    buyPrice: 820,
    sellPrice: 940,
    lots: 2,
    unitType: 'LOTS',
    status: 'CLOSED',
    notes: '海龜通道突破波段買進，到達動態停利點平倉',
  },
  {
    id: 't-2',
    symbol: '2317',
    symbolName: '鴻海',
    buyDate: '2026-02-01',
    sellDate: '2026-04-10',
    buyPrice: 155,
    sellPrice: 182,
    lots: 5,
    unitType: 'LOTS',
    status: 'CLOSED',
    notes: 'AI 伺服器營收爆發，技術面回測 EMA45 支撐加碼',
  },
  {
    id: 't-3',
    symbol: '2454',
    symbolName: '聯發科',
    buyDate: '2026-04-20',
    sellDate: '2026-05-18',
    buyPrice: 1250,
    sellPrice: 1190,
    lots: 1,
    unitType: 'LOTS',
    status: 'CLOSED',
    notes: '假突破觸及海龜停損點，紀律出場',
  },
  {
    id: 't-4',
    symbol: '2330',
    symbolName: '台積電',
    buyDate: '2026-06-01',
    sellDate: null,
    buyPrice: 960,
    sellPrice: null,
    lots: 3,
    unitType: 'LOTS',
    status: 'OPEN',
    currentPrice: 1045,
    notes: '先進製程訂單滿載，庫存續抱',
  },
  {
    id: 't-5',
    symbol: '2382',
    symbolName: '廣達',
    buyDate: '2026-06-15',
    sellDate: null,
    buyPrice: 280,
    sellPrice: null,
    lots: 4,
    unitType: 'LOTS',
    status: 'OPEN',
    currentPrice: 312,
    notes: 'GB200 出貨高點，部位持有中',
  },
  {
    id: 't-6',
    symbol: '3231',
    symbolName: '緯創',
    buyDate: '2026-07-02',
    sellDate: null,
    buyPrice: 115,
    sellPrice: null,
    lots: 10,
    unitType: 'LOTS',
    status: 'OPEN',
    currentPrice: 112,
    notes: '築底突破，小幅回檔中',
  },
];

export const TradeLogView: React.FC = () => {
  const [trades, setTrades] = useState<ManualTrade[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_TRADES;
  });

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'DAILY' | 'MONTHLY' | 'YEARLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<ManualTrade | null>(null);

  // Close Position Modal State
  const [closeTradeTarget, setCloseTradeTarget] = useState<ManualTrade | null>(null);
  const [closePrice, setClosePrice] = useState<number>(0);
  const [closeDate, setCloseDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form fields
  const [formData, setFormData] = useState({
    symbol: '',
    symbolName: '',
    buyDate: new Date().toISOString().split('T')[0],
    sellDate: '',
    buyPrice: '',
    sellPrice: '',
    lots: '1',
    unitType: 'LOTS' as 'LOTS' | 'SHARES',
    status: 'OPEN' as 'OPEN' | 'CLOSED',
    currentPrice: '',
    notes: '',
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (e) {
      console.error('Failed to save trades to localStorage', e);
    }
  }, [trades]);

  // Open Modal for Create or Edit
  const handleOpenModal = (tradeToEdit?: ManualTrade) => {
    if (tradeToEdit) {
      setEditingTrade(tradeToEdit);
      setFormData({
        symbol: tradeToEdit.symbol,
        symbolName: tradeToEdit.symbolName || '',
        buyDate: tradeToEdit.buyDate,
        sellDate: tradeToEdit.sellDate || '',
        buyPrice: tradeToEdit.buyPrice.toString(),
        sellPrice: tradeToEdit.sellPrice ? tradeToEdit.sellPrice.toString() : '',
        lots: tradeToEdit.lots.toString(),
        unitType: tradeToEdit.unitType,
        status: tradeToEdit.status,
        currentPrice: tradeToEdit.currentPrice ? tradeToEdit.currentPrice.toString() : '',
        notes: tradeToEdit.notes || '',
      });
    } else {
      setEditingTrade(null);
      setFormData({
        symbol: '',
        symbolName: '',
        buyDate: new Date().toISOString().split('T')[0],
        sellDate: '',
        buyPrice: '',
        sellPrice: '',
        lots: '1',
        unitType: 'LOTS',
        status: 'OPEN',
        currentPrice: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.buyPrice || !formData.lots) {
      alert('請填寫股票代號、買進價格與張數/股數！');
      return;
    }

    const buyP = parseFloat(formData.buyPrice);
    const sellP = formData.sellPrice ? parseFloat(formData.sellPrice) : null;
    const currP = formData.currentPrice ? parseFloat(formData.currentPrice) : null;
    const qty = parseFloat(formData.lots);

    if (isNaN(buyP) || buyP <= 0 || isNaN(qty) || qty <= 0) {
      alert('請輸入有效的買進價格與數量！');
      return;
    }

    const isClosed = formData.status === 'CLOSED' || (sellP !== null && sellP > 0);

    const newTrade: ManualTrade = {
      id: editingTrade ? editingTrade.id : 'trade-' + Date.now(),
      symbol: formData.symbol.trim().toUpperCase(),
      symbolName: formData.symbolName.trim(),
      buyDate: formData.buyDate,
      sellDate: isClosed ? (formData.sellDate || new Date().toISOString().split('T')[0]) : null,
      buyPrice: buyP,
      sellPrice: isClosed ? sellP : null,
      lots: qty,
      unitType: formData.unitType,
      status: isClosed ? 'CLOSED' : 'OPEN',
      currentPrice: !isClosed ? (currP || buyP) : null,
      notes: formData.notes,
    };

    if (editingTrade) {
      setTrades(prev => prev.map(t => (t.id === editingTrade.id ? newTrade : t)));
    } else {
      setTrades(prev => [newTrade, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete Trade
  const handleDeleteTrade = (id: string) => {
    if (confirm('確定要刪除此筆交易紀錄嗎？')) {
      setTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  // Open Quick Close Modal
  const handleOpenCloseModal = (trade: ManualTrade) => {
    setCloseTradeTarget(trade);
    setClosePrice(trade.currentPrice || trade.buyPrice);
    setCloseDate(new Date().toISOString().split('T')[0]);
  };

  // Confirm Quick Close
  const handleConfirmCloseTrade = () => {
    if (!closeTradeTarget) return;
    if (closePrice <= 0) {
      alert('請輸入有效平倉賣出價格！');
      return;
    }

    setTrades(prev =>
      prev.map(t =>
        t.id === closeTradeTarget.id
          ? {
              ...t,
              status: 'CLOSED',
              sellDate: closeDate,
              sellPrice: closePrice,
              currentPrice: null,
            }
          : t
      )
    );
    setCloseTradeTarget(null);
  };

  // Helper function to calculate detailed trade figures
  const calculateTradeDetails = (t: ManualTrade) => {
    const totalShares = t.unitType === 'LOTS' ? t.lots * 1000 : t.lots;
    const buyCapital = t.buyPrice * totalShares;
    
    // Fee / Tax rates (Default 0.1425% * 0.6 = 0.0855%, Tax = 0.3%)
    const feeRate = (t.customFeeRate ?? 0.0855) / 100;
    const taxRate = (t.customTaxRate ?? 0.3) / 100;

    const buyFee = Math.floor(buyCapital * feeRate);
    const totalBuyCost = buyCapital + buyFee;

    if (t.status === 'CLOSED' && t.sellPrice && t.sellPrice > 0) {
      const sellRevenue = t.sellPrice * totalShares;
      const sellFee = Math.floor(sellRevenue * feeRate);
      const sellTax = Math.floor(sellRevenue * taxRate);
      const netSellRevenue = sellRevenue - sellFee - sellTax;
      const netPnL = netSellRevenue - totalBuyCost;
      const pnlPercent = totalBuyCost > 0 ? (netPnL / totalBuyCost) * 100 : 0;

      return {
        totalShares,
        totalBuyCost,
        netPnL,
        pnlPercent,
        isWin: netPnL > 0,
        isClosed: true,
      };
    } else {
      // OPEN Position Unrealized PnL
      const currP = t.currentPrice ?? t.buyPrice;
      const marketVal = currP * totalShares;
      const estSellFee = Math.floor(marketVal * feeRate);
      const estSellTax = Math.floor(marketVal * taxRate);
      const estNetRevenue = marketVal - estSellFee - estSellTax;
      const unrealizedPnL = estNetRevenue - totalBuyCost;
      const pnlPercent = totalBuyCost > 0 ? (unrealizedPnL / totalBuyCost) * 100 : 0;

      return {
        totalShares,
        totalBuyCost,
        marketVal,
        netPnL: unrealizedPnL,
        pnlPercent,
        isWin: unrealizedPnL > 0,
        isClosed: false,
      };
    }
  };

  // Detailed Summary Computations
  const summary = useMemo(() => {
    let openCount = 0;
    let closedCount = 0;
    let totalInvestedCap = 0;
    let totalMarketVal = 0;
    let totalUnrealizedPnL = 0;

    let totalRealizedPnL = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    trades.forEach(t => {
      const details = calculateTradeDetails(t);
      if (t.status === 'OPEN') {
        openCount++;
        totalInvestedCap += details.totalBuyCost;
        totalMarketVal += details.marketVal || 0;
        totalUnrealizedPnL += details.netPnL;
      } else {
        closedCount++;
        totalRealizedPnL += details.netPnL;
        if (details.netPnL > 0) {
          winCount++;
          totalWinAmount += details.netPnL;
        } else if (details.netPnL < 0) {
          lossCount++;
          totalLossAmount += Math.abs(details.netPnL);
        }
      }
    });

    const winRate = closedCount > 0 ? (winCount / closedCount) * 100 : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 99 : 0;

    return {
      openCount,
      closedCount,
      totalInvestedCap,
      totalMarketVal,
      totalUnrealizedPnL,
      unrealizedReturnPercent: totalInvestedCap > 0 ? (totalUnrealizedPnL / totalInvestedCap) * 100 : 0,
      totalRealizedPnL,
      winCount,
      lossCount,
      winRate,
      profitFactor,
    };
  }, [trades]);

  // Aggregated Time breakdown (Daily, Monthly, Yearly)
  const timeAggregatedStats = useMemo(() => {
    const dailyMap = new Map<string, { date: string; pnl: number; count: number; win: number }>();
    const monthlyMap = new Map<string, { month: string; pnl: number; count: number; win: number }>();
    const yearlyMap = new Map<string, { year: string; pnl: number; count: number; win: number }>();

    trades.forEach(t => {
      if (t.status !== 'CLOSED') return; // Only aggregate realized trades for time-period PnL
      const details = calculateTradeDetails(t);
      const dateStr = t.sellDate || t.buyDate;
      if (!dateStr) return;

      const monthStr = dateStr.substring(0, 7); // YYYY-MM
      const yearStr = dateStr.substring(0, 4); // YYYY

      // Daily
      const dCurr = dailyMap.get(dateStr) || { date: dateStr, pnl: 0, count: 0, win: 0 };
      dCurr.pnl += details.netPnL;
      dCurr.count += 1;
      if (details.netPnL > 0) dCurr.win += 1;
      dailyMap.set(dateStr, dCurr);

      // Monthly
      const mCurr = monthlyMap.get(monthStr) || { month: monthStr, pnl: 0, count: 0, win: 0 };
      mCurr.pnl += details.netPnL;
      mCurr.count += 1;
      if (details.netPnL > 0) mCurr.win += 1;
      monthlyMap.set(monthStr, mCurr);

      // Yearly
      const yCurr = yearlyMap.get(yearStr) || { year: yearStr, pnl: 0, count: 0, win: 0 };
      yCurr.pnl += details.netPnL;
      yCurr.count += 1;
      if (details.netPnL > 0) yCurr.win += 1;
      yearlyMap.set(yearStr, yCurr);
    });

    return {
      daily: Array.from(dailyMap.values()).sort((a, b) => (b.date > a.date ? 1 : -1)),
      monthly: Array.from(monthlyMap.values()).sort((a, b) => (b.month > a.month ? 1 : -1)),
      yearly: Array.from(yearlyMap.values()).sort((a, b) => (b.year > a.year ? 1 : -1)),
    };
  }, [trades]);

  // Filtered Trades list for rendering
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (activeTab === 'OPEN' && t.status !== 'OPEN') return false;
      if (activeTab === 'CLOSED' && t.status !== 'CLOSED') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesSymbol = t.symbol.toLowerCase().includes(q);
        const matchesName = t.symbolName?.toLowerCase().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q);
        if (!matchesSymbol && !matchesName && !matchesNotes) return false;
      }
      return true;
    });
  }, [trades, activeTab, searchQuery]);

  // JSON Export
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trades, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trade_journal_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = event => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setTrades(parsed);
            alert(`成功匯入 ${parsed.length} 筆交易紀錄！`);
          }
        } catch {
          alert('匯入失敗：格式不正確，請提供合法的 JSON 檔！');
        }
      };
    }
  };

  return (
    <div className="space-y-6 font-mono text-[#EAECEF]">
      {/* Overview Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 庫存未實現損益 */}
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <span>目前持有的庫存總市值</span>
            <Layers className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-white">
              NT$ {Math.round(summary.totalMarketVal).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs">
              <span className="text-[#848E9C]">未實現損益:</span>
              <span
                className={`font-bold flex items-center ${
                  summary.totalUnrealizedPnL >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
                }`}
              >
                {summary.totalUnrealizedPnL >= 0 ? '+' : ''}
                {Math.round(summary.totalUnrealizedPnL).toLocaleString()} (
                {summary.unrealizedReturnPercent >= 0 ? '+' : ''}
                {summary.unrealizedReturnPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#848E9C] border-t border-[#2B2F36] pt-2 mt-3 flex justify-between">
            <span>庫存股數檔數: {summary.openCount} 檔</span>
            <span>本金: NT$ {Math.round(summary.totalInvestedCap).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: 總實現損益 */}
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <span>已平倉累計總實現損益</span>
            <DollarSign className="w-4 h-4 text-[#02C076]" />
          </div>
          <div className="mt-2">
            <div
              className={`text-xl font-bold flex items-center gap-1 ${
                summary.totalRealizedPnL >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
              }`}
            >
              {summary.totalRealizedPnL >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              NT$ {Math.round(summary.totalRealizedPnL).toLocaleString()}
            </div>
            <div className="text-xs text-[#848E9C] mt-1">
              平倉筆數: <strong className="text-white">{summary.closedCount}</strong> 筆
            </div>
          </div>
          <div className="text-[11px] text-[#848E9C] border-t border-[#2B2F36] pt-2 mt-3 flex justify-between">
            <span>獲利: {summary.winCount} 筆</span>
            <span>虧損: {summary.lossCount} 筆</span>
          </div>
        </div>

        {/* Card 3: 勝率 */}
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <span>平倉交易勝率 (Win Rate)</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-amber-400">
              {summary.winRate.toFixed(1)}%
            </div>
            <div className="w-full bg-[#2B2F36] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, summary.winRate))}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-[#848E9C] border-t border-[#2B2F36] pt-2 mt-3 flex justify-between">
            <span>盈虧比 (PF): {summary.profitFactor.toFixed(2)}</span>
            <span>總比數: {summary.closedCount} 筆</span>
          </div>
        </div>

        {/* Card 4: 快捷操作 */}
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <span>交易紀錄快速管理</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col gap-2 my-2">
            <button
              onClick={() => handleOpenModal()}
              className="w-full py-1.5 bg-[#02C076] hover:bg-[#02a062] text-black font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>新增真實交易紀錄</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-1 bg-[#2B2F36] hover:bg-[#363C44] text-xs text-[#EAECEF] rounded border border-[#363C44] transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>匯出 JSON</span>
              </button>
              <label className="flex-1 py-1 bg-[#2B2F36] hover:bg-[#363C44] text-xs text-[#EAECEF] rounded border border-[#363C44] transition flex items-center justify-center space-x-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>匯入 JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>
          <div className="text-[10px] text-[#848E9C] text-center border-t border-[#2B2F36] pt-1">
            資料安全儲存於本地瀏覽器
          </div>
        </div>
      </div>

      {/* Main Tab Navigation & Filter Bar */}
      <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-[#0B0E11] p-1 rounded-md border border-[#2B2F36]">
          {[
            { id: 'ALL', label: '全部交易', count: trades.length },
            { id: 'OPEN', label: '庫存持有中', count: summary.openCount, highlight: true },
            { id: 'CLOSED', label: '已平倉結案', count: summary.closedCount },
            { id: 'DAILY', label: '日損益統計', icon: <Calendar className="w-3.5 h-3.5 inline mr-1" /> },
            { id: 'MONTHLY', label: '月損益統計', icon: <PieChart className="w-3.5 h-3.5 inline mr-1" /> },
            { id: 'YEARLY', label: '年損益統計', icon: <TrendingUp className="w-3.5 h-3.5 inline mr-1" /> },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  isActive
                    ? 'bg-[#02C076] text-black shadow-sm'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isActive
                        ? 'bg-black/20 text-black'
                        : tab.highlight
                        ? 'bg-[#38bdf8]/20 text-[#38bdf8]'
                        : 'bg-[#2B2F36] text-[#848E9C]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#848E9C]" />
          <input
            type="text"
            placeholder="搜尋股票代號或名稱/筆記..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0E11] text-xs text-[#EAECEF] pl-8 pr-3 py-1.5 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none"
          />
        </div>
      </div>

      {/* TAB CONTENT 1: AGGREGATED TIME STATS (DAILY, MONTHLY, YEARLY) */}
      {(activeTab === 'DAILY' || activeTab === 'MONTHLY' || activeTab === 'YEARLY') && (
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2B2F36]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#02C076]" />
              {activeTab === 'DAILY' && '每日損益統計 (Daily Realized PnL)'}
              {activeTab === 'MONTHLY' && '每月損益統計 (Monthly Realized PnL)'}
              {activeTab === 'YEARLY' && '每年損益統計 (Yearly Realized PnL)'}
            </h3>
            <span className="text-xs text-[#848E9C]">依據已平倉交易之結算日期分類歸納</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2B2F36] text-[#848E9C] bg-[#0B0E11]">
                  <th className="py-2.5 px-3">時間區間</th>
                  <th className="py-2.5 px-3 text-right">平倉筆數</th>
                  <th className="py-2.5 px-3 text-right">獲利次數</th>
                  <th className="py-2.5 px-3 text-right">勝率</th>
                  <th className="py-2.5 px-3 text-right">區間合計實現損益 (NT$)</th>
                  <th className="py-2.5 px-3 text-center">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F36]/50">
                {activeTab === 'DAILY' &&
                  timeAggregatedStats.daily.map(item => (
                    <tr key={item.date} className="hover:bg-[#2B3139]/40 transition">
                      <td className="py-2.5 px-3 font-bold text-[#EAECEF]">{item.date}</td>
                      <td className="py-2.5 px-3 text-right">{item.count} 筆</td>
                      <td className="py-2.5 px-3 text-right text-[#02C076]">{item.win} 筆</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {((item.win / item.count) * 100).toFixed(0)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold font-mono text-sm ${
                          item.pnl >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
                        }`}
                      >
                        {item.pnl >= 0 ? '+' : ''}
                        {Math.round(item.pnl).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.pnl >= 0 ? 'bg-[#F84960]/10 text-[#F84960]' : 'bg-[#02C076]/10 text-[#02C076]'
                          }`}
                        >
                          {item.pnl >= 0 ? '大吉盈利' : '虧損結算'}
                        </span>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'MONTHLY' &&
                  timeAggregatedStats.monthly.map(item => (
                    <tr key={item.month} className="hover:bg-[#2B3139]/40 transition">
                      <td className="py-2.5 px-3 font-bold text-[#EAECEF]">{item.month} 月份</td>
                      <td className="py-2.5 px-3 text-right">{item.count} 筆</td>
                      <td className="py-2.5 px-3 text-right text-[#02C076]">{item.win} 筆</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {((item.win / item.count) * 100).toFixed(0)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold font-mono text-sm ${
                          item.pnl >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
                        }`}
                      >
                        {item.pnl >= 0 ? '+' : ''}
                        {Math.round(item.pnl).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.pnl >= 0 ? 'bg-[#F84960]/10 text-[#F84960]' : 'bg-[#02C076]/10 text-[#02C076]'
                          }`}
                        >
                          {item.pnl >= 0 ? '單月正報酬' : '單月負報酬'}
                        </span>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'YEARLY' &&
                  timeAggregatedStats.yearly.map(item => (
                    <tr key={item.year} className="hover:bg-[#2B3139]/40 transition">
                      <td className="py-2.5 px-3 font-bold text-[#EAECEF]">{item.year} 年度</td>
                      <td className="py-2.5 px-3 text-right">{item.count} 筆</td>
                      <td className="py-2.5 px-3 text-right text-[#02C076]">{item.win} 筆</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {((item.win / item.count) * 100).toFixed(0)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold font-mono text-sm ${
                          item.pnl >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
                        }`}
                      >
                        {item.pnl >= 0 ? '+' : ''}
                        {Math.round(item.pnl).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.pnl >= 0 ? 'bg-[#F84960]/10 text-[#F84960]' : 'bg-[#02C076]/10 text-[#02C076]'
                          }`}
                        >
                          {item.pnl >= 0 ? '年度獲利' : '年度虧損'}
                        </span>
                      </td>
                    </tr>
                  ))}

                {((activeTab === 'DAILY' && timeAggregatedStats.daily.length === 0) ||
                  (activeTab === 'MONTHLY' && timeAggregatedStats.monthly.length === 0) ||
                  (activeTab === 'YEARLY' && timeAggregatedStats.yearly.length === 0)) && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#848E9C]">
                      目前尚無平倉結案之交易紀錄可供分析
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TRADES LIST (ALL, OPEN, CLOSED) */}
      {(activeTab === 'ALL' || activeTab === 'OPEN' || activeTab === 'CLOSED') && (
        <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2B2F36]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#38bdf8]" />
              交易紀錄與庫存明細 ({filteredTrades.length} 筆)
            </h3>
            <span className="text-xs text-[#848E9C]">支援即時未實現損益試算與一鍵快捷賣出平倉</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2B2F36] text-[#848E9C] bg-[#0B0E11]">
                  <th className="py-2.5 px-3">狀態</th>
                  <th className="py-2.5 px-3">標的/名稱</th>
                  <th className="py-2.5 px-3">買進日期</th>
                  <th className="py-2.5 px-3 text-right">買價 (NT$)</th>
                  <th className="py-2.5 px-3 text-right">平倉賣價/市價</th>
                  <th className="py-2.5 px-3 text-right">張數/股數</th>
                  <th className="py-2.5 px-3 text-right">投資總本金</th>
                  <th className="py-2.5 px-3 text-right">損益金額 (含費用)</th>
                  <th className="py-2.5 px-3 text-right">報酬率 %</th>
                  <th className="py-2.5 px-3">筆記備註</th>
                  <th className="py-2.5 px-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F36]/50">
                {filteredTrades.map(trade => {
                  const details = calculateTradeDetails(trade);
                  const isHolding = trade.status === 'OPEN';

                  return (
                    <tr key={trade.id} className="hover:bg-[#2B3139]/40 transition group">
                      {/* Status badge */}
                      <td className="py-3 px-3">
                        {isHolding ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            庫存中
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-700/40 text-gray-300 border border-gray-600/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#02C076]" />
                            已結案
                          </span>
                        )}
                      </td>

                      {/* Symbol */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#EAECEF] text-sm">{trade.symbol}</div>
                        {trade.symbolName && <div className="text-[10px] text-[#848E9C]">{trade.symbolName}</div>}
                      </td>

                      {/* Buy Date */}
                      <td className="py-3 px-3 text-[#848E9C] font-mono">{trade.buyDate}</td>

                      {/* Buy Price */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#EAECEF]">
                        ${trade.buyPrice}
                      </td>

                      {/* Sell/Current Price */}
                      <td className="py-3 px-3 text-right font-mono">
                        {isHolding ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[#38bdf8] font-semibold">${trade.currentPrice || trade.buyPrice}</span>
                            <span className="text-[9px] text-[#848E9C]">(當前參考市價)</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-white font-semibold">${trade.sellPrice}</span>
                            <span className="text-[9px] text-[#848E9C]">{trade.sellDate} 平倉</span>
                          </div>
                        )}
                      </td>

                      {/* Lots / Quantity */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#EAECEF]">
                        {trade.lots} {trade.unitType === 'LOTS' ? '張' : '股'}
                      </td>

                      {/* Total Invested Capital */}
                      <td className="py-3 px-3 text-right font-mono text-[#848E9C]">
                        ${Math.round(details.totalBuyCost).toLocaleString()}
                      </td>

                      {/* PnL Amount */}
                      <td
                        className={`py-3 px-3 text-right font-bold font-mono text-sm ${
                          details.netPnL >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
                        }`}
                      >
                        {details.netPnL >= 0 ? '+' : ''}
                        {Math.round(details.netPnL).toLocaleString()}
                      </td>

                      {/* PnL % */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            details.pnlPercent >= 0
                              ? 'bg-[#F84960]/10 text-[#F84960]'
                              : 'bg-[#02C076]/10 text-[#02C076]'
                          }`}
                        >
                          {details.pnlPercent >= 0 ? '+' : ''}
                          {details.pnlPercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-3 max-w-[160px] truncate text-[#848E9C] text-[11px]" title={trade.notes}>
                        {trade.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isHolding && (
                            <button
                              onClick={() => handleOpenCloseModal(trade)}
                              className="px-2 py-1 bg-[#38bdf8]/15 hover:bg-[#38bdf8]/30 text-[#38bdf8] rounded text-[10px] font-bold transition cursor-pointer border border-[#38bdf8]/30"
                              title="一鍵賣出平倉"
                            >
                              賣出平倉
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(trade)}
                            className="p-1 hover:bg-[#2B3139] text-[#848E9C] hover:text-white rounded transition cursor-pointer"
                            title="編輯"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="p-1 hover:bg-rose-500/20 text-[#848E9C] hover:text-rose-400 rounded transition cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTrades.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#848E9C]">
                      目前無相符的交易紀錄，點擊右上方「新增真實交易紀錄」開始記錄！
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TRADE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161A1E] border border-[#2B2F36] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2F36]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#02C076]" />
                {editingTrade ? '編輯交易紀錄' : '新增個人實盤交易紀錄'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#848E9C] hover:text-white text-lg font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#848E9C] mb-1">股票代號 *</label>
                  <input
                    type="text"
                    required
                    placeholder="例: 2330"
                    value={formData.symbol}
                    onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#848E9C] mb-1">股票名稱 (選填)</label>
                  <input
                    type="text"
                    placeholder="例: 台積電"
                    value={formData.symbolName}
                    onChange={e => setFormData({ ...formData, symbolName: e.target.value })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#848E9C] mb-1">買進日期 *</label>
                  <input
                    type="date"
                    required
                    value={formData.buyDate}
                    onChange={e => setFormData({ ...formData, buyDate: e.target.value })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#848E9C] mb-1">買進價格 (NT$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="例: 950"
                    value={formData.buyPrice}
                    onChange={e => setFormData({ ...formData, buyPrice: e.target.value })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#848E9C] mb-1">數量單位</label>
                  <select
                    value={formData.unitType}
                    onChange={e => setFormData({ ...formData, unitType: e.target.value as any })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none"
                  >
                    <option value="LOTS">張 (1張=1000股)</option>
                    <option value="SHARES">股 (零股交易)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#848E9C] mb-1">交易數量 *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.lots}
                    onChange={e => setFormData({ ...formData, lots: e.target.value })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#848E9C] mb-1">當前交易狀態</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'OPEN', sellPrice: '', sellDate: '' })}
                    className={`flex-1 py-1.5 rounded border font-bold transition cursor-pointer ${
                      formData.status === 'OPEN'
                        ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]'
                        : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36]'
                    }`}
                  >
                    庫存持有中 (OPEN)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status: 'CLOSED',
                        sellDate: formData.sellDate || new Date().toISOString().split('T')[0],
                      })
                    }
                    className={`flex-1 py-1.5 rounded border font-bold transition cursor-pointer ${
                      formData.status === 'CLOSED'
                        ? 'bg-[#02C076]/20 text-[#02C076] border-[#02C076]'
                        : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36]'
                    }`}
                  >
                    已平倉賣出 (CLOSED)
                  </button>
                </div>
              </div>

              {formData.status === 'OPEN' ? (
                <div>
                  <label className="block text-[#848E9C] mb-1">當前參考市價 (估算未實現損益)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="若留空將預設等於買價"
                    value={formData.currentPrice}
                    onChange={e => setFormData({ ...formData, currentPrice: e.target.value })}
                    className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#38bdf8] outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#848E9C] mb-1">賣出日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.sellDate}
                      onChange={e => setFormData({ ...formData, sellDate: e.target.value })}
                      className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#848E9C] mb-1">賣出價格 (NT$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="例: 1020"
                      value={formData.sellPrice}
                      onChange={e => setFormData({ ...formData, sellPrice: e.target.value })}
                      className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#848E9C] mb-1">進出場筆記/備註 (選填)</label>
                <textarea
                  rows={2}
                  placeholder="記載技術面指標、海龜訊號、進場心態..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#2B2F36] hover:bg-[#363C44] text-[#848E9C] hover:text-white rounded transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#02C076] hover:bg-[#02a062] text-black font-bold rounded transition cursor-pointer shadow-sm"
                >
                  儲存交易紀錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CLOSE POSITION MODAL */}
      {closeTradeTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161A1E] border border-[#2B2F36] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="pb-2 border-b border-[#2B2F36]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#02C076]" />
                一鍵賣出平倉 - {closeTradeTarget.symbol} {closeTradeTarget.symbolName}
              </h3>
              <p className="text-xs text-[#848E9C] mt-1">
                買進成本: ${closeTradeTarget.buyPrice} x {closeTradeTarget.lots} {closeTradeTarget.unitType === 'LOTS' ? '張' : '股'}
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#848E9C] mb-1">平倉賣出日期</label>
                <input
                  type="date"
                  value={closeDate}
                  onChange={e => setCloseDate(e.target.value)}
                  className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#848E9C] mb-1">平倉成交賣價 (NT$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={closePrice}
                  onChange={e => setClosePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0B0E11] text-[#EAECEF] p-2 rounded border border-[#2B2F36] focus:border-[#02C076] outline-none font-bold text-sm text-center"
                />
              </div>

              {/* Instant PnL preview */}
              {closePrice > 0 && (
                <div className="bg-[#0B0E11] p-3 rounded border border-[#2B2F36] flex items-center justify-between text-xs">
                  <span className="text-[#848E9C]">預估淨實現損益:</span>
                  <span
                    className={`font-bold font-mono text-sm ${
                      (closePrice - closeTradeTarget.buyPrice) >= 0 ? 'text-[#F84960]' : 'text-[#02C076]'
                    }`}
                  >
                    {closePrice >= closeTradeTarget.buyPrice ? '+' : ''}
                    {Math.round(
                      (closePrice - closeTradeTarget.buyPrice) *
                        (closeTradeTarget.unitType === 'LOTS' ? closeTradeTarget.lots * 1000 : closeTradeTarget.lots)
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCloseTradeTarget(null)}
                className="px-3 py-1.5 bg-[#2B2F36] text-[#848E9C] hover:text-white rounded transition cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCloseTrade}
                className="px-4 py-1.5 bg-[#02C076] text-black font-bold rounded transition cursor-pointer"
              >
                確認結案賣出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
