import { getAIProvider } from './index';
import { InsightsResult } from './provider.interface';
import prisma from '../../config/database';
import logger from '../../utils/logger';

export class InsightsService {
  async generateInsights(): Promise<InsightsResult> {
    try {
      const provider = getAIProvider();

      const [tickets, agents] = await Promise.all([
        prisma.ticket.findMany({
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          include: { assignedAgent: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
        prisma.user.findMany({
          where: { role: 'AGENT' },
          include: { assignedTickets: { where: { status: { not: 'CLOSED' } } } },
        }),
      ]);

      const ticketSummary = tickets.map(t => ({
        category: t.category,
        priority: t.priority,
        status: t.status,
        sentiment: t.sentiment,
        urgencyScore: t.urgencyScore,
        createdAt: t.createdAt.toISOString(),
        agent: t.assignedAgent ? `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}` : 'Unassigned',
      }));

      const agentSummary = agents.map(a => ({
        name: `${a.firstName} ${a.lastName}`,
        activeTickets: a.assignedTickets.length,
      }));

      const prompt = `Analyze these support metrics from the last 30 days and provide executive insights.

Tickets (sample of ${tickets.length}):
${JSON.stringify(ticketSummary.slice(0, 50), null, 2)}

Agent Workloads:
${JSON.stringify(agentSummary, null, 2)}

Return a JSON object with:
- recurringIssues: array of {issue: string, frequency: number, trend: "increasing"|"stable"|"decreasing"}
- departmentTrends: array of {department: string, ticketCount: number, avgResolution: number (hours)}
- workloadBottlenecks: array of {agent: string, load: number, recommendation: string}
- slaRisks: array of {category: string, riskLevel: "low"|"medium"|"high", count: number}
- executiveSummary: a 3-5 sentence executive summary of the support landscape`;

      const systemPrompt = 'You are a senior analytics expert generating executive insights from support data.';

      return await provider.generateJSON<InsightsResult>(prompt, systemPrompt);
    } catch (error) {
      logger.error('Insights generation failed:', error);
      return {
        recurringIssues: [],
        departmentTrends: [],
        workloadBottlenecks: [],
        slaRisks: [],
        executiveSummary: 'Insights generation is currently unavailable. Please try again later.',
      };
    }
  }
}

export const insightsService = new InsightsService();
