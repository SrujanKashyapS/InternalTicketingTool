import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { knowledgeAPI, aiAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  Plus, 
  Search, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function KnowledgeBase() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  
  // Semantic search / RAG states
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragResult, setRagResult] = useState<any>(null);
  const [askingRag, setAskingRag] = useState(false);

  const { data: docsRes, isLoading } = useQuery({
    queryKey: ['kb-documents', search],
    queryFn: () => knowledgeAPI.list({ search }),
  });

  const documents = docsRes?.data?.data?.documents || [];

  const handleAskRAG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuestion.trim()) {
      toast.error('Please enter a question for RAG processing.');
      return;
    }

    setAskingRag(true);
    setRagResult(null);
    try {
      const { data } = await aiAPI.rag(ragQuestion);
      setRagResult(data.data);
      toast.success('RAG Response Generated');
    } catch {
      toast.error('RAG semantic answer failed. Try again.');
    } finally {
      setAskingRag(false);
    }
  };

  const isAgentOrAdmin = user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">Search and access company resources, guides, and manuals</p>
        </div>
        {isAgentOrAdmin && (
          <Link
            to="/knowledge-base/upload"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </Link>
        )}
      </div>

      {/* RAG Semantic Copilot Panel */}
      <div className="bg-gradient-to-r from-primary/5 via-violet-500/5 to-indigo-500/5 border border-primary/20 rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <span className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Semantic Search Copilot (RAG)
          </span>
          <p className="text-xs text-muted-foreground">Ask any natural language question. The AI will search across all files and generate a cited response.</p>
        </div>

        <form onSubmit={handleAskRAG} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. How do I configure my VPN connection?"
            value={ragQuestion}
            onChange={(e) => setRagQuestion(e.target.value)}
            className="flex-1 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-sm outline-none transition-all text-foreground"
          />
          <button
            type="submit"
            disabled={askingRag}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {askingRag ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {/* RAG answer visualization */}
        {ragResult && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-xs text-foreground">AI Answer</h3>
              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{ragResult.answer}</p>
            </div>

            {/* Sources / Citations */}
            {ragResult.sources && ragResult.sources.length > 0 && (
              <div className="pt-3 border-t border-border/50 space-y-1.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Citations & Source Chunks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ragResult.sources.map((src: any, i: number) => (
                    <div key={i} className="bg-muted/30 border border-border/50 p-2.5 rounded-lg text-[10px] space-y-1 flex flex-col justify-between">
                      <p className="text-muted-foreground leading-normal font-serif italic">"{src.chunkContent}"</p>
                      <span className="font-semibold text-foreground block">
                        Source Document: {src.documentTitle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Directory Search & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Directory */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="font-semibold text-sm text-foreground">Document Directory</span>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search file title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-1 px-8 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="py-4 flex justify-between items-center">
                  <div className="space-y-1 flex-1">
                    <div className="skeleton w-1/4 h-4" />
                    <div className="skeleton w-1/2 h-3" />
                  </div>
                  <div className="skeleton w-16 h-6 rounded" />
                </div>
              ))
            ) : documents.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-12">No documents found in directory</p>
            ) : (
              documents.map((doc: any) => (
                <div key={doc.id} className="py-4 flex items-center justify-between hover:bg-muted/10 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <Link to={`/knowledge-base/${doc.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors hover:underline">
                        {doc.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{doc.description || 'No description provided'}</p>
                    </div>
                  </div>
                  <Link to={`/knowledge-base/${doc.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold">
                    View <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
