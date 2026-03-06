import Goal from "../models/Goal.js";
import SharedGoal from "../models/SharedGoal.js";
import { awardXP } from "../services/gamificationService.js";

const mapGoal = (goal) => ({ ...goal.toObject(), _id: goal._id, completed: goal.completed || goal.progress === 100 });

export const createGoal = async (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ message: "title is required" });
  const goal = await Goal.create({
    user: req.user._id,
    title: req.body.title.trim(),
    description: req.body.description,
    category: req.body.category,
    steps: Array.isArray(req.body.steps) ? req.body.steps : [],
    progress: Number(req.body.progress || 0),
    deadline: req.body.deadline,
    fromVision: !!req.body.fromVision,
  });

  await awardXP(req.user._id, "goal_created", "Goal", goal._id);
  res.status(201).json(mapGoal(goal));
};

export const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(goals.map(mapGoal));
};

export const updateGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: "Goal not found" });

  Object.assign(goal, req.body);
  if (typeof req.body.completed === "boolean") {
    goal.completed = req.body.completed;
    goal.progress = req.body.completed ? 100 : goal.progress;
  }
  if (goal.progress >= 100 && !goal.completed) goal.completed = true;
  if (goal.completed && !goal.completedAt) goal.completedAt = new Date();

  await goal.save();

  if (goal.completed) {
    await awardXP(req.user._id, "goal_completed", "Goal", goal._id);
  }

  res.json(mapGoal(goal));
};

export const deleteGoal = async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  await SharedGoal.deleteMany({ goal: req.params.id, owner: req.user._id });
  res.json({ message: "Goal deleted" });
};

export const shareGoal = async (req, res) => {
  const { collaboratorIds = [] } = req.body;
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: "Goal not found" });

  const shared = await SharedGoal.findOneAndUpdate(
    { goal: goal._id, owner: req.user._id },
    { $set: { collaborators: collaboratorIds } },
    { new: true, upsert: true }
  );

  res.json(shared);
};
