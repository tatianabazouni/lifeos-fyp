import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: "VisionBoard" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: String,
    title: String,
    description: String,
    emoji: String,
    status: { type: String, enum: ["dream", "working", "reality"] },
    notes: String,
    progress: Number,
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("VisionItem", itemSchema);