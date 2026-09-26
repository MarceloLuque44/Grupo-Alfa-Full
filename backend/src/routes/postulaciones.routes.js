import { Router } from "express";
import {
  getPostulaciones,
  getPostulacionById,
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
} from "../controllers/postulaciones.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPostulacionSchema,
  updatePostulacionSchema,
} from "../validators/postulacionesValidators.js";

const router = Router();

router.get("/postulaciones", authMiddleware, getPostulaciones);
router.get("/postulaciones/:id", authMiddleware, getPostulacionById);
router.post("/postulaciones", authMiddleware, validateRequest(createPostulacionSchema), createPostulacion);
router.put("/postulaciones/:id", authMiddleware, validateRequest(updatePostulacionSchema), updatePostulacion);
router.delete("/postulaciones/:id", authMiddleware, deletePostulacion);

export default router;
