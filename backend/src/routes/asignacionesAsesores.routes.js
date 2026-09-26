import { Router } from "express";
import {
  getAsignacionesAsesores,
  getAsignacionAsesoresById,
  createAsignacionAsesores,
  updateAsignacionAsesores,
  deleteAsignacionAsesores,
} from "../controllers/asignacionesAsesores.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAsignacionAsesoresSchema,
  updateAsignacionAsesoresSchema,
} from "../validators/asignacionesAsesoresValidators.js";

const router = Router();

router.get("/asignaciones-asesores", authMiddleware, getAsignacionesAsesores);
router.get("/asignaciones-asesores/:id", authMiddleware, getAsignacionAsesoresById);
router.post("/asignaciones-asesores", authMiddleware, validateRequest(createAsignacionAsesoresSchema), createAsignacionAsesores);
router.put("/asignaciones-asesores/:id", authMiddleware, validateRequest(updateAsignacionAsesoresSchema), updateAsignacionAsesores);
router.delete("/asignaciones-asesores/:id", authMiddleware, deleteAsignacionAsesores);

export default router;
