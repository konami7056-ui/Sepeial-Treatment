import React from 'react';

interface PresetStocksBarProps {
  onSelectPreset: (symbol: string) => void;
}

export const PresetStocksBar: React.FC<PresetStocksBarProps> = ({ onSelectPreset }) => {
  const presets = [
    { symbol: '2330', name: '台積電', tag: 'TWSE 上市' },
    { symbol: '2317', name: '鴻海', tag: 'TWSE 上市' },
    { symbol: '0050', name: '元大台灣50', tag: 'ETF' },
    { symbol: '6696', name: '仁新', tag: 'TPEx 上櫃' },
    { symbol: '6748', name: '鎬鋼', tag: 'TPEx 上櫃' },
    { symbol: '6919', name: '康霈', tag: '興櫃 ESB' },
    { symbol: 'AAPL', name: 'Apple', tag: '美股' },
    { symbol: 'NVDA', name: 'NVIDIA', tag: '美股' },
    { symbol: 'TSLA', name: 'Tesla', tag: '美股' },
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-[11px] font-semibold text-[#848E9C] whitespace-nowrap font-mono uppercase">熱門標的:</span>
      {presets.map(item => (
        <button
          key={item.symbol}
          onClick={() => onSelectPreset(item.symbol)}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#161A1E] border border-[#2B2F36] hover:border-[#323942] hover:bg-[#2B3139] text-xs text-[#EAECEF] transition whitespace-nowrap cursor-pointer shadow-xs"
        >
          <span className="font-mono font-bold text-[#38bdf8]">{item.symbol}</span>
          <span className="text-[#EAECEF] font-medium">{item.name}</span>
          <span className="text-[9px] bg-[#0B0E11] text-[#848E9C] px-1 py-0.2 rounded border border-[#2B2F36] font-mono">
            {item.tag}
          </span>
        </button>
      ))}
    </div>
  );
};
