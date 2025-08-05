// routes/index.js
import { Router } from "express";
import authRoutes from "./auth.js";
import transactionRoutes from "./transactions.js";
import categoryRoutes from "./categories.js";
import analyticsRoutes from "./analytics.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/analytics", analyticsRoutes);

router.use("/users", userRoutes);

export default router;
