import { useEffect, useState } from 'react';
import api from '@/services/api';
import { LoadingSpinner, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  goalsCompletion: { month: string; completed: number; total: number }[];
  moodTrends: { date: string; score: number }[];
  growth: { category: string; value: number }[];
  summary: { totalEntries: number; goalsCompleted: number; streak: number; level: number };
}

const COLORS = ['hsl(170, 55%, 30%)', 'hsl(35, 90%, 55%)', 'hsl(145, 60%, 40%)', 'hsl(200, 80%, 50%)', 'hsl(260, 60%, 55%)'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch_ = () => {
    setLoading(true);
    api.get<AnalyticsData>('/analytics')
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetch_} />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track your growth and progress</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /><span className="stat-label">Entries</span></div>
          <span className="stat-value">{data?.summary?.totalEntries || 0}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2"><Target className="h-4 w-4 text-success" /><span className="stat-label">Goals Done</span></div>
          <span className="stat-value">{data?.summary?.goalsCompleted || 0}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-streak" /><span className="stat-label">Streak</span></div>
          <span className="stat-value">{data?.summary?.streak || 0}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-level" /><span className="stat-label">Level</span></div>
          <span className="stat-value">{data?.summary?.level || 1}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="font-semibold mb-4 font-serif">Goals Completion</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.goalsCompletion || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="completed" fill="hsl(170, 55%, 30%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-semibold mb-4 font-serif">Mood Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.moodTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="hsl(35, 90%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(35, 90%, 55%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4 font-serif">Growth by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data?.growth || []} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                {(data?.growth || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
