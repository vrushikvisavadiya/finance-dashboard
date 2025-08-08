// controllers/budgetController.js - CORRECTED VERSION

import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import mongoose from "mongoose"; // ✅ Add this import
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
} from "date-fns";

const ok = (res, status, message, payload = {}) =>
  res.status(status).json({ success: true, message, data: payload });

const fail = (res, status, message, errors) =>
  res.status(status).json({ success: false, message, errors });

// Helper function to get period dates
const getPeriodDates = (period, date = new Date()) => {
  switch (period) {
    case "weekly":
      return { start: startOfWeek(date), end: endOfWeek(date) };
    case "monthly":
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case "yearly":
      return { start: startOfYear(date), end: endOfYear(date) };
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
};

// Create Budget - LOOKS GOOD ✅
export const createBudget = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      amount,
      period = "monthly",
      alertThreshold = 80,
      budgetType,
    } = req.body;

    if (!amount) {
      return fail(res, 400, "Amount is required");
    }

    // Validate based on budget type
    if (categoryId) {
      // Category-based budget
      const category = await Category.findOne({
        _id: categoryId,
        $or: [{ userId: req.user._id }, { isDefault: true }],
      });

      if (!category) {
        return fail(res, 404, "Category not found");
      }

      // Check if budget already exists for this category and period
      const { start, end } = getPeriodDates(period);
      const existingBudget = await Budget.findOne({
        userId: req.user._id,
        categoryId,
        period,
        startDate: { $lte: end },
        endDate: { $gte: start },
        isActive: true,
      });

      if (existingBudget) {
        return fail(
          res,
          409,
          "Budget already exists for this category and period"
        );
      }
    } else {
      // Overall or custom budget
      if (!name) {
        return fail(
          res,
          400,
          "Budget name is required when no category is specified"
        );
      }

      // Check if budget with same name already exists
      const { start, end } = getPeriodDates(period);
      const existingBudget = await Budget.findOne({
        userId: req.user._id,
        name,
        categoryId: { $exists: false },
        period,
        startDate: { $lte: end },
        endDate: { $gte: start },
        isActive: true,
      });

      if (existingBudget) {
        return fail(
          res,
          409,
          "Budget with this name already exists for the period"
        );
      }
    }

    const { start, end } = getPeriodDates(period);

    const budgetData = {
      userId: req.user._id,
      amount,
      period,
      startDate: start,
      endDate: end,
      alertThreshold,
    };

    if (categoryId) {
      budgetData.categoryId = categoryId;
      budgetData.budgetType = "category";
    } else {
      budgetData.name = name;
      budgetData.budgetType = budgetType || "overall";
    }

    const budget = await Budget.create(budgetData);

    const populatedBudget = await Budget.findById(budget._id).populate(
      "categoryId",
      "name type"
    );

    return ok(res, 201, "Budget created successfully", {
      budget: populatedBudget,
    });
  } catch (error) {
    console.error("Create Budget:", error);
    return fail(res, 500, "Server error");
  }
};

// Get Budgets - LOOKS GOOD ✅
export const getBudgets = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    const { start, end } = getPeriodDates(period);

    const budgets = await Budget.find({
      userId: req.user._id,
      isActive: true,
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).populate("categoryId", "name type");

    // Get spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        let spending;

        if (budget.categoryId) {
          // Category-specific budget
          spending = await Transaction.aggregate([
            {
              $match: {
                userId: req.user._id,
                category: budget.categoryId._id,
                type: "expense",
                date: { $gte: budget.startDate, $lte: budget.endDate },
              },
            },
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$amount" },
                transactionCount: { $sum: 1 },
              },
            },
          ]);
        } else {
          // Overall budget (all expenses)
          spending = await Transaction.aggregate([
            {
              $match: {
                userId: req.user._id,
                type: "expense",
                date: { $gte: budget.startDate, $lte: budget.endDate },
              },
            },
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$amount" },
                transactionCount: { $sum: 1 },
              },
            },
          ]);
        }

        const totalSpent = spending[0]?.totalSpent || 0;
        const percentage =
          budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
        const remaining = budget.amount - totalSpent;
        const isOverBudget = totalSpent > budget.amount;
        const shouldAlert = percentage >= budget.alertThreshold;

        return {
          ...budget.toObject(),
          displayName: budget.categoryId ? budget.categoryId.name : budget.name,
          spending: {
            totalSpent,
            percentage: Math.round(percentage * 100) / 100,
            remaining,
            isOverBudget,
            shouldAlert,
            transactionCount: spending[0]?.transactionCount || 0,
          },
        };
      })
    );

    return ok(res, 200, "Budgets fetched successfully", {
      budgets: budgetsWithSpending,
    });
  } catch (error) {
    console.error("Get Budgets:", error);
    return fail(res, 500, "Server error");
  }
};

