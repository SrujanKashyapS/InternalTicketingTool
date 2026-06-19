import { useState } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { aiAPI } from '@/lib/api';
import { 
  X, 
  Sparkles, 
  FileText, 
  Send, 
  CheckSquare, 
  ArrowLeftRight, 
  HelpCircle,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AICopilotSidebar() {
  const { toggleCopilot } = useSidebarStore();
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    if (!input.trim()) {
      toast.error('Please enter input text first.');
      return;
    }

    setLoading(true);
    setResponse('');
    try {
      const { data } = await aiAPI.copilot({ action, input, context });
      setResponse(data.data.result);
      toast.success('AI execution complete');
    } catch {
      toast.error('AI Copilot failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { id: 'summarize', label: 'Summarize', icon: FileText },
    { id: 'generate_reply', label: 'Generate Reply', icon: Send },
    { id: 'rewrite', label: 'Professional Rewrite', icon: ArrowLeftRight },
    { id: 'simplify', label: 'Simplify Text', icon: HelpCircle },
    { id: 'action_plan', label: 'Create Action Plan', icon: ClipboardList },
    { id: 'checklist', label: 'Generate Checklist', icon: CheckSquare },
    { id: 'recommend_assignment', label: 'Recommend Agent', icon: UserCheck },
  ];

  return (
    <aside className="fixed top-0 right-0 z-30 h-screen w-80 bg-card border-l border-border flex flex-col justify-between shadow-2xl animate-slide-in">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm text-foreground">Agent Copilot</span>
        </div>
        <button onClick={toggleCopilot} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input / Execution Workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context Field */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Optional context (e.g. ticket info, handbook chunks)</label>
          <textarea
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide context..."
            className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-2 text-xs outline-none resize-none"
          />
        </div>

        {/* Input Text Area */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Text input to process *</label>
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text here to process..."
            className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-2 text-xs outline-none resize-none"
          />
        </div>

        {/* Action Grid */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Copilot Skill</label>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => handleAction(act.id)}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 text-center gap-1.5 disabled:opacity-50"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-medium leading-tight">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Output Workspace */}
        {loading && (
          <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Copilot is thinking...</span>
          </div>
        )}

        {response && !loading && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block">AI Response</label>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs leading-relaxed text-foreground select-all whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
