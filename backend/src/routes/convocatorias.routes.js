import { Router } from "express";
import {
  getConvocatorias,
  getConvocatoriaById,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
} from "../controllers/convocatorias.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createConvocatoriaSchema,
  updateConvocatoriaSchema,
} from "../validators/convocatoriasValidators.js";

const router = Router();

router.get("/convocatorias", authMiddleware, getConvocatorias);
router.get("/convocatorias/:id", authMiddleware, getConvocatoriaById);
router.post("/convocatorias", authMiddleware, validateRequest(createConvocatoriaSchema), createConvocatoria);
router.put("/convocatorias/:id", authMiddleware, validateRequest(updateConvocatoriaSchema), updateConvocatoria);
router.delete("/convocatorias/:id", authMiddleware, deleteConvocatoria);

export default router;
