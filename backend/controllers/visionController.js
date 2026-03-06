import VisionBoard from "../models/VisionBoard.js";
import VisionItem from "../models/VisionItem.js";
import Goal from "../models/Goal.js";
import { awardXP } from "../services/gamificationService.js";

export const getBoards = async (req, res) => {
  const boards = await VisionBoard.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(boards.map((board) => ({ ...board.toObject(), id: board._id })));
};

export const createBoard = async (req, res) => {
  const board = await VisionBoard.create({
    title: req.body.title,
    isPublic: !!req.body.isPublic,
    user: req.user._id,
  });
  res.status(201).json({ ...board.toObject(), id: board._id });
};

export const deleteBoard = async (req, res) => {
  const board = await VisionBoard.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  await VisionItem.deleteMany({ board: board._id, user: req.user._id });
  return res.json({ message: "Board deleted" });
};

export const getVisionItems = async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.boardId) {
    query.board = req.query.boardId;
  }

  const items = await VisionItem.find(query).sort({ createdAt: -1 });
  res.json(items.map((item) => ({ ...item.toObject(), id: item._id, boardId: item.board })));
};

export const createVisionItem = async (req, res) => {
  const item = await VisionItem.create({
    user: req.user._id,
    board: req.body.boardId,
    title: req.body.title,
    description: req.body.description,
    emoji: req.body.emoji,
    status: req.body.status || "dream",
    progress: req.body.progress || 0,
  });

  res.status(201).json({ ...item.toObject(), id: item._id, boardId: item.board });
};

export const updateVisionItem = async (req, res) => {
  const item = await VisionItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  Object.assign(item, req.body);
  await item.save();

  res.json({ ...item.toObject(), id: item._id, boardId: item.board });
};

export const deleteVisionItem = async (req, res) => {
  const item = await VisionItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ message: "Item deleted" });
};

export const convertToGoal = async (req, res) => {
  const item = await VisionItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const goal = await Goal.create({
    user: req.user._id,
    title: item.title,
    description: item.description,
    fromVision: true,
    category: "Personal",
  });

  await awardXP(req.user._id, "goal_created", "Goal", goal._id);
  res.status(201).json(goal);
};
