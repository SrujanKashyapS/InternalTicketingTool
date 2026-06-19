import { Link, useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Ticket, 
  BookOpen, 
  BarChart3, 
  Users, 
  Activity, 
  Menu, 
  ChevronLeft, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { isOpen, toggle } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
    links.push({ to: '/analytics', label: 'Analytics', icon: BarChart3 });
  }

  if (user?.role === 'ADMIN') {
    links.push(
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/audit-log', label: 'Audit Logs', icon: Activity }
    );
  }

  return (
    <aside className={cn(
      "fixed top-0 left-0 z-30 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col justify-between",
      isOpen ? "w-64" : "w-16"
    )}>
      <div>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent truncate">
                Ticketing Tool
              </span>
            )}
          </div>
          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200 w-full"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
