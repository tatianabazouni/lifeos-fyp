import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { InsightCard } from '@/components/ContentCards';

const journalFrequency = [
  { week: 'W1', entries: 4 },
  { week: 'W2', entries: 5 },
  { week: 'W3', entries: 3 },
  { week: 'W4', entries: 6 },
];
const emotionalTrend = [
  { day: 'Mon', calm: 6, anxious: 3 },
  { day: 'Tue', calm: 7, anxious: 2 },
  { day: 'Wed', calm: 5, anxious: 4 },
  { day: 'Thu', calm: 8, anxious: 2 },
  { day: 'Fri', calm: 7, anxious: 3 },
];
const goalProgress = [
  { goal: 'Wellbeing', progress: 62 },
  { goal: 'Startup', progress: 48 },
  { goal: 'Relationships', progress: 71 },
];
const memoryFrequency = [
  { label: 'Family', value: 6 },
  { label: 'Career', value: 5 },
  { label: 'Travel', value: 3 },
  { label: 'Self', value: 4 },
];

const colors = ['#C5005E', '#F26076', '#FF9760', '#FFD150'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="See patterns in journaling, emotions, progress, and memory density across your life." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InsightCard title="Journal frequency" insight="18 entries this month. Highest consistency appears after 9pm." />
        <InsightCard title="Emotional trend" insight="Calmness rising over the last two weeks with fewer anxiety spikes." />
        <InsightCard title="Goal progress" insight="Relationships is your fastest-growing dimension this quarter." />
        <InsightCard title="Memory frequency" insight="Most memories tagged around family and career turning points." />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionContainer title="Journal frequency">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={journalFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entries" fill="#C5005E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </SectionContainer>

        <SectionContainer title="Emotional trends">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={emotionalTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="calm" stroke="#458B73" strokeWidth={2} />
              <Line dataKey="anxious" stroke="#F26076" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionContainer>

        <SectionContainer title="Goal progress graph">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={goalProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="goal" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="progress" stroke="#FF9760" fill="#FF976033" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionContainer>

        <SectionContainer title="Memory frequency">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={memoryFrequency} dataKey="value" nameKey="label" outerRadius={90} label>
                {memoryFrequency.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </SectionContainer>
      </div>
    </div>
  );
}
