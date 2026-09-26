import { Router } from "express";
import {
  getMensualidades,
  getMensualidadById,
  createMensualidad,
  updateMensualidad,
  deleteMensualidad,
} from "../controllers/mensualidades.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMensualidadSchema,
  updateMensualidadSchema,
} from "../validators/mensualidadesValidators.js";

const router = Router();

router.get("/mensualidades", authMiddleware, getMensualidades);
router.get("/mensualidades/:id", authMiddleware, getMensualidadById);
router.post("/mensualidades", authMiddleware, validateRequest(createMensualidadSchema), createMensualidad);
router.put("/mensualidades/:id", authMiddleware, validateRequest(updateMensualidadSchema), updateMensualidad);
router.delete("/mensualidades/:id", authMiddleware, deleteMensualidad);

export default router;
