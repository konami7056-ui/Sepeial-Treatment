import { SymbolInfo, MarketType, ExchangeType, AssetType } from '../../types/stock';
import { SymbolMaster } from '../symbol/SymbolMaster';

export class SymbolResolver {
  static resolve(input: string): SymbolInfo {
    const raw = input.trim().toUpperCase();
    
    // 1. Check local symbol master
    const local = SymbolMaster.findLocal(raw);
    if (local) {
      return local;
    }

    // 2. Normalize clean symbol
    let cleanSymbol = raw.replace('TWSE:', '').replace('TPEX:', '').replace('NASD:', '');
    if (cleanSymbol.endsWith('.TW')) {
      cleanSymbol = cleanSymbol.replace('.TW', '');
    } else if (cleanSymbol.endsWith('.TWO')) {
      cleanSymbol = cleanSymbol.replace('.TWO', '');
    }

    // 3. Dynamic Rule Detection for Taiwan vs US vs Crypto
    const isPureNumeric = /^\d{4,6}$/.test(cleanSymbol);
    const isTaiwanCode = isPureNumeric || /^\d{4}[A-Z]$/.test(cleanSymbol);

    if (isTaiwanCode) {
      // Determine TWSE vs TPEx vs ESB based on code structure ranges or dynamic heuristics
      let exchange: ExchangeType = 'TWSE';
      let exchangeZh = '台灣上市';

      // General Taiwan Stock Code range patterns (e.g. 66xx, 67xx, 35xx, 64xx often TPEx / ESB)
      const codeNum = parseInt(cleanSymbol.slice(0, 4), 10);
      if (!isNaN(codeNum)) {
        if (codeNum >= 6600 && codeNum <= 6999) {
          exchange = 'TPEx';
          exchangeZh = '台灣上櫃';
          if (codeNum >= 6900 && codeNum <= 6999) {
            exchange = 'ESB';
            exchangeZh = '興櫃';
          }
        } else if (codeNum >= 8000 && codeNum <= 8999) {
          exchange = 'TPEx';
          exchangeZh = '台灣上櫃';
        } else if (codeNum >= 7700 && codeNum <= 7999) {
          exchange = 'ESB';
          exchangeZh = '興櫃';
        }
      }

      const canonicalSymbol = exchange === 'TWSE' ? `${cleanSymbol}.TW` : `${cleanSymbol}.TWO`;
      const isEtf = cleanSymbol.startsWith('00');

      return {
        symbol: cleanSymbol,
        canonicalSymbol,
        name: `股票 ${cleanSymbol}`,
        market: 'TW',
        exchange,
        exchangeNameZh: exchangeZh,
        currency: 'TWD',
        assetType: isEtf ? 'etf' : 'equity',
        status: 'active'
      };
    }

    // US Stock or Index Detection
    const isUsAlpha = /^[A-Z]{1,5}$/.test(cleanSymbol);
    if (isUsAlpha) {
      return {
        symbol: cleanSymbol,
        canonicalSymbol: cleanSymbol,
        name: `${cleanSymbol} Inc.`,
        market: 'US',
        exchange: 'NASDAQ',
        exchangeNameZh: '美股 NASDAQ',
        currency: 'USD',
        assetType: cleanSymbol.length === 3 && (cleanSymbol === 'SPY' || cleanSymbol === 'QQQ') ? 'etf' : 'equity',
        status: 'active'
      };
    }

    // Default Unknown fallback
    return {
      symbol: cleanSymbol,
      canonicalSymbol: cleanSymbol,
      name: cleanSymbol,
      market: 'UNKNOWN',
      exchange: 'UNKNOWN',
      exchangeNameZh: '未知市場',
      currency: 'USD',
      assetType: 'equity',
      status: 'unknown'
    };
  }
}
