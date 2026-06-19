import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketsAPI } from '@/lib/api';
import { useSidebarStore } from '@/stores/sidebarStore';
import { 
  Sparkles, 
  ArrowLeft, 
  Paperclip, 
  Send,
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('OTHER');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Duplicate Check State
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Agentic workflow animation steps state
  const [agentStep, setAgentStep] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDuplicateCheck = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description first.');
      return;
    }
    setCheckingDuplicates(true);
    try {
      const { data } = await ticketsAPI.checkDuplicates({ title, description });
      setDuplicates(data.data.duplicates);
      setDuplicateChecked(true);
      if (data.data.duplicates.length > 0) {
        toast('We found similar resolved or open tickets.', { icon: '⚠️' });
      } else {
        toast.success('No duplicates found. Proceed to submit!');
      }
    } catch {
      toast.error('Failed to run duplicate detector.');
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const executeAgenticWorkflow = async (formData: FormData) => {
    // Visually step through agentic workflow stages
    const steps = [
      'Categorizing Ticket...',
      'Generating Embeddings...',
      'Searching Similar Cases...',
      'Searching Knowledge Base...',
      'Estimating Urgency SLA...',
      'Recommending Assignment...',
      'Suggesting Resolution...',
      'Generating Summary...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAgentStep(i);
      // Fast simulation of pipeline processing
      await new Promise(r => setTimeout(r, 600));
    }

    // Submit ticket
    const { data } = await ticketsAPI.create(formData);
    return data.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Title and Description are required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('category', category);
      files.forEach((file) => formData.append('files', file));

      const result = await executeAgenticWorkflow(formData);
      toast.success('Ticket submitted successfully!');
      
      // Auto transition to detail page
      navigate(`/tickets/${result.ticket.id}`);
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setLoading(false);
      setAgentStep(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Link */}
      <button onClick={() => navigate('/tickets')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to tickets
      </button>

      {/* Main Container */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">Create Support Ticket</h1>
          <p className="text-sm text-muted-foreground">Submit your ticket. Our AI engine will auto-route, prioritize, and suggest answers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDuplicateChecked(false); }}
              placeholder="Brief description of the issue"
              className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-sm outline-none transition-all text-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description *</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDuplicateChecked(false); }}
              placeholder="Provide detail including error codes, step to reproduce, etc."
              className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3 text-sm outline-none transition-all text-foreground"
            />
          </div>

          {/* Category & Priority selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Priority Overrides</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg py-2 px-3 text-sm outline-none text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category Overrides</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg py-2 px-3 text-sm outline-none text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="PAYROLL">Payroll</option>
                <option value="FACILITIES">Facilities</option>
                <option value="SECURITY">Security</option>
                <option value="OPERATIONS">Operations</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attachments</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-2 border border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg cursor-pointer transition-all">
                <Paperclip className="w-3.5 h-3.5" /> Choose Files
                <input type="file" multiple onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-xs text-muted-foreground">
                {files.length === 0 ? 'No files selected' : `${files.length} file(s) ready`}
              </span>
            </div>
          </div>

          {/* Duplicate detector action */}
          <div className="pt-2 border-t border-border flex items-center gap-2">
            <button
              type="button"
              onClick={handleDuplicateCheck}
              disabled={checkingDuplicates}
              className="flex items-center gap-1 px-3 py-2 border border-primary/20 bg-primary/5 text-primary rounded-lg text-xs font-semibold hover:bg-primary/10 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Check Duplicates First
            </button>
          </div>

          {/* Duplicates list panel */}
          {duplicateChecked && (
            <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Potential Duplicates ({duplicates.length})
              </h3>
              {duplicates.length === 0 ? (
                <p className="text-xs text-muted-foreground">No similar tickets found. Proceed to submit!</p>
              ) : (
                <div className="space-y-2">
                  {duplicates.map((dup) => (
                    <div key={dup.ticketId} className="flex justify-between items-center bg-card p-2 border border-border rounded-lg text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{dup.title}</p>
                        <span className="text-[10px] text-muted-foreground">Similarity: {(dup.similarity * 100).toFixed(0)}% • Status: {dup.status}</span>
                      </div>
                      <Link to={`/tickets/${dup.ticketId}`} target="_blank" className="p-1 text-primary hover:bg-muted rounded">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Agentic pipeline execution display */}
          {agentStep !== null && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-xs text-primary flex items-center gap-1.5">
                <Settings className="w-4 h-4 animate-spin" /> Agentic Pipeline Execution Flow
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                {[
                  'Categorize', 'Generate Embedding', 'Search Similar Tickets', 
                  'Search Knowledge Base', 'Estimate Urgency', 'Recommend Assignment', 
                  'Suggest Resolution', 'Generate Summary'
                ].map((step, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-1.5 border rounded-lg text-center transition-all",
                      agentStep >= idx 
                        ? "bg-primary border-primary text-primary-foreground font-semibold" 
                        : "bg-card border-border text-muted-foreground"
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Processing Agentic Workflow...' : 'Submit Ticket'}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
