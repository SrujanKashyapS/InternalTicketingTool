import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '@/lib/api';
import { cn, getPriorityColor, getStatusColor } from '@/lib/utils';
import { Search as SearchIcon, Ticket, BookOpen, User, ArrowRight } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const { data: searchRes, isLoading } = useQuery({
    queryKey: ['global-search-query', q],
    queryFn: () => searchAPI.search(q),
    enabled: q.length >= 2,
  });

  const results = searchRes?.data?.data || { tickets: [], users: [], documents: [], totalResults: 0 };

  if (q.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <SearchIcon className="w-12 h-12 text-muted-foreground animate-bounce" />
        <h2 className="text-lg font-bold text-foreground">Global Workspace Search</h2>
        <p className="text-sm text-muted-foreground max-w-sm">Enter at least 2 characters in the header search input to search tickets, users, and documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
        <p className="text-sm text-muted-foreground">Found {results.totalResults} matching results for "{q}"</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tickets Results */}
          {results.tickets.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
              <h2 className="font-semibold text-sm text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2">
                <Ticket className="w-4 h-4 text-primary" /> Tickets ({results.tickets.length})
              </h2>
              <div className="divide-y divide-border/60">
                {results.tickets.map((t: any) => (
                  <div key={t.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-muted/10 rounded-lg px-2 transition-colors">
                    <div className="space-y-0.5">
                      <Link to={`/tickets/${t.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors hover:underline">
                        {t.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-lg">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", getPriorityColor(t.priority))}>
                        {t.priority}
                      </span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", getStatusColor(t.status))}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {results.documents.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
              <h2 className="font-semibold text-sm text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2">
                <BookOpen className="w-4 h-4 text-primary" /> Knowledge Resources ({results.documents.length})
              </h2>
              <div className="divide-y divide-border/60">
                {results.documents.map((doc: any) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-muted/10 rounded-lg px-2 transition-colors">
                    <div className="space-y-0.5">
                      <Link to={`/knowledge-base/${doc.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors hover:underline">
                        {doc.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{doc.description || 'No description'}</p>
                    </div>
                    <Link to={`/knowledge-base/${doc.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Results */}
          {results.users.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
              <h2 className="font-semibold text-sm text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2">
                <User className="w-4 h-4 text-primary" /> Employees ({results.users.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.users.map((u: any) => (
                  <div key={u.id} className="bg-card border border-border p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email} • {u.department || 'No Dept'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.totalResults === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No results found matching "{q}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
