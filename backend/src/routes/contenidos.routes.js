import { Router } from "express";
import {
  getContenidos,
  getContenidoById,
  createContenido,
  updateContenido,
  deleteContenido,
} from "../controllers/contenidos.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createContenidoSchema,
  updateContenidoSchema,
} from "../validators/contenidosValidators.js";

const router = Router();

router.get("/contenidos", authMiddleware, getContenidos);
router.get("/contenidos/:id", authMiddleware, getContenidoById);
router.post("/contenidos", authMiddleware, validateRequest(createContenidoSchema), createContenido);
router.put("/contenidos/:id", authMiddleware, validateRequest(updateContenidoSchema), updateContenido);
router.delete("/contenidos/:id", authMiddleware, deleteContenido);

export default router;
