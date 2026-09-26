import { Router } from "express";
import {
  getExamenes,
  getExamenById,
  createExamen,
  updateExamen,
  deleteExamen,
} from "../controllers/examenes.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createExamenSchema,
  updateExamenSchema,
} from "../validators/examenesValidators.js";

const router = Router();

router.get("/examenes", authMiddleware, getExamenes);
router.get("/examenes/:id", authMiddleware, getExamenById);
router.post("/examenes", authMiddleware, validateRequest(createExamenSchema), createExamen);
router.put("/examenes/:id", authMiddleware, validateRequest(updateExamenSchema), updateExamen);
router.delete("/examenes/:id", authMiddleware, deleteExamen);

export default router;
