import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["income", "expense"], default: "expense" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
