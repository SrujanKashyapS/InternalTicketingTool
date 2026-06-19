import { getAIProvider } from './index';
import logger from '../../utils/logger';

export class CopilotService {
  async execute(action: string, input: string, context?: string): Promise<string> {
    const provider = getAIProvider();
    const contextText = context ? `\n\nContext:\n${context}` : '';

    const prompts: Record<string, { system: string; user: string }> = {
      summarize: {
        system: 'You are a concise summarizer for support tickets.',
        user: `Summarize the following:\n\n${input}${contextText}`,
      },
      generate_reply: {
        system: 'You are a professional support agent. Write helpful, empathetic replies.',
        user: `Generate a professional reply to this support ticket:\n\n${input}${contextText}`,
      },
      rewrite: {
        system: 'You are an expert business writer. Rewrite text to be more professional.',
        user: `Rewrite the following professionally:\n\n${input}`,
      },
      simplify: {
        system: 'You simplify complex technical content into easy-to-understand language.',
        user: `Simplify the following for a non-technical audience:\n\n${input}`,
      },
      action_plan: {
        system: 'You create detailed action plans for resolving support issues.',
        user: `Create a detailed action plan to resolve this issue:\n\n${input}${contextText}`,
      },
      checklist: {
        system: 'You create comprehensive checklists for support issue resolution.',
        user: `Create a checklist for resolving this issue:\n\n${input}${contextText}\n\nFormat as a numbered list.`,
      },
      recommend_assignment: {
        system: 'You recommend the best team or person to handle support issues based on the category and complexity.',
        user: `Based on this ticket, recommend the best team or specialist to handle it:\n\n${input}${contextText}`,
      },
    };

    const selected = prompts[action];
    if (!selected) {
      throw new Error(`Unknown copilot action: ${action}`);
    }

    try {
      return await provider.generateText(selected.user, selected.system);
    } catch (error) {
      logger.error(`Copilot action ${action} failed:`, error);
      throw new Error('Copilot action failed');
    }
  }
}

export const copilotService = new CopilotService();
