import { useQuery } from '@tanstack/react-query';
import { ticketsAPI, analyticsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { cn, getPriorityColor, getStatusColor, timeAgo } from '@/lib/utils';
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: () => ticketsAPI.stats(),
  });

  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsAPI.dashboard(),
    enabled: user?.role === 'ADMIN' || user?.role === 'AGENT',
  });

  const { data: ticketsRes, isLoading: ticketsLoading } = useQuery({
    queryKey: ['recent-tickets-dashboard'],
    queryFn: () => ticketsAPI.list({ limit: 5 }),
  });

  const stats = statsRes?.data?.data || { total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0, highPriority: 0 };
  const analytics = analyticsRes?.data?.data;
  const tickets = ticketsRes?.data?.data?.tickets || [];

  const cards = [
    { label: 'Total Tickets', value: stats.total, icon: Ticket, color: 'text-primary bg-primary/10' },
    { label: 'Active In Progress', value: stats.inProgress, icon: Clock, color: 'text-violet-500 bg-violet-500/10' },
    { label: 'SLA Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
    { label: 'Resolved Cases', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Copilot Active</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.firstName}!</h1>
          <p className="text-sm text-muted-foreground">Here is the active status overview for your workspace.</p>
        </div>
        <Link 
          to="/tickets/new" 
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow shadow-primary/20 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? <span className="skeleton w-12 h-6 block" /> : card.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-xl", card.color)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Volume Analytics - Only Visible to Admin/Agent */}
        {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" /> Ticket Volume Trends (30 Days)
              </span>
            </div>
            <div className="h-64">
              {analyticsLoading ? (
                <div className="skeleton w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.ticketsByDay || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Categories Distribution */}
        {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <span className="font-semibold text-sm text-foreground block">Tickets by Category</span>
            <div className="h-48 flex justify-center items-center">
              {analyticsLoading ? (
                <div className="skeleton w-32 h-32 rounded-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.ticketsByCategory || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="category"
                    >
                      {(analytics?.ticketsByCategory || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(analytics?.ticketsByCategory || []).slice(0, 4).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{item.category}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tickets List */}
        <div className={cn("bg-card border border-border rounded-2xl p-5 space-y-4", (user?.role === 'ADMIN' || user?.role === 'AGENT') ? "lg:col-span-3" : "lg:col-span-4")}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">Recent Tickets</span>
            <Link to="/tickets" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {ticketsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="py-3.5 flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="skeleton w-1/3 h-4" />
                    <div className="skeleton w-1/2 h-3" />
                  </div>
                  <div className="skeleton w-16 h-6 rounded" />
                </div>
              ))
            ) : tickets.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">No recent tickets found</p>
            ) : (
              tickets.map((t: any) => (
                <div key={t.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-muted/10 rounded-lg px-2 transition-colors">
                  <div className="space-y-1">
                    <Link to={`/tickets/${t.id}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors hover:underline">
                      {t.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{t.creator.firstName} {t.creator.lastName}</span>
                      <span>•</span>
                      <span>{timeAgo(t.createdAt)}</span>
                    </div>
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
