import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { cn, getPriorityColor, getStatusColor, timeAgo, exportToCSV } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tickets() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  const { data: ticketsRes, isLoading, refetch } = useQuery({
    queryKey: ['tickets-list', page, search, status, priority, category],
    queryFn: () => ticketsAPI.list({ page, limit: 10, search, status, priority, category }),
  });

  const tickets = ticketsRes?.data?.data?.tickets || [];
  const pagination = ticketsRes?.data?.data?.pagination || { total: 0, totalPages: 1, hasNext: false, hasPrev: false };

  const handleExport = () => {
    if (tickets.length === 0) {
      toast.error('No tickets to export');
      return;
    }
    const cleanData = tickets.map((t: any) => ({
      ID: t.id,
      Title: t.title,
      Category: t.category,
      Priority: t.priority,
      Status: t.status,
      Creator: `${t.creator.firstName} ${t.creator.lastName}`,
      Agent: t.assignedAgent ? `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}` : 'Unassigned',
      Created: t.createdAt,
    }));
    exportToCSV(cleanData, `tickets-export-${Date.now()}`);
    toast.success('Tickets CSV exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspace Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage and track your organization support cases</p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-semibold rounded-xl transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link
            to="/tickets/new"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow shadow-primary/20 flex-1 md:flex-initial"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by title, content..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-1.5 pl-10 pr-4 text-sm outline-none transition-all"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-muted/30 border border-border rounded-lg py-1.5 px-3 text-sm outline-none text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING">Waiting</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="bg-muted/30 border border-border rounded-lg py-1.5 px-3 text-sm outline-none text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-muted/30 border border-border rounded-lg py-1.5 px-3 text-sm outline-none text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="PAYROLL">Payroll</option>
          <option value="FACILITIES">Facilities</option>
          <option value="SECURITY">Security</option>
          <option value="OPERATIONS">Operations</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Ticket List / Table Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4"><span className="skeleton w-36 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-12 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-16 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-16 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-24 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-24 h-4 block" /></td>
                    <td className="py-4 px-4 text-right"><span className="skeleton w-12 h-4 ml-auto block" /></td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-medium text-foreground">
                      <Link to={`/tickets/${t.id}`} className="hover:text-primary hover:underline block truncate max-w-xs">
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getPriorityColor(t.priority))}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getStatusColor(t.status))}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{t.creator.firstName} {t.creator.lastName}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {t.assignedAgent ? `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}` : 'Unassigned'}
                    </td>
                    <td className="py-4 px-4 text-right text-xs text-muted-foreground">{timeAgo(t.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 text-xs">
            <span className="text-muted-foreground">
              Showing page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-border bg-card hover:bg-muted rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className="p-1.5 border border-border bg-card hover:bg-muted rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
