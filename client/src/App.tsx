import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import DashboardPage from '@/pages/Dashboard';
import TicketsPage from '@/pages/Tickets';
import TicketDetailPage from '@/pages/TicketDetail';
import CreateTicketPage from '@/pages/CreateTicket';
import KnowledgeBasePage from '@/pages/KnowledgeBase';
import KBUploadPage from '@/pages/KBUpload';
import KBDetailPage from '@/pages/KBDetail';
import AnalyticsPage from '@/pages/Analytics';
import AdminUsersPage from '@/pages/AdminUsers';
import SearchPage from '@/pages/Search';
import AuditLogPage from '@/pages/AuditLog';
import NotFoundPage from '@/pages/NotFound';

export default function App() {
  const { loadUser, isLoading } = useAuthStore();

  useEffect(() => { loadUser(); }, [loadUser]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading Internal Ticketing Tool...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: '!bg-card !text-card-foreground !border !border-border', duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="knowledge-base/upload" element={<KBUploadPage />} />
          <Route path="knowledge-base/:id" element={<KBDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
