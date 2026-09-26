import { Router } from "express";
import {
  getCarreras,
  getCarreraById,
  createCarrera,
  updateCarrera,
  deleteCarrera,
} from "../controllers/carreras.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createCarreraSchema,
  updateCarreraSchema,
} from "../validators/carrerasValidators.js";

const router = Router();

router.get("/carreras", authMiddleware, getCarreras);
router.get("/carreras/:id", authMiddleware, getCarreraById);
router.post("/carreras", authMiddleware, validateRequest(createCarreraSchema), createCarrera);
router.put("/carreras/:id", authMiddleware, validateRequest(updateCarreraSchema), updateCarrera);
router.delete("/carreras/:id", authMiddleware, deleteCarrera);

export default router;
