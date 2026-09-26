import { Router } from "express";
import {
  getAulas,
  getAulaById,
  createAula,
  updateAula,
  deleteAula,
} from "../controllers/aulas.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAulaSchema,
  updateAulaSchema,
} from "../validators/aulasValidators.js";

const router = Router();

router.get("/aulas", authMiddleware, getAulas);
router.get("/aulas/:id", authMiddleware, getAulaById);
router.post("/aulas", authMiddleware, validateRequest(createAulaSchema), createAula);
router.put("/aulas/:id", authMiddleware, validateRequest(updateAulaSchema), updateAula);
router.delete("/aulas/:id", authMiddleware, deleteAula);

export default router;
