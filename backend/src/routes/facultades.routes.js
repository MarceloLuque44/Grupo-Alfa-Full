import { Router } from "express";
import {
  getFacultades,
  getFacultadById,
  createFacultad,
  updateFacultad,
  deleteFacultad,
} from "../controllers/facultades.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createFacultadSchema,
  updateFacultadSchema,
} from "../validators/facultadesValidators.js";

const router = Router();

router.get("/facultades", authMiddleware, getFacultades);
router.get("/facultades/:id", authMiddleware, getFacultadById);
router.post("/facultades", authMiddleware, validateRequest(createFacultadSchema), createFacultad);
router.put("/facultades/:id", authMiddleware, validateRequest(updateFacultadSchema), updateFacultad);
router.delete("/facultades/:id", authMiddleware, deleteFacultad);

export default router;
