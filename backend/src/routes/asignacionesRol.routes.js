import { Router } from "express";
import {
  getAsignacionesRol,
  getAsignacionRolById,
  createAsignacionRol,
  updateAsignacionRol,
  deleteAsignacionRol,
} from "../controllers/asignacionesRol.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAsignacionRolSchema,
  updateAsignacionRolSchema,
} from "../validators/asignacionesRolValidators.js";

const router = Router();

router.get("/asignaciones-rol", authMiddleware, getAsignacionesRol);
router.get("/asignaciones-rol/:id", authMiddleware, getAsignacionRolById);
router.post("/asignaciones-rol", authMiddleware, validateRequest(createAsignacionRolSchema), createAsignacionRol);
router.put("/asignaciones-rol/:id", authMiddleware, validateRequest(updateAsignacionRolSchema), updateAsignacionRol);
router.delete("/asignaciones-rol/:id", authMiddleware, deleteAsignacionRol);

export default router;
