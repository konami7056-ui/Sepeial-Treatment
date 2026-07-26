import { SymbolInfo } from '../../types/stock';

export const POPULAR_SYMBOLS_DB: SymbolInfo[] = [
  // Taiwan TWSE 上市 權值股/熱門股
  { symbol: '2330', canonicalSymbol: '2330.TW', name: '台積電', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },
  { symbol: '2317', canonicalSymbol: '2317.TW', name: '鴻海', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '其他電子' },
  { symbol: '2454', canonicalSymbol: '2454.TW', name: '聯發科', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },
  { symbol: '2308', canonicalSymbol: '2308.TW', name: '台達電', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '電子零組件' },
  { symbol: '2382', canonicalSymbol: '2382.TW', name: '廣達', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '電腦及週邊' },
  { symbol: '2603', canonicalSymbol: '2603.TW', name: '長榮', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '航運業' },
  { symbol: '3231', canonicalSymbol: '3231.TW', name: '緯創', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '電腦及週邊' },
  { symbol: '2357', canonicalSymbol: '2357.TW', name: '華碩', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '電腦及週邊' },
  { symbol: '2379', canonicalSymbol: '2379.TW', name: '瑞昱', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },
  { symbol: '3008', canonicalSymbol: '3008.TW', name: '大立光', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '光電業' },
  { symbol: '2881', canonicalSymbol: '2881.TW', name: '富邦金', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '金融保險' },
  { symbol: '2882', canonicalSymbol: '2882.TW', name: '國泰金', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '金融保險' },
  { symbol: '2886', canonicalSymbol: '2886.TW', name: '兆豐金', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '金融保險' },
  { symbol: '2891', canonicalSymbol: '2891.TW', name: '中信金', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '金融保險' },
  { symbol: '1101', canonicalSymbol: '1101.TW', name: '台泥', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '水泥工業' },
  { symbol: '2002', canonicalSymbol: '2002.TW', name: '中鋼', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '鋼鐵工業' },
  { symbol: '2609', canonicalSymbol: '2609.TW', name: '陽明', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '航運業' },
  { symbol: '2615', canonicalSymbol: '2615.TW', name: '萬海', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '航運業' },
  { symbol: '3034', canonicalSymbol: '3034.TW', name: '聯詠', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },

  // Taiwan ETFs
  { symbol: '0050', canonicalSymbol: '0050.TW', name: '元大台灣50', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'etf', status: 'active', sector: 'ETF' },
  { symbol: '0056', canonicalSymbol: '0056.TW', name: '元大高股息', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'etf', status: 'active', sector: 'ETF' },
  { symbol: '00878', canonicalSymbol: '00878.TW', name: '國泰永續高股息', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'etf', status: 'active', sector: 'ETF' },
  { symbol: '00919', canonicalSymbol: '00919.TW', name: '群益台灣精選高息', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'etf', status: 'active', sector: 'ETF' },
  { symbol: '00929', canonicalSymbol: '00929.TW', name: '復華台灣科技優息', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'etf', status: 'active', sector: 'ETF' },
  { symbol: '00940', canonicalSymbol: '00940.TW', name: '元大台灣價值高息', market: 'TW', exchange: 'TWSE', exchangeNameZh: '台灣上市', currency: 'TWD', assetType: 'etf', status: 'active', sector: 'ETF' },
  
  // Taiwan TPEx 上櫃
  { symbol: '6696', canonicalSymbol: '6696.TWO', name: '仁新', market: 'TW', exchange: 'TPEx', exchangeNameZh: '台灣上櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '生技醫療' },
  { symbol: '6748', canonicalSymbol: '6748.TWO', name: '鎬鋼', market: 'TW', exchange: 'TPEx', exchangeNameZh: '台灣上櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '鋼鐵' },
  { symbol: '6488', canonicalSymbol: '6488.TWO', name: '環球晶', market: 'TW', exchange: 'TPEx', exchangeNameZh: '台灣上櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },
  { symbol: '3529', canonicalSymbol: '3529.TWO', name: '力旺', market: 'TW', exchange: 'TPEx', exchangeNameZh: '台灣上櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },
  { symbol: '8069', canonicalSymbol: '8069.TWO', name: '元太', market: 'TW', exchange: 'TPEx', exchangeNameZh: '台灣上櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '光電業' },
  { symbol: '8299', canonicalSymbol: '8299.TWO', name: '群聯', market: 'TW', exchange: 'TPEx', exchangeNameZh: '台灣上櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '半導體' },

  // Taiwan ESB 興櫃
  { symbol: '6919', canonicalSymbol: '6919.TWO', name: '康霈', market: 'TW', exchange: 'ESB', exchangeNameZh: '興櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '生技醫療' },
  { symbol: '7701', canonicalSymbol: '7701.TWO', name: '熱門興櫃A', market: 'TW', exchange: 'ESB', exchangeNameZh: '興櫃', currency: 'TWD', assetType: 'equity', status: 'active', sector: '生技創新' },

  // US Markets
  { symbol: 'AAPL', canonicalSymbol: 'AAPL', name: 'Apple Inc.', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Technology' },
  { symbol: 'NVDA', canonicalSymbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Semiconductors' },
  { symbol: 'TSLA', canonicalSymbol: 'TSLA', name: 'Tesla Inc.', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Automotive' },
  { symbol: 'MSFT', canonicalSymbol: 'MSFT', name: 'Microsoft Corp.', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Software' },
  { symbol: 'AMZN', canonicalSymbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'E-Commerce' },
  { symbol: 'GOOGL', canonicalSymbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Interactive Media' },
  { symbol: 'META', canonicalSymbol: 'META', name: 'Meta Platforms Inc.', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Interactive Media' },
  { symbol: 'AMD', canonicalSymbol: 'AMD', name: 'Advanced Micro Devices', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'equity', status: 'active', sector: 'Semiconductors' },
  { symbol: 'SPY', canonicalSymbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', market: 'US', exchange: 'NYSE', exchangeNameZh: '美股 NYSE', currency: 'USD', assetType: 'etf', status: 'active', sector: 'ETF' },
  { symbol: 'QQQ', canonicalSymbol: 'QQQ', name: 'Invesco QQQ Trust', market: 'US', exchange: 'NASDAQ', exchangeNameZh: '美股 NASDAQ', currency: 'USD', assetType: 'etf', status: 'active', sector: 'ETF' }
];

export class SymbolMaster {
  private static symbolMap = new Map<string, SymbolInfo>();

  static initialize() {
    POPULAR_SYMBOLS_DB.forEach(s => {
      this.symbolMap.set(s.symbol.toUpperCase(), s);
      this.symbolMap.set(s.canonicalSymbol.toUpperCase(), s);
    });
  }

  static findLocal(inputSymbol: string): SymbolInfo | null {
    if (this.symbolMap.size === 0) {
      this.initialize();
    }
    const clean = inputSymbol.trim().toUpperCase().replace('.TW', '').replace('.TWO', '');
    if (this.symbolMap.has(clean)) {
      return this.symbolMap.get(clean)!;
    }
    return null;
  }
}