// Update Budget - LOOKS GOOD ✅
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    ).populate("categoryId", "name type");

    if (!budget) {
      return fail(res, 404, "Budget not found");
    }

    return ok(res, 200, "Budget updated successfully", { budget });
  } catch (error) {
    console.error("Update Budget:", error);
    return fail(res, 500, "Server error");
  }
};

// Delete Budget - LOOKS GOOD ✅
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!budget) {
      return fail(res, 404, "Budget not found");
    }

    return ok(res, 200, "Budget deleted successfully");
  } catch (error) {
    console.error("Delete Budget:", error);
    return fail(res, 500, "Server error");
  }
};

// ✅ FIXED: Get Budget Overview/Stats
export const getBudgetOverview = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    const { start, end } = getPeriodDates(period);

    // Get all budgets for the period
    const budgets = await Budget.find({
      userId: req.user._id,
      isActive: true,
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).populate("categoryId", "name type");

    let totalBudget = 0;
    let totalSpent = 0;
    let budgetCount = budgets.length;
    let overBudgetCount = 0;
    let alertCount = 0;

    // Calculate spending for each budget
    for (const budget of budgets) {
      totalBudget += budget.amount;

      let spending;
      if (budget.categoryId) {
        // Category-specific budget
        spending = await Transaction.aggregate([
          {
            $match: {
              userId: req.user._id,
              category: budget.categoryId._id,
              type: "expense",
              date: { $gte: budget.startDate, $lte: budget.endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: "$amount" },
            },
          },
        ]);
      } else {
        // Overall budget (all expenses) - avoid double counting
        // For overall budgets, we should only count them once
        if (budget.budgetType === "overall") {
          spending = await Transaction.aggregate([
            {
              $match: {
                userId: req.user._id,
                type: "expense",
                date: { $gte: budget.startDate, $lte: budget.endDate },
              },
            },
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$amount" },
              },
            },
          ]);
        } else {
          spending = [{ totalSpent: 0 }];
        }
      }

      const budgetSpent = spending[0]?.totalSpent || 0;

      // Only add to totalSpent if it's a category budget or the first overall budget
      // This prevents double counting when you have both category and overall budgets
      if (budget.categoryId) {
        totalSpent += budgetSpent;
      } else if (budget.budgetType === "overall") {
        // For overall budgets, replace totalSpent instead of adding
        // This assumes you only have one overall budget per period
        totalSpent = Math.max(totalSpent, budgetSpent);
      }

      const percentage =
        budget.amount > 0 ? (budgetSpent / budget.amount) * 100 : 0;

      if (budgetSpent > budget.amount) {
        overBudgetCount++;
      }

      if (percentage >= budget.alertThreshold) {
        alertCount++;
      }
    }

    const stats = {
      totalBudget,
      totalSpent,
      budgetCount,
      overBudgetCount,
      alertCount,
      remainingBudget: totalBudget - totalSpent,
      overallPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };

    return ok(res, 200, "Budget overview fetched successfully", stats);
  } catch (error) {
    console.error("Get Budget Overview:", error);
    return fail(res, 500, "Server error");
  }
};
