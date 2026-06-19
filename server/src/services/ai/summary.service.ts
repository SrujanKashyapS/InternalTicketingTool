import { getAIProvider } from './index';
import { SummaryResult } from './provider.interface';
import logger from '../../utils/logger';

export class SummaryService {
  async summarize(
    ticketTitle: string,
    ticketDescription: string,
    comments: { content: string; authorName: string; createdAt: Date }[]
  ): Promise<SummaryResult> {
    const provider = getAIProvider();

    const commentsText = comments.length > 0
      ? `\n\nComments:\n${comments.map(c => `[${new Date(c.createdAt).toLocaleDateString()}] ${c.authorName}: ${c.content}`).join('\n')}`
      : '';

    const prompt = `Summarize this support ticket comprehensively.

Title: ${ticketTitle}
Description: ${ticketDescription}${commentsText}

Return a JSON object with:
- issue: brief description of the core issue
- discussion: summary of the discussion and key points raised
- actionsTaken: summary of actions taken so far
- currentState: current state of the ticket
- summary: a concise executive summary (2-3 sentences)`;

    const systemPrompt = 'You are an expert at summarizing support tickets clearly and concisely.';

    try {
      return await provider.generateJSON<SummaryResult>(prompt, systemPrompt);
    } catch (error) {
      logger.error('Summary generation failed:', error);
      return {
        issue: ticketTitle,
        discussion: 'Summary generation in progress.',
        actionsTaken: 'Pending review.',
        currentState: 'Under review.',
        summary: `Ticket: ${ticketTitle} - ${ticketDescription.substring(0, 100)}...`,
      };
    }
  }
}

export const summaryService = new SummaryService();
