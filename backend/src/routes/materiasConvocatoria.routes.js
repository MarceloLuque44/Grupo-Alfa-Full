import { Router } from "express";
import {
  getMateriasConvocatoria,
  getMateriasConvocatoriaById,
  createMateriasConvocatoria,
  updateMateriasConvocatoria,
  deleteMateriasConvocatoria,
} from "../controllers/materiasConvocatoria.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMateriasConvocatoriaSchema,
  updateMateriasConvocatoriaSchema,
} from "../validators/materiasConvocatoriaValidators.js";

const router = Router();

router.get("/materias-convocatoria", authMiddleware, getMateriasConvocatoria);
router.get("/materias-convocatoria/:id", authMiddleware, getMateriasConvocatoriaById);
router.post("/materias-convocatoria", authMiddleware, validateRequest(createMateriasConvocatoriaSchema), createMateriasConvocatoria);
router.put("/materias-convocatoria/:id", authMiddleware, validateRequest(updateMateriasConvocatoriaSchema), updateMateriasConvocatoria);
router.delete("/materias-convocatoria/:id", authMiddleware, deleteMateriasConvocatoria);

export default router;
