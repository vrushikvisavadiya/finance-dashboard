/*
  Analytics Routes
  ----------------
  Provides dashboard-ready financial data and insights.
  All routes are protected by authentication middleware.
*/

import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getOverview,
  getMonthlyTrend,
  getExpensesByCategory,
  getRecentTransactions,
  getCurrentMonthSummary,
} from "../controllers/analyticsController.js";

const router = Router();

// Protect all analytics routes
router.use(auth);

// Dashboard overview (total income, expense, balance)
router.get("/overview", getOverview);

// Monthly trend data for charts
router.get("/monthly-trend", getMonthlyTrend);

// Expense breakdown by category
router.get("/expenses-by-category", getExpensesByCategory);

// Recent transactions preview
router.get("/recent-transactions", getRecentTransactions);

// Current month summary
router.get("/current-month", getCurrentMonthSummary);

export default router;
