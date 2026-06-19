import { getAIProvider } from './index';
import { RootCauseResult } from './provider.interface';
import logger from '../../utils/logger';

export class RootCauseService {
  async analyze(
    ticketTitle: string,
    ticketDescription: string,
    category: string,
    comments: { content: string }[]
  ): Promise<RootCauseResult> {
    const provider = getAIProvider();

    const commentsText = comments.length > 0
      ? `\n\nComments:\n${comments.map(c => c.content).join('\n')}`
      : '';

    const prompt = `Perform root cause analysis on this support ticket.

Title: ${ticketTitle}
Description: ${ticketDescription}
Category: ${category}${commentsText}

Return a JSON object with:
- probableCause: the most probable root cause of the issue
- recommendedFix: detailed recommended fix or resolution steps
- confidence: a number from 0 to 1 indicating confidence in the analysis`;

    const systemPrompt = 'You are an expert systems analyst specializing in root cause analysis for enterprise support issues.';

    try {
      const result = await provider.generateJSON<RootCauseResult>(prompt, systemPrompt);
      return {
        probableCause: result.probableCause || 'Unable to determine',
        recommendedFix: result.recommendedFix || 'Further investigation needed',
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
      };
    } catch (error) {
      logger.error('Root cause analysis failed:', error);
      return {
        probableCause: 'Analysis pending - requires further investigation',
        recommendedFix: 'Escalate to senior engineer for detailed analysis',
        confidence: 0.3,
      };
    }
  }
}

export const rootCauseService = new RootCauseService();
