// routes/budgets.js
import express from "express";
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetOverview,
} from "../controllers/budgetController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/overview", getBudgetOverview);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
