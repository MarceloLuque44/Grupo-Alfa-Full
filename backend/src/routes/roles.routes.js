import { Router } from "express";
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
} from "../controllers/roles.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createRolSchema,
  updateRolSchema,
} from "../validators/rolesValidators.js";

const router = Router();

router.get("/roles", authMiddleware, getRoles);
router.get("/roles/:id", authMiddleware, getRolById);
router.post("/roles", authMiddleware, validateRequest(createRolSchema), createRol);
router.put("/roles/:id", authMiddleware, validateRequest(updateRolSchema), updateRol);
router.delete("/roles/:id", authMiddleware, deleteRol);

export default router;
