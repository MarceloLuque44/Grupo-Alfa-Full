import { Router } from "express";
import {
  getAsesores,
  getAsesorById,
  createAsesor,
  updateAsesor,
  deleteAsesor,
} from "../controllers/asesores.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAsesorSchema,
  updateAsesorSchema,
} from "../validators/asesoresValidators.js";

const router = Router();

router.get("/asesores", authMiddleware, getAsesores);
router.get("/asesores/:id", authMiddleware, getAsesorById);
router.post("/asesores", authMiddleware, validateRequest(createAsesorSchema), createAsesor);
router.put("/asesores/:id", authMiddleware, validateRequest(updateAsesorSchema), updateAsesor);
router.delete("/asesores/:id", authMiddleware, deleteAsesor);

export default router;
