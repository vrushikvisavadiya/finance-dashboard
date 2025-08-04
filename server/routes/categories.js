import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createCategory,
  getCategories,
} from "../controllers/categoryController.js";

const router = Router();

router.post("/", auth, createCategory);
router.get("/", auth, getCategories);

export default router;
