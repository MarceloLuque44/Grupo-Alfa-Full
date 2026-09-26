import { Router } from "express";
import {
  getMatriculaciones,
  getMatriculacionById,
  createMatriculacion,
  updateMatriculacion,
  deleteMatriculacion,
} from "../controllers/matriculaciones.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMatriculacionSchema,
  updateMatriculacionSchema,
} from "../validators/matriculacionesValidators.js";

const router = Router();

router.get("/matriculaciones", authMiddleware, getMatriculaciones);
router.get("/matriculaciones/:id", authMiddleware, getMatriculacionById);
router.post("/matriculaciones", authMiddleware, validateRequest(createMatriculacionSchema), createMatriculacion);
router.put("/matriculaciones/:id", authMiddleware, validateRequest(updateMatriculacionSchema), updateMatriculacion);
router.delete("/matriculaciones/:id", authMiddleware, deleteMatriculacion);

export default router;
