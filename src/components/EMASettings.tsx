import React from 'react';

export const DEFAULT_EMA_PERIODS = [17, 45, 117, 189, 305, 494, 799, 1292];

export const EMA_COLORS = [
  { name: 'EMA 1', color: '#38bdf8', bg: 'bg-[#38bdf8]' },
  { name: 'EMA 2', color: '#fbbf24', bg: 'bg-[#fbbf24]' },
  { name: 'EMA 3', color: '#a855f7', bg: 'bg-[#a855f7]' },
  { name: 'EMA 4', color: '#ec4899', bg: 'bg-[#ec4899]' },
  { name: 'EMA 5', color: '#f97316', bg: 'bg-[#f97316]' },
  { name: 'EMA 6', color: '#10b981', bg: 'bg-[#10b981]' },
  { name: 'EMA 7', color: '#f43f5e', bg: 'bg-[#f43f5e]' },
  { name: 'EMA 8', color: '#6366f1', bg: 'bg-[#6366f1]' },
];

interface EMASettingsProps {
  emaPeriods: number[];
  onChangeEmaPeriods: (newPeriods: number[]) => void;
}

export const EMASettings: React.FC<EMASettingsProps> = ({
  emaPeriods,
  onChangeEmaPeriods
}) => {
  const handlePeriodChange = (index: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val < 1) return;
    const updated = [...emaPeriods];
    updated[index] = val;
    onChangeEmaPeriods(updated);
  };

  const handleReset = () => {
    onChangeEmaPeriods([...DEFAULT_EMA_PERIODS]);
  };

  return (
    <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg p-3 text-xs font-mono shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#2B2F36]">
        <div className="flex items-center space-x-2 text-[#EAECEF] font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] inline-block" />
          <span>EMA 指數移動平均線自由參數設定 (8 條均線)</span>
        </div>
        <button
          onClick={handleReset}
          className="px-2.5 py-1 rounded bg-[#2B2F36] hover:bg-[#363C44] text-[#848E9C] hover:text-white text-[11px] transition cursor-pointer border border-[#363C44]"
        >
          重設預設值 (17, 45, 117, 189, 305, 494, 799, 1292)
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {EMA_COLORS.map((item, idx) => {
          const currentVal = emaPeriods[idx] ?? DEFAULT_EMA_PERIODS[idx];
          return (
            <div key={idx} className="bg-[#0B0E11] p-2 rounded border border-[#2B2F36] flex flex-col gap-1.5 hover:border-[#363C44] transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#848E9C] font-semibold">{item.name}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              </div>
              <input
                type="number"
                min="1"
                max="5000"
                value={currentVal}
                onChange={e => handlePeriodChange(idx, e.target.value)}
                className="w-full bg-[#1E2329] text-[#EAECEF] px-2 py-1 rounded border border-[#2B2F36] focus:border-[#38bdf8] outline-none text-xs text-center font-bold font-mono"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
