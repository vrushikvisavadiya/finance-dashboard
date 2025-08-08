// routes/index.js
import { Router } from "express";
import authRoutes from "./auth.js";
import transactionRoutes from "./transactions.js";
import categoryRoutes from "./categories.js";
import analyticsRoutes from "./analytics.js";
import userRoutes from "./userRoutes.js";
import budgetRoutes from "./budgets.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/analytics", analyticsRoutes);

router.use("/users", userRoutes);
router.use("/budgets", budgetRoutes);

export default router;
