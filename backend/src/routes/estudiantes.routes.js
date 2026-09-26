import { Router } from "express";
import {
  getEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
} from "../controllers/estudiantes.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createEstudianteSchema,
  updateEstudianteSchema,
} from "../validators/estudiantesValidators.js";

const router = Router();

router.get("/estudiantes", authMiddleware, getEstudiantes);
router.get("/estudiantes/:id", authMiddleware, getEstudianteById);
router.post("/estudiantes", authMiddleware, validateRequest(createEstudianteSchema), createEstudiante);
router.put("/estudiantes/:id", authMiddleware, validateRequest(updateEstudianteSchema), updateEstudiante);
router.delete("/estudiantes/:id", authMiddleware, deleteEstudiante);

export default router;
