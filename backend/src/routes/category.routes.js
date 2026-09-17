import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validateUuidParam } from "../middlewares/validateUuid.middleware.js";

import {
  create,
  getAll,
  update,
  remove,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", authenticate, getAll);
router.post("/", authenticate, create);

router.put("/:id", authenticate, validateUuidParam, update);
router.delete("/:id", authenticate, validateUuidParam, remove);

export default router;