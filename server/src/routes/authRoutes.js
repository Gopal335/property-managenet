import { Router } from "express";
import { getMe, getPublicAdminContact, login } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/admin-contact", getPublicAdminContact);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

export default router;
