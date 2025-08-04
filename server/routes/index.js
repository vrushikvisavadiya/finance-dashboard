// routes/index.js
import { Router } from "express";
import authRoutes from "./auth.js";
import transactionRoutes from "./transactions.js"; // for future
import categoryRoutes from "./categories.js"; // for future

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);

export default router;
