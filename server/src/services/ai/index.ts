import { config } from '../../config';
import { AIProvider } from './provider.interface';
import { GeminiProvider } from './gemini.provider';
import { GroqProvider } from './groq.provider';
import logger from '../../utils/logger';

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (providerInstance) return providerInstance;

  const provider = config.ai.provider;
  logger.info(`Initializing AI provider: ${provider}`);

  switch (provider) {
    case 'gemini':
      providerInstance = new GeminiProvider();
      break;
    case 'groq':
      providerInstance = new GroqProvider();
      break;
    default:
      logger.warn(`Unknown AI provider: ${provider}, defaulting to gemini`);
      providerInstance = new GeminiProvider();
  }

  return providerInstance;
}

export function resetProvider(): void {
  providerInstance = null;
}

export { AIProvider } from './provider.interface';
export * from './provider.interface';
