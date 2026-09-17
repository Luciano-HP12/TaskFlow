import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validateUuidParam } from "../middlewares/validateUuid.middleware.js";

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
router.post("/", authenticate, create);

router.get("/:id", authenticate, validateUuidParam, getById);
router.put("/:id", authenticate, validateUuidParam, update);
router.delete("/:id", authenticate, validateUuidParam, remove);
router.patch(
  "/:id/status",
  authenticate,
  validateUuidParam,
  updateStatus
);

export default router;