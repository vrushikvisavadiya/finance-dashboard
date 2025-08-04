import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  addTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transactionController.js";

const router = Router();

router.use(auth); // Protect everything below

router.post("/", addTransaction); // CREATE
router.get("/", listTransactions); // READ  all
router.get("/:id", getTransaction); // READ  one
router.put("/:id", updateTransaction); // UPDATE
router.delete("/:id", deleteTransaction); // DELETE
export default router;
