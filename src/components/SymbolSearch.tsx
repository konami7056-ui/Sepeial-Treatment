import React, { useState } from 'react';
import { Search, Globe, RefreshCw } from 'lucide-react';
import { Timeframe } from '../types/stock';

interface SymbolSearchProps {
  onSearch: (symbol: string, timeframe: Timeframe, providerId: string) => void;
  isLoading: boolean;
  currentTimeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  currentProvider: string;
}

export const SymbolSearch: React.FC<SymbolSearchProps> = ({
  onSearch,
  isLoading,
  currentTimeframe,
  onTimeframeChange,
  currentProvider
}) => {
  const [inputSymbol, setInputSymbol] = useState('2330');
  const [selectedProvider, setSelectedProvider] = useState('AUTO');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      onSearch(inputSymbol.trim(), currentTimeframe, selectedProvider);
    }
  };

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: '1D', label: '日K' },
    { id: '1W', label: '週K' },
    { id: '1M', label: '月K' },
    { id: '60m', label: '60分' },
    { id: '30m', label: '30分' },
    { id: '15m', label: '15分' },
    { id: '5m', label: '5分' },
  ];

  return (
    <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 w-full md:w-auto flex-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-[#848E9C] absolute left-3 top-2.5" />
          <input
            type="text"
            value={inputSymbol}
            onChange={e => setInputSymbol(e.target.value)}
            placeholder="輸入股票代號 (如 2330, 6696, 6919, AAPL)"
            className="w-full bg-[#0B0E11] border border-[#2B2F36] rounded pl-9 pr-3 py-1.5 text-xs text-[#EAECEF] placeholder-[#848E9C] focus:outline-none focus:border-[#38bdf8] font-mono"
          />
        </div>

        {/* Provider Selector */}
        <select
          value={selectedProvider}
          onChange={e => setSelectedProvider(e.target.value)}
          className="bg-[#0B0E11] border border-[#2B2F36] rounded px-2.5 py-1.5 text-xs text-[#EAECEF] focus:outline-none focus:border-[#38bdf8] font-mono cursor-pointer"
        >
          <option value="AUTO">Data Source: Auto (Router)</option>
          <option value="TWSE">TWSE (台灣上市)</option>
          <option value="TPEx">TPEx (台灣上櫃)</option>
          <option value="ESB">ESB (興櫃)</option>
          <option value="YahooFinance">Yahoo Finance (國際/美股)</option>
          <option value="FinMind">FinMind API</option>
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold px-4 py-1.5 rounded text-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? '載入中...' : '搜尋 / ROUTE'}</span>
        </button>
      </form>

      {/* Timeframe Bar */}
      <div className="flex items-center space-x-1 bg-[#0B0E11] p-1 rounded border border-[#2B2F36]">
        <span className="text-[10px] text-[#848E9C] px-2 font-mono uppercase">周期:</span>
        {timeframes.map(tf => (
          <button
            key={tf.id}
            onClick={() => {
              onTimeframeChange(tf.id);
              onSearch(inputSymbol, tf.id, selectedProvider);
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer font-mono ${
              currentTimeframe === tf.id
                ? 'bg-[#38bdf8] text-black shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
};
