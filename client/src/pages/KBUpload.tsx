import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeAPI } from '@/lib/api';
import { ArrowLeft, Sparkles, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KBUpload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error('Title and file are required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', file);

      await knowledgeAPI.upload(formData);
      toast.success('Document uploaded and indexed successfully!');
      navigate('/knowledge-base');
    } catch {
      toast.error('Failed to upload document. Please ensure format is valid (txt, pdf, docx).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <button onClick={() => navigate('/knowledge-base')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Base
      </button>

      {/* Main Form container */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">Upload Knowledge Resource</h1>
          <p className="text-sm text-muted-foreground">Upload resource documents. Our AI pipeline will parse and generate pgvector chunk embeddings automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Resource Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Work From Home Policy"
              className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-sm outline-none transition-all text-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Short Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this guide covers..."
              className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3 text-sm outline-none transition-all text-foreground"
            />
          </div>

          {/* File input */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attachment File *</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-colors">
              <Upload className="w-8 h-8 text-primary" />
              <label className="flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg cursor-pointer transition-all">
                Choose Document
                <input type="file" required accept=".txt,.pdf,.docx" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-xs text-muted-foreground">
                {file ? file.name : 'Formats supported: .txt, .pdf, .docx (Max 10MB)'}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing & Creating Semantic Index...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Index Resource Document
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
