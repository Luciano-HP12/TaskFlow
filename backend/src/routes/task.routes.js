import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  create,
  getAll,
  getById,
  update,
  remove,
  updateStatus,
} from "../controllers/task.controller.js";

const router = Router();

router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getById);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

router.patch("/:id/status", authenticate, updateStatus);

export default router;