import { ProviderMetadata } from '../../types/router';
import { TWSEProvider } from './TWSEProvider';
import { TPExProvider } from './TPExProvider';
import { EmergingProvider } from './EmergingProvider';
import { YahooFinanceProvider } from './YahooFinanceProvider';
import { FinMindProvider } from './FinMindProvider';
import { CustomProvider } from './CustomProvider';

export class ProviderRegistry {
  private static providers: ProviderMetadata[] = [
    TWSEProvider.metadata,
    TPExProvider.metadata,
    EmergingProvider.metadata,
    YahooFinanceProvider.metadata,
    FinMindProvider.metadata,
    CustomProvider.metadata
  ];

  static getAll(): ProviderMetadata[] {
    return this.providers;
  }

  static getById(id: string): ProviderMetadata | undefined {
    return this.providers.find(p => p.id === id);
  }
}
