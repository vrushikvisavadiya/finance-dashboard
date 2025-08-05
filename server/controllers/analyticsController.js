/*
  Analytics Controller
  --------------------
  Provides aggregated financial data for dashboard charts and summaries.
  All data is filtered by the authenticated user (req.user._id).
*/

import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

/* Helper: uniform success response */
const ok = (res, message, data) => res.json({ success: true, message, data });

/* Helper: uniform error response */
const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

/* --------------------------  OVERVIEW SUMMARY  -------------------------- */
/*
  Returns total income, total expenses, and net balance for the user.
  Perfect for dashboard cards showing "This Month" or "All Time" totals.
*/
export const getOverview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const overview = await Transaction.aggregate([
      // Step 1: Only get transactions for this user
      { $match: { userId: userId } },

      // Step 2: Group by transaction type (income/expense) and sum amounts
      {
        $group: {
          _id: "$type", // Group by "income" or "expense"
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Transform aggregation result into clean object
    let totalIncome = 0;
    let totalExpense = 0;

    overview.forEach((item) => {
      if (item._id === "income") totalIncome = item.total;
      if (item._id === "expense") totalExpense = item.total;
    });

    const netBalance = totalIncome - totalExpense;

    return ok(res, "Overview data retrieved successfully", {
      totalIncome,
      totalExpense,
      netBalance,
      summary: {
        income: `₹${totalIncome.toLocaleString()}`,
        expense: `₹${totalExpense.toLocaleString()}`,
        balance: `₹${netBalance.toLocaleString()}`,
      },
    });
  } catch (error) {
    console.error("Get Overview Error:", error);
    return fail(res, 500, "Failed to fetch overview data");
  }
};

/* --------------------------  MONTHLY TREND  -------------------------- */
/*
  Returns income and expense totals grouped by month for trend charts.
  Shows spending patterns over time.
*/
export const getMonthlyTrend = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const monthlyData = await Transaction.aggregate([
      // Step 1: Filter by user
      { $match: { userId: userId } },

      // Step 2: Extract year and month from date
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },

      // Step 3: Sort by year and month
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Transform data for frontend charts
    const trendData = {};

    monthlyData.forEach((item) => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}`;

      if (!trendData[monthKey]) {
        trendData[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }

      trendData[monthKey][item._id.type] = item.total;
    });

    // Convert to array for charts
    const chartData = Object.values(trendData);

    return ok(res, "Monthly trend data retrieved successfully", {
      monthlyTrend: chartData,
    });
  } catch (error) {
    console.error("Get Monthly Trend Error:", error);
    return fail(res, 500, "Failed to fetch monthly trend data");
  }
};

/* --------------------------  EXPENSES BY CATEGORY  -------------------------- */
/*
  Returns total spending grouped by category.
  Perfect for pie charts and category analysis.
*/
export const getExpensesByCategory = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const categoryData = await Transaction.aggregate([
      // Step 1: Filter by user and only expenses
      {
        $match: {
          userId: userId,
          type: "expense",
        },
      },

      // Step 2: Join with Category collection to get category names
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },

      // Step 3: Group by category and sum amounts
      {
        $group: {
          _id: "$category",
          categoryName: { $first: { $arrayElemAt: ["$categoryInfo.name", 0] } },
          totalSpent: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },

      // Step 4: Sort by total spent (highest first)
      { $sort: { totalSpent: -1 } },
    ]);

    // Calculate total for percentages
    const totalExpenses = categoryData.reduce(
      (sum, cat) => sum + cat.totalSpent,
      0
    );

    // Add percentage to each category
    const enrichedData = categoryData.map((cat) => ({
      categoryId: cat._id,
      categoryName: cat.categoryName || "Unknown",
      totalSpent: cat.totalSpent,
      transactionCount: cat.transactionCount,
      percentage:
        totalExpenses > 0
          ? ((cat.totalSpent / totalExpenses) * 100).toFixed(1)
          : 0,
      formattedAmount: `₹${cat.totalSpent.toLocaleString()}`,
    }));

    return ok(res, "Category expenses retrieved successfully", {
      categoryBreakdown: enrichedData,
      totalExpenses,
      formattedTotal: `₹${totalExpenses.toLocaleString()}`,
    });
  } catch (error) {
    console.error("Get Category Expenses Error:", error);
    return fail(res, 500, "Failed to fetch category expenses");
  }
};

/* --------------------------  RECENT TRANSACTIONS  -------------------------- */
/*
  Returns the most recent transactions for dashboard preview.
*/
export const getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .populate("category", "name type")
      .sort({ date: -1 })
      .limit(limit);

    return ok(res, "Recent transactions retrieved successfully", {
      recentTransactions,
    });
  } catch (error) {
    console.error("Get Recent Transactions Error:", error);
    return fail(res, 500, "Failed to fetch recent transactions");
  }
};

/* --------------------------  CURRENT MONTH SUMMARY  -------------------------- */
/*
  Returns income/expense totals for the current month only.
*/
export const getCurrentMonthSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    monthlyData.forEach((item) => {
      if (item._id === "income") {
        monthlyIncome = item.total;
        incomeCount = item.count;
      }
      if (item._id === "expense") {
        monthlyExpense = item.total;
        expenseCount = item.count;
      }
    });

    const monthlyBalance = monthlyIncome - monthlyExpense;

    return ok(res, "Current month summary retrieved successfully", {
      currentMonth: {
        month: now.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        income: monthlyIncome,
        expense: monthlyExpense,
        balance: monthlyBalance,
        incomeCount,
        expenseCount,
        totalTransactions: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    console.error("Get Current Month Summary Error:", error);
    return fail(res, 500, "Failed to fetch current month summary");
  }
};
