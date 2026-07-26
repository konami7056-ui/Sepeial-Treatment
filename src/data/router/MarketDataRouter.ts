import { DataRequest, RouterResult, ProviderAttempt, ProviderMetadata } from '../../types/router';
import { SymbolResolver } from './SymbolResolver';
import { ProviderRegistry } from '../providers/ProviderRegistry';
import { CustomProvider } from '../providers/CustomProvider';
import { TWSEProvider } from '../providers/TWSEProvider';
import { TPExProvider } from '../providers/TPExProvider';
import { EmergingProvider } from '../providers/EmergingProvider';
import { YahooFinanceProvider } from '../providers/YahooFinanceProvider';
import { FinMindProvider } from '../providers/FinMindProvider';
import { DataValidator } from '../validator/DataValidator';
import { OHLCV } from '../../types/stock';

export class MarketDataRouter {
  static async routeAndFetch(request: DataRequest): Promise<RouterResult> {
    const symbolInfo = SymbolResolver.resolve(request.symbol);
    const attempts: ProviderAttempt[] = [];

    // 1. Check if user uploaded custom file data for this symbol
    const customData = CustomProvider.getCustomData(symbolInfo.symbol);
    if (customData) {
      attempts.push({
        providerId: CustomProvider.metadata.id,
        providerName: CustomProvider.metadata.name,
        status: 'success',
        responseTimeMs: 1,
        timestamp: Date.now()
      });
      const { cleanBars, report } = DataValidator.validate(customData.data);
      return {
        symbolInfo: customData.symbolInfo,
        provider: CustomProvider.metadata,
        data: cleanBars,
        dataQuality: report,
        fallbackUsed: false,
        providerAttempts: attempts
      };
    }

    // 2. Select providers based on market & exchange
    const candidateProviders = this.getCandidateProviders(symbolInfo, request.preferredProvider);

    let finalBars: OHLCV[] = [];
    let selectedProvider: ProviderMetadata = candidateProviders[0];
    let fallbackUsed = false;

    for (let i = 0; i < candidateProviders.length; i++) {
      const p = candidateProviders[i];
      const startMs = Date.now();

      try {
        let rawBars: OHLCV[] = [];
        if (p.id === 'TWSE') {
          rawBars = await TWSEProvider.fetchHistorical(symbolInfo, request.startDate, request.endDate, request.timeframe);
        } else if (p.id === 'TPEx') {
          rawBars = await TPExProvider.fetchHistorical(symbolInfo, request.startDate, request.endDate, request.timeframe);
        } else if (p.id === 'ESB') {
          rawBars = await EmergingProvider.fetchHistorical(symbolInfo, request.startDate, request.endDate, request.timeframe);
        } else if (p.id === 'YahooFinance') {
          rawBars = await YahooFinanceProvider.fetchHistorical(symbolInfo, request.startDate, request.endDate, request.timeframe);
        } else if (p.id === 'FinMind') {
          rawBars = await FinMindProvider.fetchHistorical(symbolInfo, request.startDate, request.endDate, request.timeframe);
        }

        const elapsed = Date.now() - startMs;

        if (rawBars && rawBars.length > 0) {
          attempts.push({
            providerId: p.id,
            providerName: p.name,
            status: 'success',
            responseTimeMs: elapsed,
            timestamp: Date.now()
          });
          finalBars = rawBars;
          selectedProvider = p;
          if (i > 0) fallbackUsed = true;
          break;
        } else {
          attempts.push({
            providerId: p.id,
            providerName: p.name,
            status: 'failed',
            responseTimeMs: elapsed,
            errorMessage: '無 K 線資料或連線問題',
            timestamp: Date.now()
          });
        }
      } catch (err: any) {
        attempts.push({
          providerId: p.id,
          providerName: p.name,
          status: 'failed',
          responseTimeMs: Date.now() - startMs,
          errorMessage: err.message || '連線失敗',
          timestamp: Date.now()
        });
      }
    }

    // Validate and score data quality
    const { cleanBars, report } = DataValidator.validate(finalBars);

    return {
      symbolInfo,
      provider: selectedProvider,
      data: cleanBars,
      dataQuality: report,
      fallbackUsed,
      providerAttempts: attempts
    };
  }

  private static getCandidateProviders(symbolInfo: any, preferredProviderId?: string): ProviderMetadata[] {
    const all = ProviderRegistry.getAll();
    if (preferredProviderId && preferredProviderId !== 'AUTO') {
      const pref = all.find(p => p.id === preferredProviderId);
      if (pref) {
        return [pref, ...all.filter(p => p.id !== preferredProviderId)];
      }
    }

    // Auto-routing logic based on Exchange
    if (symbolInfo.market === 'TW') {
      if (symbolInfo.exchange === 'TWSE') {
        return [TWSEProvider.metadata, FinMindProvider.metadata, YahooFinanceProvider.metadata];
      } else if (symbolInfo.exchange === 'TPEx') {
        return [TPExProvider.metadata, FinMindProvider.metadata, YahooFinanceProvider.metadata];
      } else if (symbolInfo.exchange === 'ESB') {
        return [EmergingProvider.metadata, YahooFinanceProvider.metadata, FinMindProvider.metadata];
      }
    } else if (symbolInfo.market === 'US') {
      return [YahooFinanceProvider.metadata];
    }

    return [YahooFinanceProvider.metadata, TWSEProvider.metadata, FinMindProvider.metadata];
  }
}
