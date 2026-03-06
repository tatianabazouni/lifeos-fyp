import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { PrimaryButton } from '@/components/AppButtons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lifeData, type PlannerTaskData } from '@/lib/lifeData';

const taskTypeColors: Record<PlannerTaskData['type'], string> = {
  meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
  focus: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
  personal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
  task: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
};

const defaultTasks: PlannerTaskData[] = [
  { id: 'p1', title: 'Morning planning', dateKey: format(new Date(), 'yyyy-MM-dd'), startHour: 8, durationHours: 1, type: 'focus', note: 'Prioritize top 3 outcomes.' },
  { id: 'p2', title: 'Team sync', dateKey: format(new Date(), 'yyyy-MM-dd'), startHour: 10, durationHours: 1, type: 'meeting', note: 'Share blockers and next sprint scope.' },
];

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<PlannerTaskData[]>(() => {
    const saved = lifeData.getPlannerTasks();
    if (saved.length) return saved;
    lifeData.setPlannerTasks(defaultTasks);
    return defaultTasks;
  });

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [hour, setHour] = useState('9');
  const [duration, setDuration] = useState('1');
  const [type, setType] = useState<PlannerTaskData['type']>('task');

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localeNow = useMemo(() => new Intl.DateTimeFormat(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date()), []);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const todayTasks = useMemo(() => tasks.filter((task) => task.dateKey === selectedDateKey).sort((a, b) => a.startHour - b.startHour), [tasks, selectedDateKey]);

  const hourSlots = Array.from({ length: 14 }, (_, index) => index + 7);

  const saveTasks = (next: PlannerTaskData[]) => {
    setTasks(next);
    lifeData.setPlannerTasks(next);
  };

  const addTask = () => {
    if (!title.trim()) return;
    const task: PlannerTaskData = {
      id: crypto.randomUUID(),
      title: title.trim(),
      note: note.trim() || undefined,
      dateKey: selectedDateKey,
      startHour: Number(hour),
      durationHours: Number(duration),
      type,
      done: false,
    };
    saveTasks([...tasks, task]);
    setTitle('');
    setNote('');
  };

  const toggleDone = (id: string) => {
    saveTasks(tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  const removeTask = (id: string) => {
    saveTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planner"
        subtitle={`Live in your local region (${timeZone}) • ${localeNow}`}
      />

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="space-y-6 xl:col-span-1">
          <SectionContainer title="Current calendar" description="Based on your local timezone and realtime date.">
            <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} className="rounded-md border" />
          </SectionContainer>

          <SectionContainer title="Plan your day" description="Add tasks/events to the selected date.">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" className="mb-3" />
            <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" className="mb-3" />
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger><SelectValue placeholder="Start hour" /></SelectTrigger>
                <SelectContent>{Array.from({ length: 15 }, (_, i) => i + 7).map((h) => <SelectItem key={h} value={String(h)}>{String(h).padStart(2, '0')}:00</SelectItem>)}</SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4].map((d) => <SelectItem key={d} value={String(d)}>{d} hour{d > 1 ? 's' : ''}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Select value={type} onValueChange={(value) => setType(value as PlannerTaskData['type'])}>
              <SelectTrigger><SelectValue placeholder="Task type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="focus">Focus</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
            <PrimaryButton onClick={addTask} className="mt-3 w-full"><Plus className="mr-2 h-4 w-4" />Add to day</PrimaryButton>
          </SectionContainer>
        </div>

        <SectionContainer title={format(selectedDate, 'MMMM d, yyyy')} description="Day view timeline with your planned tasks." >
          <div className="space-y-3">
            {hourSlots.map((slot) => {
              const slotTasks = todayTasks.filter((task) => task.startHour === slot);
              return (
                <div key={slot} className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border p-2">
                  <div className="pt-2 text-sm text-muted-foreground">{String(slot).padStart(2, '0')}:00</div>
                  <div className="space-y-2">
                    {slotTasks.length ? slotTasks.map((task) => (
                      <div key={task.id} className={`rounded-lg p-3 ${taskTypeColors[task.type]}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium ${task.done ? 'line-through opacity-60' : ''}`}>{task.title}</p>
                            <p className="text-xs opacity-80">{task.note || 'No extra note'}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs opacity-80"><Clock3 className="h-3 w-3" />{String(task.startHour).padStart(2, '0')}:00 - {String(task.startHour + task.durationHours).padStart(2, '0')}:00</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => toggleDone(task.id)} className="rounded border border-black/10 bg-white/60 px-2 py-1 text-xs">{task.done ? 'Undo' : 'Done'}</button>
                            <button onClick={() => removeTask(task.id)} className="rounded border border-black/10 bg-white/60 p-1" aria-label="Delete task"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    )) : <div className="h-7 rounded border border-dashed" />}
                  </div>
                </div>
              );
            })}
          </div>
          {!todayTasks.length && <p className="mt-4 text-sm text-muted-foreground">No tasks scheduled for this date yet. Add one from the planner panel.</p>}
        </SectionContainer>
      </div>

      <SectionContainer title="Quick summary" description="See what your selected day looks like at a glance.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-3"><p className="caption-text">Total events</p><p className="text-2xl font-semibold">{todayTasks.length}</p></div>
          <div className="rounded-xl border p-3"><p className="caption-text">Completed</p><p className="text-2xl font-semibold">{todayTasks.filter((task) => task.done).length}</p></div>
          <div className="rounded-xl border p-3"><p className="caption-text">Focus hours</p><p className="text-2xl font-semibold">{todayTasks.filter((task) => task.type === 'focus').reduce((sum, task) => sum + task.durationHours, 0)}</p></div>
        </div>
      </SectionContainer>
    </div>
  );
}
