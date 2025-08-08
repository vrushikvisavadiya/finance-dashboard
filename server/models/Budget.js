// models/Budget.js
import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false, // ✅ Changed from required: true
    },
    name: {
      type: String,
      required: function () {
        return !this.categoryId; // Required only if no category is set
      },
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: "monthly",
    },
    budgetType: {
      type: String,
      enum: ["category", "overall", "custom"],
      default: function () {
        return this.categoryId ? "category" : "overall";
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Update the compound index
BudgetSchema.index({ userId: 1, categoryId: 1, period: 1 });
BudgetSchema.index({ userId: 1, name: 1, period: 1 }); // For custom budgets

export default mongoose.model("Budget", BudgetSchema);
