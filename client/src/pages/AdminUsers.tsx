import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Users, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users-list', page],
    queryFn: () => usersAPI.list({ page, limit: 15 }),
  });

  const users = usersRes?.data?.data?.users || [];
  const pagination = usersRes?.data?.data?.pagination || { total: 0, totalPages: 1, hasNext: false, hasPrev: false };

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => usersAPI.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list', page] });
      toast.success('User role updated successfully');
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });

  const handleRoleChange = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage employees, agents, and administrators permissions.</p>
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4"><span className="skeleton w-32 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-40 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-24 h-4 block" /></td>
                    <td className="py-4 px-4"><span className="skeleton w-20 h-4 block" /></td>
                    <td className="py-4 px-4 text-right"><span className="skeleton w-16 h-4 ml-auto block" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No users registered in system.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-4 px-4 text-muted-foreground">{u.department || 'None'}</td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-muted border border-border rounded-lg py-1 px-2.5 text-xs outline-none text-muted-foreground focus:text-foreground transition-all"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="AGENT">Agent</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
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
