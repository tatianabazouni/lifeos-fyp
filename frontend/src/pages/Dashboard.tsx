import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import {
  BookOpen, Target, Camera, Brain, Flame, Trophy, Star,
  TrendingUp, Plus, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardData {
  xp: number;
  xpToNext: number;
  level: number;
  streak: number;
  recentActivity: { id: string; type: string; title: string; date: string }[];
}

const quickActions = [
  { label: 'Add Memory', icon: Star, to: '/life-capsule', color: 'bg-primary/10 text-primary' },
  { label: 'Add Goal', icon: Target, to: '/goals', color: 'bg-success/10 text-success' },
  { label: 'Add Journal', icon: BookOpen, to: '/journal', color: 'bg-info/10 text-info' },
  { label: 'Daily Photo', icon: Camera, to: '/daily-photo', color: 'bg-warning/10 text-warning' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = () => {
    setLoading(true);
    api.get<DashboardData>('/dashboard')
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const xpPercent = data ? Math.round((data.xp / data.xpToNext) * 100) : 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp}>
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0] || 'there'} ✨
        </h1>
        <p className="page-subtitle">Here's your life at a glance</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="stat-label">Level</span>
          </div>
          <span className="stat-value">{data?.level || 1}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-xp" />
            <span className="stat-label">XP</span>
          </div>
          <span className="stat-value">{data?.xp || 0}</span>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-streak" />
            <span className="stat-label">Streak</span>
          </div>
          <span className="stat-value">{data?.streak || 0} days</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-level" />
            <span className="stat-label">Badges</span>
          </div>
          <span className="stat-value">0</span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold mb-3 font-serif">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, to, color }) => (
            <Link key={to} to={to}>
              <div className="glass-card p-4 hover:shadow-lg transition-all duration-200 group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-serif">Recent Activity</h2>
          <Link to="/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="glass-card divide-y divide-border">
          {data?.recentActivity?.length ? (
            data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">
                  {item.type === 'journal' ? '📝' : item.type === 'goal' ? '🎯' : item.type === 'photo' ? '📷' : '⭐'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No activity yet. Start by adding a journal entry or setting a goal!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
