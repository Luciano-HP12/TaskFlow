import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  register,
  login,
  me,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, me);

export default router;