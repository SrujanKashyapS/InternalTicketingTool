import { getAIProvider } from './index';
import { AIResponseResult } from './provider.interface';
import logger from '../../utils/logger';

export class ResponseService {
  async generateResponse(
    ticketTitle: string,
    ticketDescription: string,
    comments: { content: string; authorName: string }[],
    knowledgeContext?: string
  ): Promise<AIResponseResult> {
    const provider = getAIProvider();

    const commentsText = comments.length > 0
      ? `\n\nConversation History:\n${comments.map(c => `${c.authorName}: ${c.content}`).join('\n')}`
      : '';

    const contextText = knowledgeContext
      ? `\n\nRelevant Knowledge Base Context:\n${knowledgeContext}`
      : '';

    const prompt = `Generate a professional support response for this ticket.

Title: ${ticketTitle}
Description: ${ticketDescription}${commentsText}${contextText}

Return a JSON object with:
- response: a professional, empathetic response addressing the issue
- troubleshootingSteps: an array of step-by-step troubleshooting instructions
- actionItems: an array of action items for the support team
- nextSteps: an array of next steps for the employee`;

    const systemPrompt = 'You are an expert IT support agent. Generate helpful, professional, and empathetic responses.';

    try {
      return await provider.generateJSON<AIResponseResult>(prompt, systemPrompt);
    } catch (error) {
      logger.error('Response generation failed:', error);
      return {
        response: 'Thank you for reaching out. Our team is reviewing your ticket and will provide assistance shortly.',
        troubleshootingSteps: ['Our team is investigating the issue'],
        actionItems: ['Review ticket details', 'Investigate root cause'],
        nextSteps: ['We will update you with our findings'],
      };
    }
  }
}

export const responseService = new ResponseService();
