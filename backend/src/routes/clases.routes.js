import { Router } from "express";
import {
  getClases,
  getClaseById,
  createClase,
  updateClase,
  deleteClase,
} from "../controllers/clases.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createClaseSchema,
  updateClaseSchema,
} from "../validators/clasesValidators.js";

const router = Router();

router.get("/clases", authMiddleware, getClases);
router.get("/clases/:id", authMiddleware, getClaseById);
router.post("/clases", authMiddleware, validateRequest(createClaseSchema), createClase);
router.put("/clases/:id", authMiddleware, validateRequest(updateClaseSchema), updateClase);
router.delete("/clases/:id", authMiddleware, deleteClase);

export default router;
