export type Role = 'EMPLOYEE' | 'AGENT' | 'ADMIN';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'IT' | 'HR' | 'PAYROLL' | 'FACILITIES' | 'SECURITY' | 'OPERATIONS' | 'OTHER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { createdTickets: number; assignedTickets: number };
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  sentiment?: string;
  urgencyScore?: number;
  aiConfidence?: number;
  slaDeadline?: string;
  escalated: boolean;
  escalationReason?: string;
  resolvedAt?: string;
  resolution?: string;
  creatorId: string;
  creator: User;
  assignedAgentId?: string;
  assignedAgent?: User;
  comments: Comment[];
  attachments: Attachment[];
  _count?: { comments: number; attachments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  isAIGenerated: boolean;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  author: User & { role: Role };
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  description?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  status: string;
  chunkCount: number;
  chunks?: { id: string; content: string; chunkIndex: number }[];
  createdAt: string;
  _count?: { chunks: number };
}

export interface AISummary {
  issue: string;
  discussion: string;
  actionsTaken: string;
  currentState: string;
  summary: string;
}

export interface AIResponse {
  response: string;
  troubleshootingSteps: string[];
  actionItems: string[];
  nextSteps: string[];
}

export interface RootCause {
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

export interface SimilarTicket {
  ticketId: string;
  title: string;
  summary: string;
  resolution: string;
  similarity: number;
}

export interface RAGResult {
  answer: string;
  sources: { documentTitle: string; chunkContent: string; confidence: number }[];
  confidence: number;
}

export interface DashboardStats {
  overview: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    criticalTickets: number;
    last30DaysTickets: number;
    last7DaysTickets: number;
    avgResolutionHours: number;
    slaBreached: number;
    slaCompliance: number;
  };
  ticketsByCategory: { category: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketsByDay: { date: string; count: number }[];
  agentPerformance: { id: string; name: string; total: number; resolved: number; active: number; avgResolutionHours: number }[];
  recentTickets: Ticket[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
