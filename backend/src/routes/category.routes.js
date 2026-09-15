import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  create,
  getAll,
  update,
  remove,
} from "../controllers/category.controller.js";


const router = Router();

router.get("/", authenticate, getAll);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);
export default router;