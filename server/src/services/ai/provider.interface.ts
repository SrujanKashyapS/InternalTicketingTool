export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
  generateJSON<T = any>(prompt: string, systemPrompt?: string): Promise<T>;
}

export interface CategorizationResult {
  category: string;
  urgencyScore: number;
  sentiment: string;
  confidence: number;
}

export interface DuplicateResult {
  ticketId: string;
  title: string;
  similarity: number;
  status: string;
}

export interface AIResponseResult {
  response: string;
  troubleshootingSteps: string[];
  actionItems: string[];
  nextSteps: string[];
}

export interface SummaryResult {
  issue: string;
  discussion: string;
  actionsTaken: string;
  currentState: string;
  summary: string;
}

export interface RootCauseResult {
  probableCause: string;
  recommendedFix: string;
  confidence: number;
}

export interface EscalationResult {
  riskScore: number;
  factors: string[];
  recommendations: string[];
  shouldEscalate: boolean;
}

export interface SimilarTicketResult {
  ticketId: string;
  title: string;
  summary: string;
  resolution: string;
  similarity: number;
}

export interface CopilotAction {
  type: 'summarize' | 'generate_reply' | 'rewrite' | 'simplify' | 'action_plan' | 'checklist' | 'recommend_assignment';
  input: string;
  context?: string;
}

export interface InsightsResult {
  recurringIssues: { issue: string; frequency: number; trend: string }[];
  departmentTrends: { department: string; ticketCount: number; avgResolution: number }[];
  workloadBottlenecks: { agent: string; load: number; recommendation: string }[];
  slaRisks: { category: string; riskLevel: string; count: number }[];
  executiveSummary: string;
}

export interface RAGResult {
  answer: string;
  sources: { documentTitle: string; chunkContent: string; confidence: number }[];
  confidence: number;
}
