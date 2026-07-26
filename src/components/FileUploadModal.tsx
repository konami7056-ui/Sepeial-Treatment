import React, { useState } from 'react';
import { FileParser } from '../data/parser/FileParser';
import { CustomProvider } from '../data/providers/CustomProvider';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileParsed: (symbol: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { symbolInfo, bars } = await FileParser.parseFile(file);

      if (!bars || bars.length === 0) {
        throw new Error('解析檔案失敗，未找到有效的日期、開高低收與成交量數據。');
      }

      CustomProvider.setCustomData(symbolInfo, bars);
      setSuccessMsg(`成功匯入 ${file.name}！共解析 ${bars.length} 根 K 線棒。代號: ${symbolInfo.symbol}`);
      setIsProcessing(false);

      setTimeout(() => {
        onFileParsed(symbolInfo.symbol);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || '檔案解析出錯，請確認格式含 Date, Open, High, Low, Close, Volume 欄位');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161A1E] border border-[#2B2F36] rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#848E9C] hover:text-[#EAECEF] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#EAECEF]">匯入歷史 K 線資料</h3>
            <p className="text-xs text-[#848E9C]">支援 *.txt, *.csv, *.xlsx (SheetJS 解析引擎)</p>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded p-8 text-center transition flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#38bdf8] bg-[#38bdf8]/10'
              : 'border-[#2B2F36] bg-[#0B0E11] hover:border-[#848E9C]'
          }`}
        >
          <Upload className="w-10 h-10 text-[#848E9C] mb-3" />
          <p className="text-sm font-semibold text-[#EAECEF] mb-1">
            拖曳 TXT / CSV / Excel 檔案至此處
          </p>
          <p className="text-xs text-[#848E9C] mb-4">或點擊下方按鈕選擇本機檔案</p>

          <label className="bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold px-4 py-2 rounded text-xs cursor-pointer transition font-mono">
            <span>選擇檔案 (Browse File)</span>
            <input
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={e => handleFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>

        {/* Status Notification */}
        {isProcessing && (
          <div className="mt-4 p-3 rounded bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] text-xs text-center font-medium animate-pulse font-mono">
            正在解析 K 線與正規化 OHLCV Data Model...
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] text-xs flex items-center space-x-2 font-medium font-mono">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded bg-[#F84960]/10 border border-[#F84960]/30 text-[#F84960] text-xs flex items-center space-x-2 font-medium font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-4 text-[11px] text-[#848E9C] border-t border-[#2B2F36] pt-3 font-mono">
          <span className="font-semibold text-[#EAECEF] block mb-1">欄位格式範例說明:</span>
          <code>Date, Open, High, Low, Close, Volume</code> (例如: 2025-01-10, 1050, 1065, 1045, 1060, 35000)
        </div>
      </div>
    </div>
  );
};
