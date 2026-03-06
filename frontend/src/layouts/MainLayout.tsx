import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, CalendarDays, Camera, Clock, Eye, LayoutDashboard, Settings, Target, Users } from 'lucide-react';
import { BarChart3, BookOpen, Brain, Camera, Clock, Eye, LayoutDashboard, Settings, Target, Users } from 'lucide-react';
import { Navbar, PageTransition, Sidebar } from '@/components/LayoutComponents';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/ai', icon: Brain, label: 'AI Companion' },
  { to: '/vision-boards', icon: Eye, label: 'Vision Boards' },
  { to: '/life-capsule', icon: Clock, label: 'Life Capsule' },
  { to: '/connections', icon: Users, label: 'Connections' },
  { to: '/daily-photo', icon: Camera, label: 'Daily Photo' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/planner', icon: CalendarDays, label: 'Planner' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const title = useMemo(() => navItems.find((item) => item.to === location.pathname)?.label ?? 'LifeOS', [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} items={navItems} />
      <div className="lg:pl-72">
        <Navbar title={title} onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
