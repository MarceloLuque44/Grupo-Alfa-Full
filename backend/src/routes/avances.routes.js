import { Router } from "express";
import {
  getAvances,
  getAvanceById,
  createAvance,
  updateAvance,
  deleteAvance,
} from "../controllers/avances.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAvanceSchema,
  updateAvanceSchema,
} from "../validators/avancesValidators.js";

const router = Router();

router.get("/avances", authMiddleware, getAvances);
router.get("/avances/:id", authMiddleware, getAvanceById);
router.post("/avances", authMiddleware, validateRequest(createAvanceSchema), createAvance);
router.put("/avances/:id", authMiddleware, validateRequest(updateAvanceSchema), updateAvance);
router.delete("/avances/:id", authMiddleware, deleteAvance);

export default router;
