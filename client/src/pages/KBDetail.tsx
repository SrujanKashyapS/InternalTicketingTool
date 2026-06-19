import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Trash2, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KBDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: docRes, isLoading } = useQuery({
    queryKey: ['kb-document-detail', id],
    queryFn: () => knowledgeAPI.get(id!),
  });

  const doc = docRes?.data?.data;

  const deleteMutation = useMutation({
    mutationFn: () => knowledgeAPI.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-documents'] });
      toast.success('Document deleted successfully');
      navigate('/knowledge-base');
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => knowledgeAPI.reindex(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-document-detail', id] });
      toast.success('Document re-indexed successfully');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton w-32 h-4" />
        <div className="skeleton w-full h-64" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-foreground">Document Not Found</h2>
        <button onClick={() => navigate('/knowledge-base')} className="mt-4 text-primary hover:underline">
          Go back to Knowledge Base
        </button>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/knowledge-base')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Base
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => reindexMutation.mutate()}
              disabled={reindexMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-index Chunks
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this resource?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Document
            </button>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">{doc.title}</h1>
            <p className="text-sm text-muted-foreground">{doc.description || 'No description provided'}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 flex-wrap">
              <span>Format: {doc.mimeType}</span>
              <span>•</span>
              <span>Size: {(doc.size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span>Chunks: {doc.chunkCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chunk Previews */}
      {doc.chunks && doc.chunks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Vector Database Chunks ({doc.chunks.length})
          </h2>
          <div className="space-y-3">
            {doc.chunks.map((chunk: any) => (
              <div key={chunk.id} className="bg-card border border-border rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Chunk Index #{chunk.chunkIndex}</span>
                <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
