import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client Server-side ONLY
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: AI Quant Research Assistant
  app.post('/api/ai/quant-research', async (req, res) => {
    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY 未設定，無法使用 AI 量化研究助手',
        });
      }

      const { symbolInfo, backtestResult, dataQuality, customPrompt } = req.body;

      const promptText = `你是一位資深的 Wall Street 量化交易與系統化研究工程師 (Quant Research Analyst)。
請針對以下股票海龜交易策略 (Turtle Trading Strategy) 的實際歷史回測數據，進行嚴謹客觀的技術分析與量化評估報告：

標的資訊: ${symbolInfo?.name} (${symbolInfo?.symbol}, 市場: ${symbolInfo?.exchangeNameZh}, 幣別: ${symbolInfo?.currency})
資料品質評分: ${dataQuality?.score}/100 (K線筆數: ${dataQuality?.totalBars}, 區間: ${dataQuality?.startDate} ~ ${dataQuality?.endDate})

核心回測績效數據:
- 總報酬率 (Total Return): ${backtestResult?.metrics?.totalReturn?.toFixed(2)}%
- 年化報酬率 (CAGR): ${backtestResult?.metrics?.cagr?.toFixed(2)}%
- 最大歷史回撤 (Max Drawdown): ${backtestResult?.metrics?.maxDrawdown?.toFixed(2)}%
- 夏普比率 (Sharpe Ratio): ${backtestResult?.metrics?.sharpeRatio?.toFixed(2)}
- 索提諾比率 (Sortino Ratio): ${backtestResult?.metrics?.sortinoRatio?.toFixed(2)}
- 期望值 (Expectancy): $${backtestResult?.metrics?.expectancy?.toFixed(2)}
- 勝率 (Win Rate): ${backtestResult?.metrics?.winRate?.toFixed(2)}%
- 獲利因子 (Profit Factor): ${backtestResult?.metrics?.profitFactor?.toFixed(2)}
- 總交易次數: ${backtestResult?.metrics?.tradeCount} (勝: ${backtestResult?.metrics?.winningTrades}, 敗: ${backtestResult?.metrics?.losingTrades})
- 平均持倉天數: ${backtestResult?.metrics?.averageHoldingDays?.toFixed(1)} 天
- 支付總交易成本: $${backtestResult?.metrics?.totalFeesPaid?.toFixed(0)}

使用者補充疑問: ${customPrompt || '請綜合分析此海龜策略的強項、弱點、過度擬合 (Overfitting) 風險與改進建議。'}

請以專業 JSON 格式回應，包含以下結構：
{
  "summary": "一段專業精煉的量化總結",
  "keyStrengths": ["強項1", "強項2", "強項3"],
  "keyRisks": ["主要風險1", "主要風險2"],
  "regimeAnalysis": {
    "bullMarketPerformance": "多頭市場表現分析",
    "bearMarketPerformance": "空頭市場表現分析",
    "sidewayMarketPerformance": "盤整市場表現分析",
    "highVolatilityPerformance": "高波動市場表現分析"
  },
  "overfittingRiskAssessment": {
    "level": "LOW | MEDIUM | HIGH",
    "explanation": "對樣本外與過度擬合風險的評估"
  },
  "parameterStabilityNote": "關於海龜通道與 ATR 參數穩定度的說明",
  "optimizationSuggestions": ["建議1", "建議2", "建議3"],
  "disclaimer": "本報告由 AI 量化助手基於歷史數據生成，不構成任何個人投資建議。"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const jsonString = response.text || '{}';
      const parsedReport = JSON.parse(jsonString);

      return res.json(parsedReport);
    } catch (error: any) {
      console.error('AI Quant Research Error:', error);
      return res.status(500).json({ error: error.message || 'AI 分析生成失敗' });
    }
  });

  // API Route: AI Market Data Research Agent
  app.post('/api/ai/data-research', async (req, res) => {
    try {
      const ai = getAiClient();
      const { symbol } = req.body;

      if (!ai) {
        return res.json({
          symbol,
          market: 'TW',
          exchange: 'TWSE',
          companyName: `股票 ${symbol}`,
          searchNote: 'AI Key 未設置，使用預設市場路由決策 Engine',
        });
      }

      const promptText = `請查詢股票或資產代號 "${symbol}" 的公開市場資訊。
