import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Sparkles, X } from 'lucide-react';
import { PropsWithChildren, type ComponentType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Navbar({ title, onMenu }: { title: string; onMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <button aria-label="Open sidebar" onClick={onMenu} className="rounded-md p-2 hover:bg-muted lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <p className="font-serif text-xl text-foreground/90">{title}</p>
        <Link to="/dashboard" className="hidden items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-xs text-primary md:flex">
          <Sparkles className="h-3.5 w-3.5" />
          LifeOS
        </Link>
      </div>
    </header>
  );
}

export function Sidebar({ open, onClose, items }: { open: boolean; onClose: () => void; items: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] }) {
  const location = useLocation();
  return (
    <>
      <AnimatePresence>
        {open && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close sidebar" />}
      </AnimatePresence>
      <aside className={cn('fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/10 bg-[#19040f]/95 p-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="mb-6 flex items-center justify-between">
          <Link className="flex items-center gap-2" to="/">
            <span className="rounded-lg bg-primary/15 p-2 text-primary"><Sparkles className="h-4 w-4" /></span>
            <span className="font-serif text-xl">LifeOS</span>
          </Link>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/10 lg:hidden"><X className="h-4 w-4" /></button>
        </div>
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={onClose} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', active ? 'bg-primary/15 text-primary' : 'text-white/70 hover:bg-white/10 hover:text-white')}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionContainer({ children, title, description }: PropsWithChildren<{ title?: string; description?: string }>) {
  return (
    <section className="rounded-2xl border border-white/10 bg-card/70 p-6 shadow-sm backdrop-blur-md">
      {title && <h2 className="font-serif text-2xl">{title}</h2>}
      {description && <p className="mb-4 mt-1 text-sm text-muted-foreground">{description}</p>}
      {children}
    </section>
  );
}

export function PageTransition({ children }: PropsWithChildren) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
