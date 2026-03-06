import { useEffect, useState } from "react"; 
import api from '@/services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Goal {
  _id: string;
  title: string;
  completed: boolean;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!title.trim()) return;
    try {
      await api.post("/goals", { title });
      setTitle("");
      fetchGoals();
    } catch (err: any) {
      setError(err.message || "Failed to add goal");
    }
  };

  const toggleGoal = async (goal: Goal) => {
    try {
      await api.put(`/goals/${goal._id}`, { completed: !goal.completed });
      fetchGoals();
    } catch (err: any) {
      setError(err.message || "Failed to update goal");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await api.delete(`/goals/${id}`); 
      fetchGoals();
    } catch (err: any) {
      setError(err.message || "Failed to delete goal");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchGoals} />;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">My Goals</h1>
      <div className="flex mb-4 gap-2">
        <Input
          placeholder="New goal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Button onClick={addGoal}>
          <Plus className="h-4 w-4 mr-1" />Add
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Add your first goal to start tracking progress"
        />
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => (
            <motion.div
              key={goal._id}
              layout
              className="glass-card p-3 flex items-center justify-between"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleGoal(goal)}
              >
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={goal.completed ? "line-through text-muted-foreground" : ""}>
                  {goal.title}
                </span>
              </div>
              <button
                onClick={() => deleteGoal(goal._id)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;