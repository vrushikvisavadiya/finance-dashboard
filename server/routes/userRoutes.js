import { Router } from "express";
import auth from "../middleware/auth.js";
import { getMe, changePassword } from "../controllers/userController.js";

const router = Router();

router.get("/me", auth, getMe); // GET  /api/users/me
router.put("/change-password", auth, changePassword); // PATCH /api/users/change-password

export default router;
