import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI, commentsAPI, aiAPI, usersAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { 
  cn, 
  getPriorityColor, 
  getStatusColor, 
  getCategoryColor, 
  formatDateTime 
} from '@/lib/utils';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  UserPlus, 
  AlertTriangle,
  FileText,
  Bookmark,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // AI features states
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const [aiReply, setAiReply] = useState<any>(null);
  const [generatingReply, setGeneratingReply] = useState(false);

  const [aiRootCause, setAiRootCause] = useState<any>(null);
  const [generatingRootCause, setGeneratingRootCause] = useState(false);

  const [aiEscalation, setAiEscalation] = useState<any>(null);
  const [generatingEscalation, setGeneratingEscalation] = useState(false);

  const [similarResolved, setSimilarResolved] = useState<any[]>([]);
  const [searchingSimilar, setSearchingSimilar] = useState(false);

  const { data: ticketRes, isLoading: ticketLoading } = useQuery({
    queryKey: ['ticket-detail', id],
    queryFn: () => ticketsAPI.get(id!),
  });

  const { data: agentsRes } = useQuery({
    queryKey: ['agents-list'],
    queryFn: () => usersAPI.agents(),
    enabled: user?.role === 'ADMIN' || user?.role === 'AGENT',
  });

  const ticket = ticketRes?.data?.data;
  const agents = agentsRes?.data?.data || [];

  const updateMutation = useMutation({
    mutationFn: (data: any) => ticketsAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-detail', id] });
      toast.success('Ticket updated successfully');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data: any) => commentsAPI.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-detail', id] });
      setCommentText('');
      toast.success('Comment added');
    },
  });

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({ status });
  };

  const handlePriorityChange = (priority: string) => {
    updateMutation.mutate({ priority });
  };

  const handleAgentChange = (assignedAgentId: string) => {
    updateMutation.mutate({ assignedAgentId: assignedAgentId || null });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate({ content: commentText, isInternal });
  };

  // AI Feature triggers
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const { data } = await aiAPI.summary(id!);
      setAiSummary(data.data);
      toast.success('AI Summary Generated');
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateReply = async () => {
    setGeneratingReply(true);
    try {
      const { data } = await aiAPI.generateResponse(id!);
      setAiReply(data.data);
      toast.success('AI Response Generated');
    } catch {
      toast.error('Failed to generate response');
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleRootCause = async () => {
    setGeneratingRootCause(true);
    try {
      const { data } = await aiAPI.rootCause(id!);
      setAiRootCause(data.data);
      toast.success('Root Cause Analyzed');
    } catch {
      toast.error('Failed to analyze root cause');
    } finally {
      setGeneratingRootCause(false);
    }
  };

  const handleEscalation = async () => {
    setGeneratingEscalation(true);
    try {
      const { data } = await aiAPI.escalation(id!);
      setAiEscalation(data.data);
      toast.success('Escalation Risk Evaluated');
    } catch {
      toast.error('Failed to evaluate escalation');
    } finally {
      setGeneratingEscalation(false);
    }
  };

  const handleSimilarResolved = async () => {
    setSearchingSimilar(true);
    try {
      const { data } = await aiAPI.similar(id!);
      setSimilarResolved(data.data);
      toast.success('Similar Tickets Found');
    } catch {
      toast.error('Failed to search similar resolved tickets');
    } finally {
      setSearchingSimilar(false);
    }
  };

  if (ticketLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton w-32 h-4" />
        <div className="skeleton w-full h-32" />
        <div className="skeleton w-full h-64" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-foreground">Ticket Not Found</h2>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-primary hover:underline">
          Go back to tickets
        </button>
      </div>
    );
  }

  const isAgentOrAdmin = user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Back & Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button onClick={() => navigate('/tickets')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to tickets
          </button>
          <h1 className="text-xl font-bold text-foreground">{ticket.title}</h1>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className={cn("px-2 py-0.5 rounded-full font-bold border", getPriorityColor(ticket.priority))}>
              {ticket.priority}
            </span>
            <span className={cn("px-2 py-0.5 rounded-full font-bold border", getStatusColor(ticket.status))}>
              {ticket.status}
            </span>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold text-muted-foreground bg-muted")}>
              {ticket.category}
            </span>
            <span className="text-muted-foreground">Submitted by {ticket.creator.firstName} {ticket.creator.lastName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{formatDateTime(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Quick actions for agents/admins */}
        {isAgentOrAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Change */}
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-muted border border-border rounded-lg py-1.5 px-3 text-xs outline-none text-muted-foreground focus:text-foreground transition-all"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING">Waiting</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Priority Change */}
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="bg-muted border border-border rounded-lg py-1.5 px-3 text-xs outline-none text-muted-foreground focus:text-foreground transition-all"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Agent Assign */}
            <select
              value={ticket.assignedAgentId || ''}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="bg-primary/5 border border-primary/20 rounded-lg py-1.5 px-3 text-xs outline-none text-primary font-semibold transition-all"
            >
              <option value="">Unassigned</option>
              {agents.map((agent: any) => (
                <option key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Ticket details and comments thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-sm text-foreground">Ticket Description</h2>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>

            {/* Attachments Section */}
            {ticket.attachments.length > 0 && (
              <div className="pt-4 border-t border-border space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-muted/20 hover:bg-muted/50 text-xs rounded-lg text-foreground hover:underline transition-all"
                    >
                      <span>{file.originalName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Helper Workspace */}
          {isAgentOrAdmin && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <span className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Support Copilot Workspace
              </span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="flex flex-col items-center justify-center p-3 border border-border hover:bg-muted rounded-xl text-center text-[10px] font-semibold gap-1.5 transition-all disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  Generate Summary
                </button>
                <button
                  onClick={handleGenerateReply}
                  disabled={generatingReply}
                  className="flex flex-col items-center justify-center p-3 border border-border hover:bg-muted rounded-xl text-center text-[10px] font-semibold gap-1.5 transition-all disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4 text-primary" />
                  Generate Reply
                </button>
                <button
                  onClick={handleRootCause}
                  disabled={generatingRootCause}
                  className="flex flex-col items-center justify-center p-3 border border-border hover:bg-muted rounded-xl text-center text-[10px] font-semibold gap-1.5 transition-all disabled:opacity-50"
                >
                  <HelpCircle className="w-4 h-4 text-primary" />
                  Root Cause
                </button>
                <button
                  onClick={handleEscalation}
                  disabled={generatingEscalation}
                  className="flex flex-col items-center justify-center p-3 border border-border hover:bg-muted rounded-xl text-center text-[10px] font-semibold gap-1.5 transition-all disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  Escalation Risk
                </button>
                <button
                  onClick={handleSimilarResolved}
                  disabled={searchingSimilar}
                  className="flex flex-col items-center justify-center p-3 border border-border hover:bg-muted rounded-xl text-center text-[10px] font-semibold gap-1.5 transition-all col-span-2 md:col-span-1 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Similar Resolved
                </button>
              </div>

              {/* AI outputs visualization */}
              <div className="space-y-4 mt-4">
                {/* Summary Output */}
                {aiSummary && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                    <h4 className="font-semibold text-xs text-foreground">AI Ticket Summary</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{aiSummary.summary}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 pt-2 border-t border-border/50">
                      <div><strong className="text-foreground">Issue:</strong> {aiSummary.issue}</div>
                      <div><strong className="text-foreground">State:</strong> {aiSummary.currentState}</div>
                    </div>
                  </div>
                )}

                {/* Reply Output */}
                {aiReply && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                    <h4 className="font-semibold text-xs text-foreground">AI Suggested Reply</h4>
                    <textarea
                      rows={5}
                      defaultValue={aiReply.response}
                      className="w-full bg-card border border-border rounded-lg p-2 text-xs outline-none text-foreground"
                    />
                    <div className="text-[10px] text-muted-foreground space-y-1">
                      <p><strong>Troubleshooting Steps:</strong></p>
                      <ul className="list-disc list-inside">
                        {aiReply.troubleshootingSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Root Cause Output */}
                {aiRootCause && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                    <h4 className="font-semibold text-xs text-foreground">Root Cause Analysis</h4>
                    <p className="text-xs text-muted-foreground"><strong>Probable Cause:</strong> {aiRootCause.probableCause}</p>
                    <p className="text-xs text-muted-foreground"><strong>Recommended Fix:</strong> {aiRootCause.recommendedFix}</p>
                    <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                      Confidence: {(aiRootCause.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Escalation Output */}
                {aiEscalation && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                    <h4 className="font-semibold text-xs text-foreground flex items-center justify-between">
                      Escalation evaluation
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        aiEscalation.riskScore >= 7 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        Risk Score: {aiEscalation.riskScore}/10
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground"><strong>Recommendations:</strong> {aiEscalation.recommendations.join(', ')}</p>
                  </div>
                )}

                {/* Similar Tickets Output */}
                {similarResolved.length > 0 && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                    <h4 className="font-semibold text-xs text-foreground">Similar Resolved Tickets</h4>
                    <div className="space-y-2">
                      {similarResolved.map((ticket, i) => (
                        <div key={i} className="text-xs bg-card border border-border p-2.5 rounded-lg space-y-1">
                          <p className="font-medium text-foreground">{ticket.title}</p>
                          <p className="text-muted-foreground text-[10px]"><strong>Resolution:</strong> {ticket.resolution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discussion comments section */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-sm text-foreground">Discussion Thread</h2>
            <div className="space-y-4">
              {ticket.comments.map((comment: any) => (
                <div key={comment.id} className={cn("p-4 rounded-xl border", comment.isInternal ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/10 border-border")}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{comment.author.firstName} {comment.author.lastName}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-muted rounded text-muted-foreground">{comment.author.role}</span>
                      {comment.isInternal && <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-600 rounded">Internal</span>}
                      {comment.isAIGenerated && <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-primary/10 text-primary rounded flex items-center gap-0.5"><Sparkles className="w-3 h-3" /> AI</span>}
                    </div>
                    <span className="text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Comment box */}
            <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-border">
              <textarea
                required
                rows={3}
                placeholder="Write comment or response..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-2.5 text-sm outline-none transition-all text-foreground"
              />
              <div className="flex justify-between items-center">
                {isAgentOrAdmin ? (
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Internal note (visible only to agents/admins)
                  </label>
                ) : <div />}
                <button
                  type="submit"
                  disabled={commentMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold rounded-lg transition-all"
                >
                  {commentMutation.isPending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Metadata panel */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-sm text-foreground">Ticket Details</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Urgency Score</span>
                <span className="font-semibold text-foreground">{ticket.urgencyScore || 'None'} / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Confidence</span>
                <span className="font-semibold text-foreground">
                  {ticket.aiConfidence ? `${(ticket.aiConfidence * 100).toFixed(0)}%` : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA Deadline</span>
                <span className="font-semibold text-foreground">
                  {ticket.slaDeadline ? formatDateTime(ticket.slaDeadline) : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-semibold text-foreground">{ticket.creator.department || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
