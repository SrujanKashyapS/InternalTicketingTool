import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return colors[priority] || colors.MEDIUM;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    IN_PROGRESS: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    WAITING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    CLOSED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
  return colors[status] || colors.OPEN;
}

export function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    IT: 'bg-blue-500/10 text-blue-500',
    HR: 'bg-pink-500/10 text-pink-500',
    PAYROLL: 'bg-emerald-500/10 text-emerald-500',
    FACILITIES: 'bg-amber-500/10 text-amber-500',
    SECURITY: 'bg-red-500/10 text-red-500',
    OPERATIONS: 'bg-violet-500/10 text-violet-500',
    OTHER: 'bg-gray-500/10 text-gray-500',
  };
  return colors[category] || colors.OTHER;
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
