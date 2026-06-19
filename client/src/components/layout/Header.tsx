import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { notificationsAPI } from '@/lib/api';
import { Notification } from '@/types';
import { cn, formatDateTime } from '@/lib/utils';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  Sparkles, 
  User as UserIcon, 
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
  const { user } = useAuthStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const { isCopilotOpen, toggleCopilot } = useSidebarStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsAPI.list({ limit: 5 });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-96">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Global search (tickets, files, settings)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-muted/50 hover:bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-1.5 pl-10 pr-4 text-sm outline-none transition-all duration-200"
        />
      </form>

      {/* Toolbar / Actions */}
      <div className="flex items-center gap-4">
        {/* Copilot Activator (Visible to Agents and Admins) */}
        {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
          <button
            onClick={toggleCopilot}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border border-border",
              isCopilotOpen
                ? "bg-primary text-primary-foreground border-primary shadow"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Copilot</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg p-2 z-50">
              <div className="flex items-center justify-between p-2 border-b border-border">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={cn("p-2.5 rounded-lg text-xs transition-colors hover:bg-muted/50 flex justify-between gap-2 border-b border-border/50", !n.read && "bg-primary/5")}>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{n.title}</p>
                        <p className="text-muted-foreground mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 block">{formatDateTime(n.createdAt)}</span>
                      </div>
                      {!n.read && (
                        <button onClick={() => handleMarkAsRead(n.id)} className="text-primary hover:text-primary/80 self-center">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Details Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <span className="text-sm font-medium hidden md:inline">{user?.firstName}</span>
            <ChevronDown className="w-4 h-4 hidden md:inline" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50">
              <div className="px-2.5 py-2 border-b border-border/50">
                <p className="font-semibold text-sm text-foreground">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                  {user?.role}
                </span>
              </div>
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  My Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
