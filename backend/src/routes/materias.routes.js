import { Router } from "express";
import {
  getMaterias,
  getMateriaById,
  createMateria,
  updateMateria,
  deleteMateria,
} from "../controllers/materias.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMateriaSchema,
  updateMateriaSchema,
} from "../validators/materiasValidators.js";

const router = Router();

router.get("/materias", authMiddleware, getMaterias);
router.get("/materias/:id", authMiddleware, getMateriaById);
router.post("/materias", authMiddleware, validateRequest(createMateriaSchema), createMateria);
router.put("/materias/:id", authMiddleware, validateRequest(updateMateriaSchema), updateMateria);
router.delete("/materias/:id", authMiddleware, deleteMateria);

export default router;
