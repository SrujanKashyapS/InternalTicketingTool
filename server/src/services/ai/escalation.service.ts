import { getAIProvider } from './index';
import { EscalationResult } from './provider.interface';
import logger from '../../utils/logger';

export class EscalationService {
  async evaluate(
    ticketTitle: string,
    ticketDescription: string,
    priority: string,
    sentiment: string | null,
    urgencyScore: number | null,
    slaDeadline: Date | null,
    comments: { content: string }[]
  ): Promise<EscalationResult> {
    const provider = getAIProvider();

    const slaStatus = slaDeadline
      ? new Date() > slaDeadline ? 'BREACHED' : `Due: ${slaDeadline.toISOString()}`
      : 'No SLA set';

    const commentsText = comments.length > 0
      ? `\n\nRecent comments:\n${comments.slice(-5).map(c => c.content).join('\n')}`
      : '';

    const prompt = `Evaluate if this support ticket needs escalation.

Title: ${ticketTitle}
Description: ${ticketDescription}
Priority: ${priority}
Sentiment: ${sentiment || 'unknown'}
Urgency Score: ${urgencyScore || 'unknown'}
SLA Status: ${slaStatus}${commentsText}

Consider:
- SLA breach risk
- Customer frustration level
- Security implications
- Business impact
- Urgency of the issue

Return a JSON object with:
- riskScore: a number from 1 to 10 (10 being highest risk)
- factors: array of risk factors identified
- recommendations: array of recommended actions (e.g., "escalate", "assign senior engineer", "monitor", "prioritize")
- shouldEscalate: boolean indicating if immediate escalation is recommended`;

    const systemPrompt = 'You are an expert at evaluating support ticket escalation risk in enterprise environments.';

    try {
      const result = await provider.generateJSON<EscalationResult>(prompt, systemPrompt);
      return {
        riskScore: Math.min(10, Math.max(1, result.riskScore || 5)),
        factors: result.factors || [],
        recommendations: result.recommendations || ['Monitor ticket'],
        shouldEscalate: result.shouldEscalate || false,
      };
    } catch (error) {
      logger.error('Escalation evaluation failed:', error);
      return {
        riskScore: 5,
        factors: ['Unable to evaluate automatically'],
        recommendations: ['Manual review recommended'],
        shouldEscalate: false,
      };
    }
  }
}

export const escalationService = new EscalationService();
