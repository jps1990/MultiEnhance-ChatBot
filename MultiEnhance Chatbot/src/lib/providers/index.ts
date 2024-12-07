import { XAIProvider } from './xai';

export function getProvider(provider: Provider, apiKey: string) {
  switch (provider) {
    case "xai":
      return new XAIProvider(apiKey);
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
} 