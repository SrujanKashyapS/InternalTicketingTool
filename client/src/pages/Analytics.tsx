import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function Analytics() {
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['analytics-dashboard-page'],
    queryFn: () => analyticsAPI.dashboard(),
  });

  const data = analyticsRes?.data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton w-32 h-6" />
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="skeleton h-80" />
      </div>
    );
  }

  const overview = data?.overview || {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    criticalTickets: 0,
    avgResolutionHours: 0,
    slaBreached: 0,
    slaCompliance: 100,
  };

  const cards = [
    { label: 'Avg Resolution Time', value: `${overview.avgResolutionHours.toFixed(1)} hrs`, icon: Clock, color: 'text-primary bg-primary/10' },
    { label: 'SLA Breach Count', value: overview.slaBreached, icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
    { label: 'SLA Compliance Rate', value: `${overview.slaCompliance.toFixed(1)}%`, icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Resolved Tickets', value: overview.resolvedTickets, icon: CheckCircle, color: 'text-violet-500 bg-violet-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Executive Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitor platform performance, SLA metrics, and agent response metrics.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", card.color)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Volume Timeline */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
          <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" /> Support Request Timelines
          </span>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.ticketsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority breakdown bar chart */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <span className="font-semibold text-sm text-foreground">Priority Allocation</span>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ticketsByPriority || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="priority" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agents performance leaderboard table */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-primary" /> Support Agent Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3 text-center">Total Assigned</th>
                <th className="py-2.5 px-3 text-center">Resolved</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-right">Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs text-muted-foreground">
              {data?.agentPerformance && data.agentPerformance.length > 0 ? (
                data.agentPerformance.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{agent.name}</td>
                    <td className="py-3 px-3 text-center">{agent.total}</td>
                    <td className="py-3 px-3 text-center">{agent.resolved}</td>
                    <td className="py-3 px-3 text-center">{agent.active}</td>
                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      {agent.avgResolutionHours.toFixed(1)} hrs
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No agent performance stats available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
