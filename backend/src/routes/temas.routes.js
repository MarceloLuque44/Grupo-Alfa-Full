import { Router } from "express";
import {
  getTemas,
  getTemaById,
  createTema,
  updateTema,
  deleteTema,
} from "../controllers/temas.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createTemaSchema, updateTemaSchema } from "../validators/temasValidators.js";

const router = Router();

router.get("/temas", authMiddleware, getTemas);
router.get("/temas/:id", authMiddleware, getTemaById);
router.post("/temas", authMiddleware, validateRequest(createTemaSchema), createTema);
router.put("/temas/:id", authMiddleware, validateRequest(updateTemaSchema), updateTema);
router.delete("/temas/:id", authMiddleware, deleteTema);

export default router;
