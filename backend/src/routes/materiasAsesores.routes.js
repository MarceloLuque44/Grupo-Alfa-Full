import { Router } from "express";
import {
  getMateriasAsesores,
  getMateriasAsesoresById,
  createMateriasAsesores,
  updateMateriasAsesores,
  deleteMateriasAsesores,
} from "../controllers/materiasAsesores.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMateriasAsesoresSchema,
  updateMateriasAsesoresSchema,
} from "../validators/materiasAsesoresValidators.js";

const router = Router();

router.get("/materias-asesores", authMiddleware, getMateriasAsesores);
router.get("/materias-asesores/:id", authMiddleware, getMateriasAsesoresById);
router.post("/materias-asesores", authMiddleware, validateRequest(createMateriasAsesoresSchema), createMateriasAsesores);
router.put("/materias-asesores/:id", authMiddleware, validateRequest(updateMateriasAsesoresSchema), updateMateriasAsesores);
router.delete("/materias-asesores/:id", authMiddleware, deleteMateriasAsesores);

export default router;
