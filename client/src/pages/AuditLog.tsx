import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AuditLog() {
  const [page, setPage] = useState(1);

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs-list', page],
    queryFn: () => analyticsAPI.auditLogs({ page, limit: 25 }),
  });

  const logs = logsRes?.data?.data?.logs || [];
  const pagination = logsRes?.data?.data?.pagination || { total: 0, totalPages: 1, hasNext: false, hasPrev: false };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> Workspace Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">Trace and audit system mutations and authorization updates.</p>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs text-muted-foreground">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><span className="skeleton w-24 h-4 block" /></td>
                    <td className="py-3 px-4"><span className="skeleton w-16 h-4 block" /></td>
                    <td className="py-3 px-4"><span className="skeleton w-24 h-4 block" /></td>
                    <td className="py-3 px-4"><span className="skeleton w-24 h-4 block" /></td>
                    <td className="py-3 px-4"><span className="skeleton w-36 h-4 block" /></td>
                    <td className="py-3 px-4 text-right"><span className="skeleton w-20 h-4 ml-auto block" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    No system audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{log.action}</td>
                    <td className="py-3.5 px-4">{log.entity}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] select-all">{log.entityId || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[10px]">
                      {formatDateTime(log.createdAt)}
                    </td>
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
