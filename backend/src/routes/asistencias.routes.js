import { Router } from "express";
import {
  getAsistencias,
  getAsistenciaById,
  createAsistencia,
  updateAsistencia,
  deleteAsistencia,
} from "../controllers/asistencias.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAsistenciaSchema,
  updateAsistenciaSchema,
} from "../validators/asistenciasValidators.js";

const router = Router();

router.get("/asistencias", authMiddleware, getAsistencias);
router.get("/asistencias/:id", authMiddleware, getAsistenciaById);
router.post("/asistencias", authMiddleware, validateRequest(createAsistenciaSchema), createAsistencia);
router.put("/asistencias/:id", authMiddleware, validateRequest(updateAsistenciaSchema), updateAsistencia);
router.delete("/asistencias/:id", authMiddleware, deleteAsistencia);

export default router;
