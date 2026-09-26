import { Router } from "express";
import {
  getAsignacionesMaterias,
  getAsignacionMateriasById,
  createAsignacionMaterias,
  updateAsignacionMaterias,
  deleteAsignacionMaterias,
} from "../controllers/asignacionesMaterias.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAsignacionMateriasSchema,
  updateAsignacionMateriasSchema,
} from "../validators/asignacionesMateriasValidators.js";

const router = Router();

router.get("/asignaciones-materias", authMiddleware, getAsignacionesMaterias);
router.get("/asignaciones-materias/:id", authMiddleware, getAsignacionMateriasById);
router.post("/asignaciones-materias", authMiddleware, validateRequest(createAsignacionMateriasSchema), createAsignacionMaterias);
router.put("/asignaciones-materias/:id", authMiddleware, validateRequest(updateAsignacionMateriasSchema), updateAsignacionMaterias);
router.delete("/asignaciones-materias/:id", authMiddleware, deleteAsignacionMaterias);

export default router;
