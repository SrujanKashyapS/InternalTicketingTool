import { getAIProvider } from './index';
import { CategorizationResult } from './provider.interface';
import logger from '../../utils/logger';

export class CategorizationService {
  async categorize(title: string, description: string): Promise<CategorizationResult> {
    const provider = getAIProvider();

    const prompt = `Analyze this support ticket and categorize it.

Title: ${title}
Description: ${description}

Return a JSON object with:
- category: one of "IT", "HR", "PAYROLL", "FACILITIES", "SECURITY", "OPERATIONS", "OTHER"
- urgencyScore: a number from 1 to 10 (10 being most urgent)
- sentiment: one of "positive", "neutral", "negative", "frustrated", "angry"
- confidence: a number from 0 to 1 indicating your confidence in the categorization`;

    const systemPrompt = 'You are an expert support ticket classifier. Analyze tickets and provide accurate categorization.';

    try {
      const result = await provider.generateJSON<CategorizationResult>(prompt, systemPrompt);
      return {
        category: result.category || 'OTHER',
        urgencyScore: Math.min(10, Math.max(1, result.urgencyScore || 5)),
        sentiment: result.sentiment || 'neutral',
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
      };
    } catch (error) {
      logger.error('Categorization failed:', error);
      return {
        category: 'OTHER',
        urgencyScore: 5,
        sentiment: 'neutral',
        confidence: 0.3,
      };
    }
  }
}

export const categorizationService = new CategorizationService();