請回答以下標準 JSON 格式：
{
  "symbol": "${symbol}",
  "companyName": "公司或資產中文/英文名稱",
  "market": "TW 或 US 或 CRYPTO",
  "exchange": "TWSE 或 TPEx 或 ESB 或 NASDAQ 或 NYSE",
  "exchangeNameZh": "台灣上市 或 台灣上櫃 或 興櫃 或 美股",
  "currency": "TWD 或 USD",
  "assetType": "equity 或 etf 或 index",
  "recommendedProvider": "TWSE 或 TPEx 或 ESB 或 YahooFinance",
  "searchNote": "此標的的市場定位簡述"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const jsonString = response.text || '{}';
      return res.json(JSON.parse(jsonString));
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'AI 資料辨識失敗' });
    }
  });

  // API Route: Real Stock History Endpoint (FinMind + Yahoo Finance)
  app.get('/api/stock/history', async (req, res) => {
    try {
      const symbolParam = (req.query.symbol as string || '2330').trim().toUpperCase();
      const timeframe = (req.query.timeframe as string || '1D').trim();
      const cleanSymbol = symbolParam.replace('.TW', '').replace('.TWO', '').replace('TWSE:', '').replace('TPEX:', '');

      const isNumeric = /^\d{4,6}$/.test(cleanSymbol);

      // Strategy A: FinMind API for Taiwan daily stock data
      if (isNumeric && (timeframe === '1D' || timeframe === '1W' || timeframe === '1M')) {
        try {
          const fmUrl = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${cleanSymbol}&start_date=2021-01-01`;
          const fmResp = await fetch(fmUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (fmResp.ok) {
            const fmData = await fmResp.json();
            if (fmData && Array.isArray(fmData.data) && fmData.data.length > 0) {
              const bars = fmData.data.map((item: any) => ({
                timestamp: new Date(item.date).getTime(),
                date: item.date,
                open: item.open,
                high: item.max,
                low: item.min,
                close: item.close,
                volume: item.Trading_Volume || 0
              })).filter((b: any) => !isNaN(b.close) && b.close > 0);

              if (bars.length > 0) {
                return res.json({ symbol: cleanSymbol, provider: 'FinMind', data: bars });
              }
            }
          }
        } catch (fmErr) {
          console.warn('FinMind fetch warning:', fmErr);
        }
      }

      // Strategy B: Yahoo Finance API for US stocks, intraday, or TW fallback
      let yahooSymbol = cleanSymbol;
      if (isNumeric) {
        const codeNum = parseInt(cleanSymbol.slice(0, 4), 10);
        const isTpEx = (!isNaN(codeNum) && ((codeNum >= 6600 && codeNum <= 6999) || (codeNum >= 8000 && codeNum <= 8999) || (codeNum >= 7700 && codeNum <= 7999)));
        yahooSymbol = isTpEx ? `${cleanSymbol}.TWO` : `${cleanSymbol}.TW`;
      }

      let interval = '1d';
      let range = '2y';
      if (timeframe === '1W') { interval = '1wk'; range = '5y'; }
      else if (timeframe === '1M') { interval = '1mo'; range = '10y'; }
      else if (timeframe === '60m') { interval = '60m'; range = '2mo'; }
      else if (timeframe === '30m') { interval = '30m'; range = '1mo'; }
      else if (timeframe === '15m') { interval = '15m'; range = '1mo'; }
      else if (timeframe === '5m') { interval = '5m'; range = '1mo'; }

      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;
      const yResp = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });

      if (yResp.ok) {
        const yData = await yResp.json();
        const result = yData.chart?.result?.[0];
        if (result && result.timestamp && result.indicators?.quote?.[0]) {
          const timestamps: number[] = result.timestamp;
          const quote = result.indicators.quote[0];
          const bars: any[] = [];

          for (let i = 0; i < timestamps.length; i++) {
            const o = quote.open[i];
            const h = quote.high[i];
            const l = quote.low[i];
            const c = quote.close[i];
            const v = quote.volume[i] || 0;

            if (o !== null && h !== null && l !== null && c !== null && !isNaN(c)) {
              const d = new Date(timestamps[i] * 1000);
              const dateStr = d.toISOString().split('T')[0];
              bars.push({
                timestamp: timestamps[i] * 1000,
                date: dateStr,
                open: Math.round(o * 100) / 100,
                high: Math.round(h * 100) / 100,
                low: Math.round(l * 100) / 100,
                close: Math.round(c * 100) / 100,
                volume: Math.round(v)
              });
            }
          }

          if (bars.length > 0) {
            return res.json({ symbol: cleanSymbol, provider: 'YahooFinance', data: bars });
          }
        }
      }

      // If Yahoo with suffix failed for Taiwan stock, try alternative suffix (.TW <-> .TWO)
      if (isNumeric) {
        const altSymbol = yahooSymbol.endsWith('.TW') ? `${cleanSymbol}.TWO` : `${cleanSymbol}.TW`;
        const altUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${altSymbol}?interval=${interval}&range=${range}`;
        const altResp = await fetch(altUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        if (altResp.ok) {
          const altData = await altResp.json();
          const result = altData.chart?.result?.[0];
          if (result && result.timestamp && result.indicators?.quote?.[0]) {
            const timestamps: number[] = result.timestamp;
            const quote = result.indicators.quote[0];
            const bars: any[] = [];

            for (let i = 0; i < timestamps.length; i++) {
              const o = quote.open[i];
              const h = quote.high[i];
              const l = quote.low[i];
              const c = quote.close[i];
              const v = quote.volume[i] || 0;

              if (o !== null && h !== null && l !== null && c !== null && !isNaN(c)) {
                const d = new Date(timestamps[i] * 1000);
                const dateStr = d.toISOString().split('T')[0];
                bars.push({
                  timestamp: timestamps[i] * 1000,
                  date: dateStr,
                  open: Math.round(o * 100) / 100,
                  high: Math.round(h * 100) / 100,
                  low: Math.round(l * 100) / 100,
                  close: Math.round(c * 100) / 100,
                  volume: Math.round(v)
                });
              }
            }

            if (bars.length > 0) {
              return res.json({ symbol: cleanSymbol, provider: 'YahooFinance', data: bars });
            }
          }
        }
      }

      return res.status(404).json({ error: '無法找到此股票之歷史數據' });
    } catch (err: any) {
      console.error('/api/stock/history error:', err);
      return res.status(500).json({ error: err.message || '無法取得股票數據' });
    }
  });

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for dev or Static file server for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
