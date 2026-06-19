import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebarStore } from '@/stores/sidebarStore';
import { cn } from '@/lib/utils';
import AICopilotSidebar from '@/components/ai/AICopilotSidebar';

export default function AppLayout() {
  const { isOpen, isCopilotOpen } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className={cn('flex-1 flex flex-col overflow-hidden transition-all duration-300', isOpen ? 'ml-64' : 'ml-16')}>
        <Header />
        <main className={cn('flex-1 overflow-y-auto p-6 transition-all duration-300', isCopilotOpen && 'mr-80')}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      {isCopilotOpen && <AICopilotSidebar />}
    </div>
  );
}
