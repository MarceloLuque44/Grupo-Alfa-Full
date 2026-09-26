import { Router } from "express";
import {
  getApoderados,
  getApoderadoById,
  createApoderado,
  updateApoderado,
  deleteApoderado,
} from "../controllers/apoderados.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createApoderadoSchema,
  updateApoderadoSchema,
} from "../validators/apoderadosValidators.js";

const router = Router();

router.get("/apoderados", authMiddleware, getApoderados);
router.get("/apoderados/:id", authMiddleware, getApoderadoById);
router.post("/apoderados", authMiddleware, validateRequest(createApoderadoSchema), createApoderado);
router.put("/apoderados/:id", authMiddleware, validateRequest(updateApoderadoSchema), updateApoderado);
router.delete("/apoderados/:id", authMiddleware, deleteApoderado);

export default router;
